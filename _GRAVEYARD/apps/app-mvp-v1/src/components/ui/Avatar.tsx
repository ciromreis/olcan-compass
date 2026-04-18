import { type HTMLAttributes, useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * MMXD Avatar component for user profile images.
 *
 * Supports three states:
 * - Image: Display user profile image
 * - Initials: Display user initials when no image
 * - Placeholder: Display generic icon when no image or initials
 */

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    /** Image source URL */
    src?: string
    /** Alt text for image */
    alt?: string
    /** User initials (e.g., "JD" for John Doe) */
    initials?: string
    /** Size preset */
    size?: AvatarSize
    /** Show online status indicator */
    online?: boolean
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
    sm: {
        container: 'w-8 h-8',
        text: 'text-caption',
        indicator: 'w-2 h-2 border-[1.5px]',
    },
    md: {
        container: 'w-10 h-10',
        text: 'text-body-sm',
        indicator: 'w-2.5 h-2.5 border-2',
    },
    lg: {
        container: 'w-12 h-12',
        text: 'text-body',
        indicator: 'w-3 h-3 border-2',
    },
    xl: {
        container: 'w-16 h-16',
        text: 'text-body-lg',
        indicator: 'w-3.5 h-3.5 border-2',
    },
    '2xl': {
        container: 'w-24 h-24',
        text: 'text-h3',
        indicator: 'w-4 h-4 border-[3px]',
    },
}

/**
 * Avatar component with image, initials, and placeholder states.
 */
function Avatar({
    src,
    alt = 'Avatar',
    initials,
    size = 'md',
    online,
    className,
    ...props
}: AvatarProps) {
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const showImage = src && !imageError
    const showInitials = !showImage && initials
    const showPlaceholder = !showImage && !initials

    const styles = sizeStyles[size]

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center flex-shrink-0',
                'rounded-full overflow-hidden',
                'bg-gradient-to-br from-neutral-600 to-neutral-700',
                'border border-neutral-500/40',
                styles.container,
                className
            )}
            role="img"
            aria-label={alt}
            {...props}
        >
            {/* Image state */}
            {showImage && (
                <>
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-neutral-600 animate-pulse" />
                    )}
                    <img
                        src={src}
                        alt={alt}
                        className={cn(
                            'w-full h-full object-cover transition-opacity duration-normal',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                </>
            )}

            {/* Initials state */}
            {showInitials && (
                <span
                    className={cn(
                        'font-heading font-semibold text-lux-100 uppercase select-none',
                        styles.text
                    )}
                    aria-hidden="true"
                >
                    {initials}
                </span>
            )}

            {/* Placeholder state */}
            {showPlaceholder && (
                <svg
                    className="w-3/5 h-3/5 text-neutral-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                    />
                </svg>
            )}

            {/* Online status indicator */}
            {online !== undefined && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 rounded-full border-void',
                        online ? 'bg-success' : 'bg-neutral-500',
                        styles.indicator
                    )}
                    aria-label={online ? 'online' : 'offline'}
                />
            )}
        </div>
    )
}

/**
 * Avatar group component for displaying multiple avatars.
 */
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Maximum number of avatars to display */
    max?: number
    /** Size of avatars */
    size?: AvatarSize
}

function AvatarGroup({
    children,
    max = 3,
    size = 'md',
    className,
    ...props
}: AvatarGroupProps) {
    const childArray = Array.isArray(children) ? children : [children]
    const visibleChildren = childArray.slice(0, max)
    const remainingCount = childArray.length - max

    return (
        <div
            className={cn('flex items-center -space-x-2', className)}
            {...props}
        >
            {visibleChildren}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        'relative inline-flex items-center justify-center flex-shrink-0',
                        'rounded-full',
                        'bg-neutral-600 border-2 border-void',
                        'font-body font-medium text-neutral-200',
                        sizeStyles[size].container,
                        sizeStyles[size].text
                    )}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    )
}

export { Avatar, AvatarGroup }
export type { AvatarProps, AvatarGroupProps, AvatarSize }
