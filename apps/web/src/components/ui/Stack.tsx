import { forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface StackProps extends BaseComponentProps {
  /** Child elements */
  children?: ReactNode
  /** Stack direction */
  direction?: 'vertical' | 'horizontal'
  /** Spacing between items */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Alignment of items */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  /** Whether to wrap items */
  wrap?: boolean
}

const spacingClasses = {
  vertical: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
  },
  horizontal: {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
    '2xl': 'space-x-12',
  },
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
}

/**
 * Stack component for vertical or horizontal layouts with consistent spacing
 * Provides flexible alignment and justification options
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      children,
      direction = 'vertical',
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          spacingClasses[direction][spacing],
          alignClasses[align],
          justifyClasses[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'
