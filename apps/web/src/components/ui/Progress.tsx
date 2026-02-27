import { type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * MMXD Linear Progress bar with Lumina gradient fill.
 */
interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
    /** Progress value 0-100 */
    value: number
    /** Maximum value */
    max?: number
    /** Size variant */
    size?: 'sm' | 'md' | 'lg'
    /** Show percentage label */
    showLabel?: boolean
    /** Optional label text override */
    label?: string
    /** Color variant */
    color?: 'lumina' | 'lux' | 'success' | 'warning' | 'error' | 'mirror'
}

const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
}

const colorStyles = {
    lumina: 'bg-gradient-to-r from-lumina-200 to-lumina-300',
    lux: 'bg-gradient-to-r from-lux-200 to-lux-300',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    mirror: 'bg-mirror',
}

/**
 * Animated progress bar with MMXD styling.
 */
function Progress({
    value,
    max = 100,
    size = 'md',
    showLabel = false,
    label,
    color = 'lumina',
    className,
    ...props
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className={cn('w-full', className)} {...props}>
            {(showLabel || label) && (
                <div className="flex items-center justify-between mb-1.5">
                    {label && (
                        <span className="text-body-sm text-neutral-200">{label}</span>
                    )}
                    {showLabel && (
                        <span className="text-caption text-neutral-300 tabular-nums">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={cn(
                    'w-full rounded-full overflow-hidden bg-neutral-600/50',
                    sizeStyles[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                        'h-full rounded-full',
                        colorStyles[color]
                    )}
                />
            </div>
        </div>
    )
}


/**
 * MMXD Circular Progress / Score Ring.
 */
interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
    /** Progress value 0-100 */
    value: number
    /** Size in pixels */
    size?: number
    /** Stroke width */
    strokeWidth?: number
    /** Color variant */
    color?: 'lumina' | 'lux' | 'success' | 'warning' | 'error' | 'mirror'
    /** Show value inside */
    showValue?: boolean
    /** Optional label below the value */
    label?: string
}

/**
 * Circular score ring for readiness/progress visualization.
 */
function CircularProgress({
    value,
    size = 80,
    strokeWidth = 6,
    color = 'lumina',
    showValue = true,
    label,
    className,
    ...props
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

    const strokeColors = {
        lumina: 'stroke-lumina-200',
        lux: 'stroke-lux-300',
        success: 'stroke-success',
        warning: 'stroke-warning',
        error: 'stroke-error',
        mirror: 'stroke-mirror',
    }

    return (
        <div
            className={cn('inline-flex flex-col items-center gap-1', className)}
            {...props}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-neutral-600/50"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className={cn(strokeColors[color])}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
                {showValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-body-sm font-semibold text-white tabular-nums">
                            {Math.round(value)}
                        </span>
                    </div>
                )}
            </div>
            {label && (
                <span className="text-caption text-neutral-300 text-center">{label}</span>
            )}
        </div>
    )
}

export { Progress, CircularProgress }
export type { ProgressProps, CircularProgressProps }
