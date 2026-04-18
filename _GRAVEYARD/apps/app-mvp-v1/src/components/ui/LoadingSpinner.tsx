import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, Size } from './types'

export interface LoadingSpinnerProps extends BaseComponentProps {
  /** Spinner size */
  size?: Size | 'xs'
  /** Loading text */
  text?: string
  /** Whether to center spinner */
  centered?: boolean
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

/**
 * LoadingSpinner component with size variants
 * Displays animated loading indicator
 */
export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', text, centered = false, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={text || 'Carregando'}
        className={cn('flex items-center gap-2', centered && 'justify-center', className)}
        {...props}
      >
        <Loader2 className={cn('animate-spin text-cyan', sizeClasses[size])} />
        {text && <span className="text-sm text-lux-300">{text}</span>}
      </div>
    )

    return content
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

export interface SkeletonProps extends BaseComponentProps {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular'
  /** Width */
  width?: string | number
  /** Height */
  height?: string | number
  /** Number of lines (for text variant) */
  lines?: number
}

/**
 * Skeleton component for loading states
 * Provides visual placeholder during content loading
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, lines = 1, ...props }, ref) => {
    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_: any, index: number) => (
            <div
              key={index}
              className="h-4 bg-neutral-700 rounded animate-pulse"
              style={{
                width: index === lines - 1 ? '80%' : '100%',
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-neutral-700 animate-pulse',
          variant === 'text' && 'h-4 rounded',
          variant === 'circular' && 'rounded-full',
          variant === 'rectangular' && 'rounded-lg',
          className
        )}
        style={{
          width: width || (variant === 'circular' ? height : '100%'),
          height: height || (variant === 'text' ? '1rem' : '100%'),
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'
