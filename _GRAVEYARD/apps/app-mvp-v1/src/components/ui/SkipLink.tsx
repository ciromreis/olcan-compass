import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SkipLinkProps {
  /** Target element ID to skip to */
  href: string
  /** Link text */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Skip navigation link for keyboard users
 * Visible only when focused, allows jumping to main content
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed top-4 left-4 z-[9999]',
          'px-4 py-2 rounded-lg',
          'bg-lumina text-white font-medium',
          'focus:outline-none focus:ring-2 focus:ring-lumina-300',
          'transition-all',
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = 'SkipLink'
