import { forwardRef, ReactNode } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, SemanticVariant } from './types'

export interface AlertProps extends BaseComponentProps {
  /** Alert variant */
  variant?: SemanticVariant
  /** Alert title */
  title?: string
  /** Whether alert is dismissible */
  dismissible?: boolean
  /** Callback when alert is dismissed */
  onDismiss?: () => void
  /** Custom icon */
  icon?: ReactNode
  /** Whether to show default icon */
  showIcon?: boolean
}

const variantStyles = {
  default: {
    container: 'bg-neutral-800 border-neutral-700',
    icon: 'text-lux-200',
    title: 'text-lux-100',
    text: 'text-lux-200',
    IconComponent: Info,
  },
  success: {
    container: 'bg-semantic-success/10 border-semantic-success',
    icon: 'text-semantic-success',
    title: 'text-semantic-success',
    text: 'text-lux-200',
    IconComponent: CheckCircle,
  },
  warning: {
    container: 'bg-semantic-warning/10 border-semantic-warning',
    icon: 'text-semantic-warning',
    title: 'text-semantic-warning',
    text: 'text-lux-200',
    IconComponent: AlertTriangle,
  },
  error: {
    container: 'bg-semantic-error/10 border-semantic-error',
    icon: 'text-semantic-error',
    title: 'text-semantic-error',
    text: 'text-lux-200',
    IconComponent: AlertCircle,
  },
  mirror: {
    container: 'bg-semantic-mirror/10 border-semantic-mirror',
    icon: 'text-semantic-mirror',
    title: 'text-semantic-mirror',
    text: 'text-lux-200',
    IconComponent: Info,
  },
}

/**
 * Alert component for inline notifications
 * Supports dismissible alerts and custom icons
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      children,
      variant = 'default',
      title,
      dismissible = false,
      onDismiss,
      icon,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant]
    const DefaultIcon = showIcon ? styles.IconComponent : null
    const iconToRender = icon || null

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          styles.container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        {(iconToRender || DefaultIcon) && (
          <div className="flex-shrink-0 mt-0.5">
            {iconToRender ? (
              iconToRender
            ) : DefaultIcon ? (
              <DefaultIcon size={20} className={styles.icon} />
            ) : null}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('text-sm font-medium mb-1', styles.title)}>{title}</h3>
          )}
          <div className={cn('text-sm', styles.text)}>{children}</div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan/50"
            aria-label="Fechar alerta"
          >
            <X size={16} className="text-lux-300" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'
