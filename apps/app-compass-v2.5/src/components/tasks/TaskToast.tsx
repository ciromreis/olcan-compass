'use client'

/**
 * Task-Specific Toast Notification System
 * Designed for task completion, level ups, and achievements
 */

import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { XIcon, CheckCircleIcon, AlertCircleIcon, StarIcon } from 'lucide-react'

export type TaskToastType = 'success' | 'error' | 'achievement' | 'levelup'

export interface TaskToast {
  id: string
  type: TaskToastType
  title: string
  message?: string
  duration?: number
  icon?: string
}

interface TaskToastStore {
  toasts: TaskToast[]
  addToast: (toast: Omit<TaskToast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useTaskToastStore = create<TaskToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `task-toast-${Date.now()}-${Math.random()}`
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))

    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, toast.duration || 5000)
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

export function TaskToastContainer() {
  const { toasts, removeToast } = useTaskToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-3 max-w-md">
      {toasts.map((toast) => (
        <TaskToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function TaskToastItem({
  toast,
  onClose,
}: {
  toast: TaskToast
  onClose: () => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const colors = {
    success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
    error: 'bg-rose-50 border-rose-500 text-rose-900',
    achievement: 'bg-brand-50 border-brand-500 text-brand-900',
    levelup: 'bg-brand-50 border-brand-500 text-brand-900',
  }

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircleIcon className="w-5 h-5 text-rose-500" />,
    achievement: <StarIcon className="w-5 h-5 text-brand-500" />,
    levelup: <StarIcon className="w-5 h-5 text-brand-500" />,
  }

  return (
    <div
      className={`border-l-4 ${colors[toast.type]} rounded-lg shadow-lg p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {toast.icon ? <span className="text-2xl">{toast.icon}</span> : icons[toast.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{toast.title}</p>
          {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
        </div>
        <button onClick={handleClose} className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors">
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export const taskToast = {
  success: (title: string, message?: string) => {
    useTaskToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
    })
  },

  error: (title: string, message?: string) => {
    useTaskToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: 7000,
    })
  },

  achievement: (title: string, message?: string, icon?: string) => {
    useTaskToastStore.getState().addToast({
      type: 'achievement',
      title,
      message,
      icon,
      duration: 8000,
    })
  },

  levelup: (title: string, message?: string) => {
    useTaskToastStore.getState().addToast({
      type: 'levelup',
      title,
      message,
      duration: 10000,
    })
  },
}

export function handleTaskComplete(result: { xp_earned: number; total_xp: number; level_up?: boolean; new_level?: number; level_title?: string; achievements_unlocked?: { achievement: { name: string; description: string } }[]; streak_updated?: boolean; new_streak?: number }) {
  taskToast.success(`Tarefa concluida! +${result.xp_earned} XP`, `Total: ${result.total_xp} XP`)

  if (result.level_up) {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { useTaskStore } = require('@/stores/taskStore')
      useTaskStore.getState().showLevelUpModal(result.new_level, result.level_title || 'Novo nivel')
      taskToast.levelup('Novo nivel!', `Voce alcancou o nivel ${result.new_level}!`)
    }, 1000)
  }

  if ((result.achievements_unlocked?.length ?? 0) > 0) {
    result.achievements_unlocked!.forEach((achievement, index) => {
      setTimeout(() => {
        taskToast.achievement(
          `Conquista desbloqueada: ${achievement.achievement.name}`,
          achievement.achievement.description
        )
      }, 2000 + index * 1500)
    })
  }

  if (result.streak_updated && (result.new_streak ?? 0) > 0) {
    setTimeout(() => {
      taskToast.success(
        `Sequencia de ${result.new_streak} ${result.new_streak === 1 ? 'dia' : 'dias'}!`,
        'Continue assim!'
      )
    }, result.level_up ? 3000 : 1500)
  }
}
