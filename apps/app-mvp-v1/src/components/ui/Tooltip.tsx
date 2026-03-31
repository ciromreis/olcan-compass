import { forwardRef, useState, useRef, ReactNode, cloneElement, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface TooltipProps extends BaseComponentProps {
  /** Tooltip content */
  content: ReactNode
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Delay before showing tooltip (ms) */
  delay?: number
  /** Whether tooltip is disabled */
  disabled?: boolean
}

/**
 * Tooltip component with positioning logic
 * Provides contextual information on hover
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, position = 'top', delay = 200, disabled = false, className }, _ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const spacing = 8

      let top = 0
      let left = 0

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - spacing
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
          break
        case 'bottom':
          top = triggerRect.bottom + spacing
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
          break
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
          left = triggerRect.left - tooltipRect.width - spacing
          break
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
          left = triggerRect.right + spacing
          break
      }

      // Keep tooltip within viewport
      const padding = 8
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))

      setTooltipPosition({ top, left })
    }

    const handleMouseEnter = () => {
      if (disabled) return

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
        // Calculate position after render
        requestAnimationFrame(calculatePosition)
      }, delay)
    }

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
    }

    // Clone child and attach event handlers
    const trigger = isValidElement(children)
      ? cloneElement(children as React.ReactElement<any>, {
          ref: triggerRef,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onFocus: handleMouseEnter,
          onBlur: handleMouseLeave,
        })
      : children

    const tooltipContent = (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            className={cn(
              'fixed z-50 px-3 py-2 text-sm text-lux-100 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg',
              'max-w-xs pointer-events-none',
              className
            )}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    )

    return (
      <>
        {trigger}
        {createPortal(tooltipContent, document.body)}
      </>
    )
  }
)

Tooltip.displayName = 'Tooltip'
