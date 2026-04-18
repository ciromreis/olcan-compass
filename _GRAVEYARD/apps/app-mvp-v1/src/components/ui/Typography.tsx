import { type HTMLAttributes, type ElementType } from 'react'
import { cn } from '../../lib/utils'

/**
 * MMXD Typography components with semantic hierarchy.
 *
 * Uses Merriweather Sans for headings and Source Sans 3 for body.
 */

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body-lg' | 'body' | 'body-sm' | 'caption'

interface TypographyProps extends HTMLAttributes<HTMLElement> {
    /** Typography variant */
    variant?: TypographyVariant
    /** Override the HTML element */
    as?: ElementType
    /** Lumina gradient text */
    gradient?: boolean
    /** Muted text color */
    muted?: boolean
}

const variantMap: Record<TypographyVariant, { tag: ElementType; styles: string }> = {
    h1: {
        tag: 'h1',
        styles: 'font-heading text-h1 text-white',
    },
    h2: {
        tag: 'h2',
        styles: 'font-heading text-h2 text-white',
    },
    h3: {
        tag: 'h3',
        styles: 'font-heading text-h3 text-white',
    },
    'body-lg': {
        tag: 'p',
        styles: 'font-body text-body-lg text-neutral-100',
    },
    body: {
        tag: 'p',
        styles: 'font-body text-body text-neutral-200',
    },
    'body-sm': {
        tag: 'p',
        styles: 'font-body text-body-sm text-neutral-300',
    },
    caption: {
        tag: 'span',
        styles: 'font-body text-caption text-neutral-400',
    },
}

/**
 * Semantic typography component with MMXD font pairing.
 */
function Typography({
    variant = 'body',
    as,
    gradient = false,
    muted = false,
    children,
    className,
    ...props
}: TypographyProps) {
    const { tag: Tag, styles } = variantMap[variant]
    const Component = as || Tag

    return (
        <Component
            className={cn(
                styles,
                gradient && 'text-transparent bg-clip-text bg-gradient-lumina',
                muted && 'text-neutral-400',
                className
            )}
            {...props}
        >
            {children}
        </Component>
    )
}

/**
 * Shorthand components for common typography use cases.
 */
function Heading1(props: Omit<TypographyProps, 'variant'>) {
    return <Typography variant="h1" {...props} />
}

function Heading2(props: Omit<TypographyProps, 'variant'>) {
    return <Typography variant="h2" {...props} />
}

function Heading3(props: Omit<TypographyProps, 'variant'>) {
    return <Typography variant="h3" {...props} />
}

function BodyText(props: Omit<TypographyProps, 'variant'>) {
    return <Typography variant="body" {...props} />
}

function Caption(props: Omit<TypographyProps, 'variant'>) {
    return <Typography variant="caption" {...props} />
}

export { Typography, Heading1, Heading2, Heading3, BodyText, Caption }
export type { TypographyProps, TypographyVariant }
