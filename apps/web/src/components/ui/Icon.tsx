import { type HTMLAttributes, type ComponentType } from 'react'
import { cn } from '../../lib/utils'

/**
 * MMXD Icon wrapper component for lucide-react icons.
 *
 * Provides consistent sizing and styling for icons throughout the application.
 * Use with lucide-react icon components.
 *
 * Example:
 *   import { User } from 'lucide-react'
 *   <Icon icon={User} size="md" />
 */

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** Lucide icon component */
    icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
    /** Size preset */
    size?: IconSize
    /** Accessible label (required if icon has semantic meaning) */
    label?: string
}

const sizeStyles: Record<IconSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
}

/**
 * Icon wrapper component for consistent icon sizing and styling.
 */
function Icon({
    icon: IconComponent,
    size = 'md',
    label,
    className,
    ...props
}: IconProps) {
    return (
        <span
            className={cn('inline-flex items-center justify-center flex-shrink-0', className)}
            role={label ? 'img' : undefined}
            aria-label={label}
            {...props}
        >
            <IconComponent
                className={sizeStyles[size]}
                aria-hidden={!label}
            />
        </span>
    )
}

export { Icon }
export type { IconProps, IconSize }
