import { forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface ContainerProps extends BaseComponentProps {
  /** Child elements */
  children?: ReactNode
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Whether to center the container */
  centered?: boolean
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4',
  md: 'px-6 md:px-8',
  lg: 'px-8 md:px-12',
}

/**
 * Container component for constraining content width and centering
 * Follows MMXD responsive design principles
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, maxWidth = 'xl', centered = true, padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          maxWidthClasses[maxWidth],
          centered && 'mx-auto',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
