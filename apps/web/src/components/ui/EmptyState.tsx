import { forwardRef, ReactNode } from 'react'
import { FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import type { BaseComponentProps } from './types'

export interface EmptyStateProps extends BaseComponentProps {
  /** Icon to display */
  icon?: ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Action button label */
  actionLabel?: string
  /** Action button callback */
  onAction?: () => void
  /** Secondary action button label */
  secondaryActionLabel?: string
  /** Secondary action button callback */
  onSecondaryAction?: () => void
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'w-20 h-20',
    title: 'text-xl',
    description: 'text-lg',
  },
}

/**
 * EmptyState component with icon, title, description, and action
 * Provides contextual messaging based on feature area
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      actionLabel,
      onAction,
      secondaryActionLabel,
      onSecondaryAction,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizes = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn('mb-4 text-neutral-500', sizes.icon)}>
          {icon || <FileQuestion className="w-full h-full" />}
        </div>

        {/* Title */}
        <h3 className={cn('font-semibold text-lux-100 mb-2 font-heading', sizes.title)}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={cn('text-lux-300 max-w-md mb-6', sizes.description)}>
            {description}
          </p>
        )}

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex items-center gap-3">
            {actionLabel && onAction && (
              <Button onClick={onAction} variant="primary">
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button onClick={onSecondaryAction} variant="ghost">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
