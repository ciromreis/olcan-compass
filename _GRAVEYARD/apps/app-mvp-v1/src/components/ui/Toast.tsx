import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore, type Toast as ToastType } from '@/store/toast'
import type { BaseComponentProps } from './types'

export interface ToastProps extends BaseComponentProps {
  /** Toast data */
  toast: ToastType
  /** Callback when toast is closed */
  onClose?: (id: string) => void
}

const variantStyles = {
  success: {
    container: 'bg-semantic-success/10 border-semantic-success',
    icon: 'text-semantic-success',
    IconComponent: CheckCircle,
  },
  error: {
    container: 'bg-semantic-error/10 border-semantic-error',
    icon: 'text-semantic-error',
    IconComponent: AlertCircle,
  },
  warning: {
    container: 'bg-semantic-warning/10 border-semantic-warning',
    icon: 'text-semantic-warning',
    IconComponent: AlertTriangle,
  },
  info: {
    container: 'bg-lumina-300/10 border-lumina-300',
    icon: 'text-lumina-300',
    IconComponent: Info,
  },
}

/**
 * Toast notification component
 * Displays temporary messages with auto-dismiss
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onClose, ...props }, ref) => {
    const { container, icon, IconComponent } = variantStyles[toast.variant]

    const handleClose = () => {
      onClose?.(toast.id)
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        role="alert"
        aria-live="polite"
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
          'min-w-[320px] max-w-[480px]',
          container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <IconComponent size={20} className={cn('flex-shrink-0 mt-0.5', icon)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-medium text-lux-100 mb-1">{toast.title}</p>
          )}
          <p className="text-sm text-lux-200">{toast.message}</p>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-lumina-200 hover:text-lumina-100 focus:outline-none focus:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300"
          aria-label="Fechar notificação"
        >
          <X size={16} className="text-lux-300" />
        </button>
      </motion.div>
    )
  }
)

Toast.displayName = 'Toast'

/**
 * ToastContainer component for rendering all active toasts
 * Should be placed at the root of the application
 */
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
