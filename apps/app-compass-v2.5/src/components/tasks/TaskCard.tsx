'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/lib/taskTypes'
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
} from '@/lib/taskTypes'
import {
  Calendar,
  CheckCircle,
  Clock,
  Play,
  FileText, Globe, DollarSign, Home, Users, Mic, Stamp,
  Palette, Heart, GraduationCap, Briefcase, PenLine,
} from 'lucide-react'
import type { TaskCategory } from '@/lib/taskTypes'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_ICON_MAP: Record<TaskCategory, LucideIcon> = {
  DOCUMENTATION: FileText, LANGUAGE: Globe, FINANCE: DollarSign, HOUSING: Home,
  NETWORKING: Users, INTERVIEW: Mic, VISA: Stamp, CULTURAL_PREP: Palette,
  HEALTH: Heart, EDUCATION: GraduationCap, EMPLOYMENT: Briefcase, CUSTOM: PenLine,
}

interface TaskCardProps { task: Task }

export function TaskCard({ task }: TaskCardProps) {
  const { startTask, completeTask, selectTask, isCompleting } = useTaskStore()
  const Icon = CATEGORY_ICON_MAP[task.category] ?? FileText
  const isCompletingThis = isCompleting && task.status === 'IN_PROGRESS'

  const handle = (fn: (id: string) => Promise<unknown>) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn(task.id).catch(() => {})
  }

  return (
    <div
      onClick={() => selectTask(task)}
      className={`rounded-[1.4rem] border-l-4 border border-slate-200 bg-white/80 p-5 cursor-pointer shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${TASK_PRIORITY_COLORS[task.priority]} ${
        isCompletingThis ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 flex-shrink-0">
            <Icon className="h-4.5 w-4.5 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-950 truncate">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{task.description}</p>
            )}
          </div>
        </div>
        <span className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${TASK_STATUS_COLORS[task.status]}`}>
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
        <span className="font-semibold text-[11px] uppercase tracking-wide text-slate-400">
          {TASK_CATEGORY_LABELS[task.category]}
        </span>
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(task.due_date), "d 'de' MMM", { locale: ptBR })}
          </span>
        )}
        {task.estimated_hours ? (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {task.estimated_hours >= 60 ? `${Math.floor(task.estimated_hours / 60)}h${task.estimated_hours % 60 ? ` ${task.estimated_hours % 60}min` : ''}` : `${task.estimated_hours}min`}
          </span>
        ) : null}
        {task.subtask_count && task.subtask_count > 0 ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            {task.completed_subtasks || 0}/{task.subtask_count}
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-100">
        {task.status === 'PENDING' && (
          <button onClick={handle(startTask)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
            <Play className="h-3.5 w-3.5" />
            Iniciar
          </button>
        )}
        {task.status === 'IN_PROGRESS' && (
          <button onClick={handle(completeTask)} disabled={isCompletingThis} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {isCompletingThis ? (
              <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Concluindo...</>
            ) : (
              <><CheckCircle className="h-3.5 w-3.5" /> Concluir</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
