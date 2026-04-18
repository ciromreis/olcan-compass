'use client'

import { useTaskStore } from '@/stores/taskStore'
import { TaskCard } from './TaskCard'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/taskTypes'
import { Filter, ArrowUpDown, ListTodo } from 'lucide-react'
import { EmptyState, Skeleton } from '@/components/ui'

export function TaskList() {
  const { tasks, isLoading, filters, updateFilters } = useTaskStore()

  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[1.4rem]" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <TaskEmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white/80 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            <strong>{tasks.length}</strong> {tasks.length === 1 ? 'tarefa' : 'tarefas'}
          </span>

          {filters.status && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              {TASK_STATUS_LABELS[filters.status]}
              <button onClick={() => updateFilters({ status: undefined })} className="ml-0.5 hover:text-brand-900">&times;</button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {TASK_PRIORITY_LABELS[filters.priority]}
              <button onClick={() => updateFilters({ priority: undefined })} className="ml-0.5 hover:text-slate-900">&times;</button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sort_by || 'created_at'}
            onChange={(e) => updateFilters({ sort_by: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="created_at">Data de criacao</option>
            <option value="due_date">Prazo</option>
            <option value="priority">Prioridade</option>
            <option value="title">Titulo</option>
          </select>
          <button
            onClick={() => updateFilters({ sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc' })}
            className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

function TaskEmptyState() {
  const { filters, updateFilters } = useTaskStore()
  const hasFilters = filters.status || filters.priority || filters.category || filters.search

  return (
    <EmptyState
      icon={ListTodo}
      title={hasFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
      description={hasFilters
        ? 'Ajuste os filtros para ver mais tarefas.'
        : 'Crie sua primeira tarefa para organizar sua jornada de mobilidade.'}
      action={hasFilters ? (
        <button
          onClick={() => updateFilters({ status: undefined, priority: undefined, category: undefined, search: undefined })}
          className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          Limpar filtros
        </button>
      ) : undefined}
    />
  )
}
