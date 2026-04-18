import { forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface GridProps extends BaseComponentProps {
  /** Child elements */
  children?: ReactNode
  /** Number of columns (responsive) */
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  /** Gap between grid items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Responsive column configuration */
  responsive?: {
    mobile?: 1 | 2
    tablet?: 2 | 3 | 4
    desktop?: 3 | 4 | 6 | 12
  }
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
}

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

/**
 * Grid component for responsive column layouts
 * Supports mobile-first responsive design
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, children, cols = 1, gap = 'md', responsive, ...props }, ref) => {
    const responsiveClasses = responsive
      ? cn(
          responsive.mobile && `grid-cols-${responsive.mobile}`,
          responsive.tablet && `md:grid-cols-${responsive.tablet}`,
          responsive.desktop && `lg:grid-cols-${responsive.desktop}`
        )
      : colsClasses[cols]

    return (
      <div
        ref={ref}
        className={cn('grid', responsiveClasses, gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'
