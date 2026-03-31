import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * MMXD Button component with Lumina/Lux accent variants.
 *
 * Variants:
 * - primary: Lumina (Ice-blue) gradient background, high contrast CTA
 * - secondary: Lux (Platinum) outlined, subtle
 * - ghost: No background, text only
 * - danger: Error-colored for destructive actions
 */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    /** Visual variant */
    variant?: ButtonVariant
    /** Size preset */
    size?: ButtonSize
    /** Show loading spinner */
    isLoading?: boolean
    /** Render as full width */
    fullWidth?: boolean
    /** Icon element to display */
    icon?: ReactNode
    /** Icon position relative to content */
    iconPosition?: IconPosition
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-gradient-to-r from-primary-blue to-cyan-600 text-white shadow-blue-glow hover:shadow-cyan-glow',
    secondary:
        'bg-white/5 text-silver border border-white/10 hover:bg-white/10 hover:border-cyan/20',
    ghost:
        'bg-transparent text-silver hover:text-white hover:bg-white/5',
    danger:
        'bg-error/10 text-error border border-error/30 hover:bg-error/20 hover:border-error/50 active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-body-sm rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-body rounded-lg gap-2',
    lg: 'px-6 py-3 text-body-lg rounded-lg gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = false,
            disabled,
            className,
            icon,
            iconPosition = 'left',
            ...props
        },
        ref
    ) => {
        const LoadingSpinner = () => (
            <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
        )

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center font-body font-medium',
                    'transition-colors duration-fast',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                    variantStyles[variant as ButtonVariant],
                    sizeStyles[size as ButtonSize],
                    fullWidth && 'w-full',
                    className
                )}
                aria-busy={isLoading}
                aria-disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <LoadingSpinner />}
                {!isLoading && icon && iconPosition === 'left' && (
                    <span className="flex-shrink-0" aria-hidden="true">
                        {icon}
                    </span>
                )}
                {children && <span>{children as React.ReactNode}</span>}
                {!isLoading && icon && iconPosition === 'right' && (
                    <span className="flex-shrink-0" aria-hidden="true">
                        {icon}
                    </span>
                )}
            </motion.button>
        )
    }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize, IconPosition }
