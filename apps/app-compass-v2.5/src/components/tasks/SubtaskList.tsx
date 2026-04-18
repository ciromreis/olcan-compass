'use client'

import { useState } from 'react'
import { CheckCircleIcon, CircleIcon, PlusIcon, TrashIcon } from 'lucide-react'

interface Subtask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  position: number
  created_at: string
}

interface SubtaskListProps {
  taskId: string
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const completedCount = subtasks.filter((s) => s.is_completed).length
  const totalCount = subtasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `temp-${Date.now()}`,
      task_id: taskId,
      title: newSubtaskTitle.trim(),
      is_completed: false,
      position: totalCount,
      created_at: new Date().toISOString(),
    }

    setSubtasks([...subtasks, newSubtask])
    setNewSubtaskTitle('')
    setIsAdding(false)
  }

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
      )
    )
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subtaskId))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Subtarefas
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({completedCount}/{totalCount})
              </span>
            )}
          </h3>
          {totalCount > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-semibold"
        >
          <PlusIcon className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Add Subtask Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubtask()
                }
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewSubtaskTitle('')
                }
              }}
              placeholder="Titulo da subtarefa..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddSubtask}
              className="px-4 py-2 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewSubtaskTitle('')
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Subtask List */}
      {subtasks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CheckCircleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 mb-1">Nenhuma subtarefa</p>
          <p className="text-sm text-slate-400">
            Divida esta tarefa em passos menores
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {subtasks.map((subtask, index) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              index={index}
              onToggle={() => handleToggleSubtask(subtask.id)}
              onDelete={() => handleDeleteSubtask(subtask.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Subtask Item Component
// ============================================================

function SubtaskItem({
  subtask,
  index,
  onToggle,
  onDelete,
}: {
  subtask: Subtask
  index: number
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
        subtask.is_completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          subtask.is_completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        {subtask.is_completed ? (
          <CheckCircleIcon className="w-5 h-5 text-white" />
        ) : (
          <CircleIcon className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            subtask.is_completed
              ? 'text-gray-500 line-through'
              : 'text-gray-900'
          }`}
        >
          {subtask.title}
        </p>
      </div>

      {/* Position Badge */}
      <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors group"
        title="Delete subtask"
      >
        <TrashIcon className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
      </button>
    </div>
  )
}
