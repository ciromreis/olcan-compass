'use client'

import { useState } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import type { TaskCreateRequest, TaskCategory, TaskPriority } from '@/lib/taskTypes'
import { TASK_CATEGORY_LABELS, TASK_PRIORITY_LABELS } from '@/lib/taskTypes'
import { X, Plus, Calendar, Clock } from 'lucide-react'

interface TaskCreateFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskCreateForm({ onSuccess, onCancel }: TaskCreateFormProps) {
  const { createTask, isLoading } = useTaskStore()
  const [formData, setFormData] = useState<Omit<TaskCreateRequest, 'subtasks'>>({
    title: '',
    description: '',
    category: 'DOCUMENTATION',
    priority: 'MEDIUM',
    due_date: undefined,
    estimated_hours: undefined,
    notes: undefined,
    route_id: undefined,
    task_metadata: undefined,
  })
  const [subtaskInputs, setSubtaskInputs] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    try {
      await createTask({ ...formData, subtasks: subtaskInputs.filter((s) => s.trim()) })
      onSuccess?.()
    } catch { /* handled by store */ }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtaskInputs([...subtaskInputs, newSubtask.trim()])
      setNewSubtask('')
    }
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtaskInputs(subtaskInputs.filter((_, i) => i !== index))
  }

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Titulo <span className="text-rose-500">*</span>
        </label>
        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="O que precisa ser feito?" className={`${fieldClass} text-base font-medium`} required autoFocus />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descricao</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detalhes sobre esta tarefa..." rows={3} className={`${fieldClass} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoria</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })} className={fieldClass}>
            {(Object.entries(TASK_CATEGORY_LABELS) as [TaskCategory, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prioridade</label>
          <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className={fieldClass}>
            {(Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Calendar className="inline h-3.5 w-3.5 mr-1" /> Prazo
          </label>
          <input type="date" value={formData.due_date || ''} onChange={(e) => setFormData({ ...formData, due_date: e.target.value || undefined })} className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Clock className="inline h-3.5 w-3.5 mr-1" /> Tempo estimado (min)
          </label>
          <input type="number" min="0" placeholder="ex: 120" value={formData.estimated_hours || ''} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value ? parseInt(e.target.value) : undefined })} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observacoes</label>
        <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
          placeholder="Anotacoes, dicas ou lembretes..." rows={2} className={`${fieldClass} resize-none`} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtarefas</label>
        {subtaskInputs.length > 0 && (
          <div className="mb-3 space-y-2">
            {subtaskInputs.map((subtask, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="flex-1 text-sm text-slate-700">{subtask}</span>
                <button type="button" onClick={() => handleRemoveSubtask(index)} className="p-1 rounded hover:bg-rose-100 transition-colors">
                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-600" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask() } }}
            placeholder="Adicionar subtarefa..." className={`flex-1 ${fieldClass}`} />
          <button type="button" onClick={handleAddSubtask} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-5 border-t border-slate-200">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50">
          {isLoading ? (
            <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Criando...</>
          ) : (
            <><Plus className="h-4 w-4" /> Criar tarefa</>
          )}
        </button>
      </div>
    </form>
  )
}
