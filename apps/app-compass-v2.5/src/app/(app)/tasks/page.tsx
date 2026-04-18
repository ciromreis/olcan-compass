'use client'

import { useEffect, useState } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { TaskToastContainer } from '@/components/tasks/TaskToast'
import { Plus, ListTodo, Calendar, X } from 'lucide-react'
import { TaskCreateForm } from '@/components/tasks/TaskCreateForm'
import { TaskCalendar } from '@/components/tasks/TaskCalendar'
import { TaskExportButton } from '@/components/tasks/TaskExport'
import { PageHeader, Skeleton } from '@/components/ui'
import { useHydration } from '@/hooks/use-hydration'

type TabView = 'tarefas' | 'calendario'

export default function TasksPage() {
  const ready = useHydration()
  const { fetchAll, isLoading, statistics } = useTaskStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<TabView>('tarefas')

  useEffect(() => {
    if (ready) fetchAll()
  }, [ready, fetchAll])

  if (!ready || (isLoading && !statistics)) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem]" />)}
        </div>
        <Skeleton className="h-64 rounded-[1.5rem]" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Tarefas"
        subtitle="Organize a execucao do dossie por listas, calendario e proximos passos operacionais"
        actions={
          <div className="flex items-center gap-3">
            <TaskExportButton />
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 rounded-[1.2rem] bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
            </button>
          </div>
        }
      />

      {/* Summary cards */}
      {statistics && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Pendentes" value={statistics.pending_tasks + statistics.in_progress_tasks} />
          <SummaryCard label="Concluidas" value={statistics.completed_tasks} />
          <SummaryCard label="Taxa de conclusao" value={`${Math.round(statistics.completion_rate)}%`} />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 rounded-[1.2rem] border border-slate-200 bg-white/80 p-1 shadow-sm">
        <TabButton active={activeTab === 'tarefas'} onClick={() => setActiveTab('tarefas')} icon={ListTodo} label="Tarefas" />
        <TabButton active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} icon={Calendar} label="Calendario" />
      </div>

      {/* Content */}
      {activeTab === 'tarefas' ? <TaskList /> : <TaskCalendar />}

      {/* Detail modal */}
      <TaskDetail />

      {/* Create modal */}
      {showCreateForm && (
        <CreateTaskModal onClose={() => setShowCreateForm(false)} />
      )}

      <TaskToastContainer />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof ListTodo; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
        active ? 'bg-slate-950 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function CreateTaskModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20">
        <div className="mb-20 w-full max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Criar nova tarefa</h2>
              <p className="mt-1 text-sm text-slate-500">Adicione um passo a sua jornada</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          <div className="p-6">
            <TaskCreateForm onSuccess={onClose} onCancel={onClose} />
          </div>
        </div>
      </div>
    </>
  )
}
