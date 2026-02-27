import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

/**
 * Toast notification store with Zustand
 * Manages toast queue and auto-dismiss
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAll: () => {
    set({ toasts: [] })
  },
}))

/**
 * Hook for showing toast notifications
 */
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast)

  return {
    success: (message: string, title?: string) =>
      addToast({ message, title, variant: 'success' }),
    error: (message: string, title?: string) =>
      addToast({ message, title, variant: 'error' }),
    warning: (message: string, title?: string) =>
      addToast({ message, title, variant: 'warning' }),
    info: (message: string, title?: string) =>
      addToast({ message, title, variant: 'info' }),
    custom: (toast: Omit<Toast, 'id'>) => addToast(toast),
  }
}
