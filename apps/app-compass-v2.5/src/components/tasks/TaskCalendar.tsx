'use client'

import { useState, useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { TaskDetail } from './TaskDetail'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-500 border-red-600',
  HIGH: 'bg-slate-500 border-slate-600',
  MEDIUM: 'bg-slate-500 border-slate-600',
  LOW: 'bg-green-500 border-green-600',
}

const priorityColorsLight: Record<string, string> = {
  CRITICAL: 'bg-red-100 border-red-300 text-red-800',
  HIGH: 'bg-slate-100 border-slate-300 text-slate-800',
  MEDIUM: 'bg-slate-100 border-slate-300 text-slate-800',
  LOW: 'bg-green-100 border-green-300 text-green-800',
}

export function TaskCalendar() {
  const { tasks, selectTask } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Calendar navigation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return isSameDay(taskDate, date)
    })
  }

  // Tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Day names
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

  // Statistics for current month
  const monthStats = useMemo(() => {
    const monthTasks = tasks.filter((task) => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return isSameMonth(taskDate, currentDate)
    })

    return {
      total: monthTasks.length,
      completed: monthTasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: monthTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      pending: monthTasks.filter((t) => t.status === 'PENDING').length,
    }
  }, [tasks, currentDate])

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <p className="text-sm text-slate-500">
                {monthStats.total} {monthStats.total === 1 ? 'tarefa' : 'tarefas'} neste mes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 transition-colors text-sm font-semibold"
            >
              Hoje
            </button>
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Statistics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-brand-700">{monthStats.total}</div>
            <div className="text-xs text-brand-600">Total</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{monthStats.completed}</div>
            <div className="text-xs text-emerald-600">Concluidas</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-700">{monthStats.inProgress}</div>
            <div className="text-xs text-slate-600">Em andamento</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-700">{monthStats.pending}</div>
            <div className="text-xs text-slate-500">Pendentes</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg" />
          ))}

          {/* Days in month */}
          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDate(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isTodayDate = isToday(day)
            const isInMonth = isSameMonth(day, currentDate)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`h-24 p-2 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isTodayDate
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${!isInMonth ? 'opacity-50' : ''}`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      isTodayDate
                        ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-gray-500">{dayTasks.length}</span>
                  )}
                </div>

                {/* Task Indicators */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`h-1.5 rounded-full ${priorityColors[task.priority]}`}
                      title={task.title}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Tasks Panel */}
      {selectedDate && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-950">
              Tarefas de {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Limpar
            </button>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-slate-500">Nenhuma tarefa agendada para esta data</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => selectTask(task)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md text-left ${
                    priorityColorsLight[task.priority]
                  }`}
                >
                  <FlagIcon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{task.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {task.estimated_hours}h
                      </span>
                      <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetail />
    </div>
  )
}
