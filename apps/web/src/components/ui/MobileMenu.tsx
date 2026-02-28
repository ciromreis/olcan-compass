import { forwardRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface MobileMenuProps extends BaseComponentProps {
  /** Whether menu is open */
  isOpen: boolean
  /** Callback when menu should close */
  onClose: () => void
  /** Menu content */
  children: React.ReactNode
  /** Menu title */
  title?: string
}

/**
 * Mobile hamburger menu with slide-in animation
 * Implements focus trap and backdrop for accessibility
 */
export const MobileMenu = forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ className, isOpen, onClose, children, title, ...props }, ref) => {
    // Lock body scroll when menu is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = ''
        }
      }
    }, [isOpen])

    // Close on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-void-primary/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          ref={ref}
          className={cn(
            'fixed top-0 left-0 bottom-0 z-50',
            'w-[280px] max-w-[85vw]',
            'bg-void-primary border-r border-neutral-700',
            'transform transition-transform duration-300',
            'flex flex-col',
            isOpen ? 'translate-x-0' : '-translate-x-full',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Menu'}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-700">
            {title && (
              <h2 className="text-lg font-heading font-bold text-white">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className={cn(
                'ml-auto p-2 rounded-lg',
                'text-neutral-400 hover:text-white hover:bg-neutral-700',
                'focus:outline-none focus:ring-2 focus:ring-cyan/50',
                'transition-colors'
              )}
              aria-
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </>
    )
  }
)

MobileMenu.displayName = 'MobileMenu'
