import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

/**
 * MMXD Badge component for status indicators and labels.
 *
 * Variants:
 * - default: Neutral gray badge
 * - success: Green for positive states
 * - warning: Yellow/amber for caution states
 * - error: Red for error/danger states
 * - mirror: Purple for special/featured states
 * - lumina: Blue accent for primary highlights
 */

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'mirror' | 'lumina'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Visual variant */
    variant?: BadgeVariant
    /** Size preset */
    size?: BadgeSize
    /** Show dot indicator */
    dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        'bg-neutral-600/50 text-neutral-200 border-neutral-500/40',
    success:
        'bg-success/10 text-success border-success/30',
    warning:
        'bg-warning/10 text-warning border-warning/30',
    error:
        'bg-error/10 text-error border-error/30',
    mirror:
        'bg-mirror/10 text-mirror border-mirror/30',
    lumina:
        'bg-lumina-200/10 text-lumina-200 border-lumina-200/30',
}

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-caption gap-1',
    md: 'px-2.5 py-1 text-body-sm gap-1.5',
    lg: 'px-3 py-1.5 text-body gap-2',
}

/**
 * Badge component for status indicators and labels.
 */
function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-body font-medium rounded-full border',
                'transition-colors duration-fast',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        variant === 'default' && 'bg-neutral-300',
                        variant === 'success' && 'bg-success',
                        variant === 'warning' && 'bg-warning',
                        variant === 'error' && 'bg-error',
                        variant === 'mirror' && 'bg-mirror',
                        variant === 'lumina' && 'bg-lumina-200'
                    )}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    )
}

export { Badge }
export type { BadgeProps, BadgeVariant, BadgeSize }
