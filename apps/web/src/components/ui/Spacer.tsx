import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface SpacerProps extends BaseComponentProps {
  /** Size of the spacer */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  /** Direction of the spacer */
  direction?: 'vertical' | 'horizontal'
}

const sizeClasses = {
  vertical: {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
    '2xl': 'h-12',
    '3xl': 'h-16',
    '4xl': 'h-24',
  },
  horizontal: {
    xs: 'w-1',
    sm: 'w-2',
    md: 'w-4',
    lg: 'w-6',
    xl: 'w-8',
    '2xl': 'w-12',
    '3xl': 'w-16',
    '4xl': 'w-24',
  },
}

/**
 * Spacer component for adding consistent spacing
 * Useful for creating visual breathing room
 */
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 'md', direction = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(sizeClasses[direction][size], className)}
        {...props}
      />
    )
  }
)

Spacer.displayName = 'Spacer'
