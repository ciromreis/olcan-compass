import { forwardRef, Fragment, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface BreadcrumbItem {
  /** Item label */
  label: string
  /** Navigation path (omit for current page) */
  href?: string
  /** Custom icon */
  icon?: ReactNode
}

export interface BreadcrumbProps extends BaseComponentProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[]
  /** Whether to show home icon for first item */
  showHomeIcon?: boolean
  /** Separator element */
  separator?: ReactNode
  /** Maximum items to show before collapsing */
  maxItems?: number
}

/**
 * Breadcrumb component for navigation hierarchy
 * Supports dynamic path generation and responsive collapsing
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      className,
      items,
      showHomeIcon = true,
      separator = <ChevronRight size={16} className="text-neutral-400" />,
      maxItems,
      ...props
    },
    ref
  ) => {
    // Handle collapsing if maxItems is set
    let displayItems = items
    let hasCollapsed = false

    if (maxItems && items.length > maxItems) {
      hasCollapsed = true
      const firstItem = items[0]
      const lastItems = items.slice(-(maxItems - 1))
      displayItems = [firstItem, ...lastItems]
    }

    return (
      <nav
        ref={ref}
        aria-
        className={cn('flex items-center', className)}
        {...props}
      >
        <ol className="flex items-center gap-2 flex-wrap">
          {displayItems.map((item, index) => {
            const isFirst = index === 0
            const isLast = index === displayItems.length - 1
            const showCollapsedIndicator = hasCollapsed && index === 1

            return (
              <Fragment key={index}>
                {/* Separator */}
                {!isFirst && !showCollapsedIndicator && (
                  <li aria-hidden="true" className="flex items-center">
                    {separator}
                  </li>
                )}

                {/* Collapsed Indicator */}
                {showCollapsedIndicator && (
                  <li aria-hidden="true" className="flex items-center gap-2">
                    {separator}
                    <span className="text-neutral-400">...</span>
                    {separator}
                  </li>
                )}

                {/* Breadcrumb Item */}
                <li className="flex items-center">
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-1.5 text-sm hover:text-lumina-200 transition-colors',
                        'focus:outline-none focus:underline',
                        isLast ? 'text-lux-100 font-medium' : 'text-lux-300'
                      )}
                    >
                      {isFirst && showHomeIcon && !item.icon && <Home size={16} />}
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      <span className="truncate max-w-[200px]">{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'flex items-center gap-1.5 text-sm',
                        isLast ? 'text-lux-100 font-medium' : 'text-lux-300'
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {isFirst && showHomeIcon && !item.icon && <Home size={16} />}
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      <span className="truncate max-w-[200px]">{item.label}</span>
                    </span>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'
