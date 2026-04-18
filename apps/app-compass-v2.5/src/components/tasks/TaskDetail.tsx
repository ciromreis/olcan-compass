'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTaskStore } from '@/stores/taskStore'
import { SubtaskList } from './SubtaskList'
import type { Task, TaskUpdateRequest, TaskPriority } from '@/lib/taskTypes'
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
} from '@/lib/taskTypes'
import { X, Calendar, Clock, Edit3, Trash2, Save, CheckCircle, Play } from 'lucide-react'

export function TaskDetail() {
  const { selectedTask, selectTask, updateTask, deleteTask, isCompleting } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<{ title: string; description: string; priority: TaskPriority; due_date: string; estimated_hours: number; notes: string }>({ title: '', description: '', priority: 'MEDIUM', due_date: '', estimated_hours: 0, notes: '' })

  if (!selectedTask) return null

  const handleEdit = () => {
    setEditForm({
      title: selectedTask.title,
      description: selectedTask.description || '',
      priority: selectedTask.priority,
      due_date: selectedTask.due_date ? selectedTask.due_date.split('T')[0] : '',
      estimated_hours: selectedTask.estimated_hours || 0,
      notes: selectedTask.notes || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const data: TaskUpdateRequest = {
        title: editForm.title, description: editForm.description || undefined,
        priority: editForm.priority, due_date: editForm.due_date || undefined,
        estimated_hours: editForm.estimated_hours || undefined, notes: editForm.notes || undefined,
      }
      await updateTask(selectedTask.id, data)
      setIsEditing(false)
    } catch { /* handled by store */ }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try { await deleteTask(selectedTask.id); selectTask(null) } catch { /* */ }
    }
  }

  const handleClose = () => { selectTask(null); setIsEditing(false) }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className={`p-6 border-l-4 ${TASK_PRIORITY_COLORS[selectedTask.priority]} bg-slate-50`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-xl font-semibold text-slate-950 w-full border-b-2 border-brand-500 focus:outline-none bg-transparent" autoFocus />
                ) : (
                  <h2 className="text-xl font-semibold text-slate-950">{selectedTask.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${TASK_STATUS_COLORS[selectedTask.status]}`}>
                    {TASK_STATUS_LABELS[selectedTask.status]}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600">
                    {TASK_CATEGORY_LABELS[selectedTask.category]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {!isEditing && (
                  <>
                    <button onClick={handleEdit} className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Editar">
                      <Edit3 className="h-4.5 w-4.5 text-slate-500" />
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-rose-100 transition-colors" title="Excluir">
                      <Trash2 className="h-4.5 w-4.5 text-rose-500" />
                    </button>
                  </>
                )}
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Fechar">
                  <X className="h-4.5 w-4.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isEditing ? <EditForm form={editForm} onChange={setEditForm} /> : <ViewMode task={selectedTask} />}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <SubtaskList taskId={selectedTask.id} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            {isEditing ? (
              <div className="flex gap-3 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                  <Save className="h-4 w-4" /> Salvar
                </button>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                {selectedTask.status === 'PENDING' && (
                  <button onClick={() => useTaskStore.getState().startTask(selectedTask.id)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
                    <Play className="h-4 w-4" /> Iniciar
                  </button>
                )}
                {selectedTask.status === 'IN_PROGRESS' && (
                  <button onClick={() => useTaskStore.getState().completeTask(selectedTask.id)} disabled={isCompleting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    {isCompleting ? 'Concluindo...' : <><CheckCircle className="h-4 w-4" /> Concluir</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ViewMode({ task }: { task: Task }) {
  const fmt = (d: string) => format(new Date(d), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })
  return (
    <div className="space-y-5">
      {task.description && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1.5">Descricao</h3>
          <p className="text-slate-900 whitespace-pre-wrap text-sm">{task.description}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {task.due_date && <InfoItem icon={<Calendar className="h-4 w-4 text-brand-500" />} label="Prazo" value={format(new Date(task.due_date), "d 'de' MMM, yyyy", { locale: ptBR })} />}
        {task.estimated_hours ? <InfoItem icon={<Clock className="h-4 w-4 text-purple-500" />} label="Tempo estimado" value={`${Math.floor(task.estimated_hours / 60)}h ${task.estimated_hours % 60}min`} /> : null}
      </div>
      {task.notes && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1.5">Observacoes</h3>
          <p className="text-slate-800 whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">{task.notes}</p>
        </div>
      )}
      <div className="text-xs text-slate-400 space-y-0.5 pt-4 border-t border-slate-200">
        <p>Criada: {fmt(task.created_at)}</p>
        {task.started_at && <p>Iniciada: {fmt(task.started_at)}</p>}
        {task.completed_at && <p>Concluida: {fmt(task.completed_at)}</p>}
        <p>Atualizada: {fmt(task.updated_at)}</p>
      </div>
    </div>
  )
}

function EditForm({ form, onChange }: { form: { title: string; description: string; priority: TaskPriority; due_date: string; estimated_hours: number; notes: string }; onChange: (f: { title: string; description: string; priority: TaskPriority; due_date: string; estimated_hours: number; notes: string }) => void }) {
  const fc = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Descricao</label>
        <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={3} className={`${fc} resize-none`} placeholder="Descricao da tarefa..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Prioridade</label>
          <select value={form.priority} onChange={(e) => onChange({ ...form, priority: e.target.value as TaskPriority })} className={fc}>
            {(Object.entries(TASK_PRIORITY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Prazo</label>
          <input type="date" value={form.due_date} onChange={(e) => onChange({ ...form, due_date: e.target.value })} className={fc} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Tempo estimado (min)</label>
          <input type="number" value={form.estimated_hours} onChange={(e) => onChange({ ...form, estimated_hours: parseInt(e.target.value) || 0 })} min="0" className={fc} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Observacoes</label>
        <textarea value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} rows={2} className={`${fc} resize-none`} placeholder="Anotacoes adicionais..." />
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      {icon}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900 text-sm">{value}</p>
      </div>
    </div>
  )
}
