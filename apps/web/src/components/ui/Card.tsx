import { type HTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * MMXD Card component with glass-morphism effect.
 *
 * Variants:
 * - default: Standard glass card
 * - elevated: Higher contrast with subtle glow (hover lift enabled)
 * - bordered: Glass card with Lumina left border accent
 * - score: Compact card for displaying metrics/scores
 */

type CardVariant = 'default' | 'elevated' | 'bordered' | 'score'

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    /** Visual variant */
    variant?: CardVariant
    /** Card header content */
    header?: ReactNode
    /** Card footer content */
    footer?: ReactNode
    /** Remove default padding */
    noPadding?: boolean
}

const variantStyles: Record<CardVariant, string> = {
    default:
        'bg-neutral-700/50 backdrop-blur-md border border-neutral-600/40 rounded-xl',
    elevated:
        'bg-neutral-700/60 backdrop-blur-lg border border-neutral-500/30 rounded-xl shadow-glass hover:shadow-glass-hover bg-noise',
    bordered:
        'bg-neutral-700/50 backdrop-blur-md border border-neutral-600/40 rounded-xl border-l-[3px] border-l-lumina-200',
    score:
        'bg-neutral-700/40 backdrop-blur-sm border border-neutral-600/30 rounded-lg',
}

/**
 * Glass-morphism card with MMXD styling.
 */
function Card({
    children,
    variant = 'default',
    header,
    footer,
    noPadding = false,
    className,
    ...props
}: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={variant === 'elevated' ? { y: -4, transition: { duration: 0.2 } } : {}}
            className={cn(
                variantStyles[variant],
                'transition-colors duration-normal',
                className
            )}
            {...(props as any)}
        >
            {header && (
                <div className="px-5 py-4 border-b border-neutral-600/30">
                    {header as React.ReactNode}
                </div>
            )}
            <div className={cn(!noPadding && 'p-5')}>
                {children as React.ReactNode}
            </div>
            {footer && (
                <div className="px-5 py-3 border-t border-neutral-600/30 bg-neutral-800/30 rounded-b-xl">
                    {footer as React.ReactNode}
                </div>
            )}
        </motion.div>
    )
}

/**
 * Card title with heading typography.
 */
function CardTitle({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn('font-heading text-h3 text-white', className)}
            {...props}
        >
            {children}
        </h3>
    )
}

/**
 * Card description text.
 */
function CardDescription({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn('text-body-sm text-neutral-300 mt-1', className)}
            {...props}
        >
            {children}
        </p>
    )
}

export { Card, CardTitle, CardDescription }
export type { CardProps, CardVariant }
