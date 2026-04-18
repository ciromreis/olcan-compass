'use client'

import { useState, useCallback } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import {
  CheckSquareIcon,
  SquareIcon,
  Trash2Icon,
  CheckCircleIcon,
  PlayIcon,
  AlertCircleIcon,
  XIcon,
} from 'lucide-react'
import { taskToast } from './TaskToast'

interface BulkActionsToolbarProps {
  selectedTaskIds: Set<string>
  onClearSelection: () => void
  onSelectionChange: (ids: Set<string>) => void
}

export function BulkActionsToolbar({ selectedTaskIds, onClearSelection, onSelectionChange }: BulkActionsToolbarProps) {
  const { tasks, completeTask, startTask, deleteTask, isLoading } = useTaskStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedCount = selectedTaskIds.size
  const selectedTasks = tasks.filter((t) => selectedTaskIds.has(t.id))

  // Select all visible tasks
  const handleSelectAll = useCallback(() => {
    if (selectedTaskIds.size === tasks.length) {
      onClearSelection()
    } else {
      const allIds = new Set(tasks.map((t) => t.id))
      onSelectionChange(allIds)
    }
  }, [tasks, selectedTaskIds, onClearSelection, onSelectionChange])

  // Bulk complete
  const handleBulkComplete = async () => {
    if (!confirm(`Concluir ${selectedCount} tarefa(s)? Esta acao nao pode ser desfeita.`)) {
      return
    }

    setIsProcessing(true)
    let successCount = 0
    let errorCount = 0
    let totalXP = 0

    for (const taskId of selectedTaskIds) {
      try {
        const task = tasks.find((t) => t.id === taskId)
        if (task && task.status === 'IN_PROGRESS') {
          const result = await completeTask(taskId)
          successCount++
          totalXP += result.xp_earned || 0
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    setIsProcessing(false)
    onClearSelection()

    if (successCount > 0) {
      taskToast.success(
        `${successCount} tarefa(s) concluida(s)!`,
        `${totalXP} XP ganhos`
      )
    }
    if (errorCount > 0) {
      taskToast.error(
        `${errorCount} tarefa(s) falharam`,
        'Tarefas precisam estar em andamento para concluir'
      )
    }
  }

  // Bulk start
  const handleBulkStart = async () => {
    setIsProcessing(true)
    let successCount = 0
    let errorCount = 0

    for (const taskId of selectedTaskIds) {
      try {
        const task = tasks.find((t) => t.id === taskId)
        if (task && task.status === 'PENDING') {
          await startTask(taskId)
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    setIsProcessing(false)

    if (successCount > 0) {
      taskToast.success(`${successCount} tarefa(s) iniciada(s)!`)
    }
    if (errorCount > 0) {
      taskToast.error(
        `${errorCount} tarefa(s) falharam`,
        'Tarefas precisam estar pendentes para iniciar'
      )
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Excluir ${selectedCount} tarefa(s)? Esta acao nao pode ser desfeita!`)) {
      return
    }

    setIsProcessing(true)
    let successCount = 0
    let errorCount = 0

    for (const taskId of selectedTaskIds) {
      try {
        await deleteTask(taskId)
        successCount++
      } catch (error) {
        errorCount++
      }
    }

    setIsProcessing(false)
    onClearSelection()

    if (successCount > 0) {
      taskToast.success(`${successCount} tarefa(s) excluida(s)!`)
    }
    if (errorCount > 0) {
      taskToast.error(`${errorCount} tarefa(s) falharam ao excluir`)
    }
  }

  if (selectedCount === 0) {
    return null
  }

  // Determine available actions based on selected tasks
  const hasPendingTasks = selectedTasks.some((t) => t.status === 'PENDING')
  const hasInProgressTasks = selectedTasks.some((t) => t.status === 'IN_PROGRESS')
  const hasCompletedTasks = selectedTasks.some((t) => t.status === 'COMPLETED')

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left - Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquareIcon className="w-5 h-5" />
            <span className="font-semibold">{selectedCount} tarefa(s) selecionada(s)</span>
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            {selectedTaskIds.size === tasks.length ? (
              <>
                <XIcon className="w-4 h-4" />
                Desselecionar
              </>
            ) : (
              <>
                <SquareIcon className="w-4 h-4" />
                Selecionar todas ({tasks.length})
              </>
            )}
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Start Selected */}
          {hasPendingTasks && (
            <button
              onClick={handleBulkStart}
              disabled={isProcessing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              Iniciar
            </button>
          )}

          {/* Complete Selected */}
          {hasInProgressTasks && (
            <button
              onClick={handleBulkComplete}
              disabled={isProcessing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors text-slate-900"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Concluir
            </button>
          )}

          {/* Delete Selected */}
          {!hasCompletedTasks && (
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2Icon className="w-4 h-4" />
              Excluir
            </button>
          )}

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            <XIcon className="w-4 h-4" />
            Limpar
          </button>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-lg shadow-xl">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="font-medium">Processando {selectedCount} tarefa(s)...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Checkbox component for task cards
export function TaskCheckbox({
  taskId,
  isSelected,
  onToggle,
}: {
  taskId: string
  isSelected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(taskId)
      }}
      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
    >
      {isSelected ? (
        <CheckSquareIcon className="w-5 h-5 text-blue-600" />
      ) : (
        <SquareIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
      )}
    </button>
  )
}
