import { forwardRef, ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface ModalProps extends BaseComponentProps {
  /** Whether modal is open */
  open: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal description */
  description?: string
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean
  /** Footer content */
  footer?: ReactNode
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

/**
 * Modal component with backdrop and focus trap
 * Implements WCAG accessibility guidelines
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      children,
      open,
      onClose,
      title,
      description,
      size = 'md',
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      footer,
      ...props
    },
    _ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Focus trap and keyboard handling
    useEffect(() => {
      if (!open) return

      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus modal
      const modalElement = modalRef.current
      if (modalElement) {
        modalElement.focus()
      }

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          onClose()
        }
      }

      // Handle Tab key for focus trap
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !modalElement) return

        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTab)
        document.body.style.overflow = ''

        // Restore focus
        previousActiveElement.current?.focus()
      }
    }, [open, closeOnEscape, onClose])

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    const modalContent = (
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-void-primary/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              tabIndex={-1}
              className={cn(
                'relative w-full bg-void-light border border-neutral-700 rounded-lg shadow-2xl',
                'focus:outline-none',
                sizeClasses[size],
                className
              )}
              {...props}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between p-6 border-b border-neutral-700">
                  <div className="flex-1">
                    {title && (
                      <h2
                        id="modal-title"
                        className="text-xl font-semibold text-lux-100 font-heading"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="mt-1 text-sm text-lux-300">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 p-2 rounded-lg hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300"
                      aria-label="Fechar modal"
                    >
                      <X size={20} className="text-lux-300" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-700">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
  }
)

Modal.displayName = 'Modal'
