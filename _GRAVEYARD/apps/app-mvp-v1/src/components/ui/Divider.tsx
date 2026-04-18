import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface DividerProps extends BaseComponentProps {
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Divider thickness */
  thickness?: 'thin' | 'medium' | 'thick'
  /** Divider color variant */
  variant?: 'default' | 'light' | 'dark'
}

const thicknessClasses = {
  horizontal: {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  },
  vertical: {
    thin: 'w-px',
    medium: 'w-0.5',
    thick: 'w-1',
  },
}

const variantClasses = {
  default: 'bg-neutral-600',
  light: 'bg-neutral-700',
  dark: 'bg-neutral-500',
}

/**
 * Divider component for visual separation
 * Supports horizontal and vertical orientations
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', thickness = 'thin', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          thicknessClasses[orientation][thickness],
          variantClasses[variant],
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          className
        )}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'
