'use client'

import { useTaskStore } from '@/stores/taskStore'
import {
  TASK_CATEGORY_LABELS,
  type TaskPriority,
  type TaskCategory,
} from '@/lib/taskTypes'
import { 
  Search, 
  X,
  LayoutGrid,
  ListTodo,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText, Globe, DollarSign, Home, Users, Mic, Stamp,
  Palette, Heart, GraduationCap, Briefcase, PenLine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  DOCUMENTATION: FileText, LANGUAGE: Globe, FINANCE: DollarSign, HOUSING: Home,
  NETWORKING: Users, INTERVIEW: Mic, VISA: Stamp, CULTURAL_PREP: Palette,
  HEALTH: Heart, EDUCATION: GraduationCap, EMPLOYMENT: Briefcase, CUSTOM: PenLine,
}

export function TaskSidebar() {
  const { filters, updateFilters, statistics } = useTaskStore()
  
  const categories = (Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((key) => ({
    value: key,
    label: TASK_CATEGORY_LABELS[key],
    Icon: CATEGORY_ICONS[key],
  }))
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 mb-1">Tarefas</h2>
        <p className="text-sm text-slate-600">Gerencie sua jornada</p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          aria-label="Buscar tarefas"
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value || undefined })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {filters.search && (
          <button
            onClick={() => updateFilters({ search: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>
      
      {/* Quick Stats */}
      {statistics && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-2xl font-bold text-blue-900">{statistics.total_tasks}</p>
            <p className="text-xs text-blue-700">Total</p>
          </div>
          <div className="rounded-xl bg-green-50 p-3">
            <p className="text-2xl font-bold text-green-900">{statistics.completed_tasks}</p>
            <p className="text-xs text-green-700">Concluidas</p>
          </div>
        </div>
      )}
      
      {/* Status Filter */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-950">Status</h3>
        <div className="space-y-1">
          <StatusFilterButton
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Todas"
            active={!filters.status}
            onClick={() => updateFilters({ status: undefined })}
          />
          <StatusFilterButton
            icon={<Clock className="h-4 w-4" />}
            label="Pendentes"
            active={filters.status === 'PENDING'}
            onClick={() => updateFilters({ status: 'PENDING' })}
          />
          <StatusFilterButton
            icon={<ListTodo className="h-4 w-4" />}
            label="Em Progresso"
            active={filters.status === 'IN_PROGRESS'}
            onClick={() => updateFilters({ status: 'IN_PROGRESS' })}
          />
          <StatusFilterButton
            icon={<CheckCircle className="h-4 w-4" />}
            label="Concluidas"
            active={filters.status === 'COMPLETED'}
            onClick={() => updateFilters({ status: 'COMPLETED' })}
          />
          <StatusFilterButton
            icon={<AlertCircle className="h-4 w-4" />}
            label="Bloqueadas"
            active={filters.status === 'BLOCKED'}
            onClick={() => updateFilters({ status: 'BLOCKED' })}
          />
        </div>
      </div>
      
      {/* Priority Filter */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-950">Prioridade</h3>
        <div className="space-y-1">
          {[
            { value: 'CRITICAL' as TaskPriority, label: 'Critica' },
            { value: 'HIGH' as TaskPriority, label: 'Alta' },
            { value: 'MEDIUM' as TaskPriority, label: 'Media' },
            { value: 'LOW' as TaskPriority, label: 'Baixa' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                updateFilters({
                  priority: filters.priority === value ? undefined : value,
                })
              }
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                filters.priority === value
                  ? 'bg-slate-100 text-slate-900'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <PriorityBadge priority={value} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Category Filter */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-950">Categoria</h3>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          <button
            onClick={() => updateFilters({ category: undefined })}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              !filters.category
                ? 'bg-blue-100 text-blue-900'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
            <span>Todas Categorias</span>
          </button>
          {categories.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() =>
                updateFilters({
                  category: filters.category === value ? undefined : value,
                })
              }
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                filters.category === value
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Helper Components
// ============================================================

function StatusFilterButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-slate-100 text-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-slate-500',
    MEDIUM: 'bg-slate-500',
    LOW: 'bg-green-500',
  }
  
  return <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
}
