import { forwardRef, useState, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface SidebarNavItem {
  /** Item label */
  label: string
  /** Navigation path */
  href?: string
  /** Icon component */
  icon?: ReactNode
  /** Badge content (e.g., notification count) */
  badge?: string | number
  /** Nested navigation items */
  children?: SidebarNavItem[]
  /** Whether item is disabled */
  disabled?: boolean
}

export interface SidebarProps extends BaseComponentProps {
  /** Navigation items */
  items: SidebarNavItem[]
  /** Whether sidebar is collapsed */
  collapsed?: boolean
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Header content */
  header?: ReactNode
  /** Footer content */
  footer?: ReactNode
}

interface SidebarItemProps {
  item: SidebarNavItem
  collapsed: boolean
  level?: number
}

const SidebarItem = ({ item, collapsed, level = 0 }: SidebarItemProps) => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? location.pathname === item.href : false

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    }
  }

  const itemContent = (
    <>
      {item.icon && (
        <span className="flex-shrink-0">
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-lumina-300 text-void-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <span className="flex-shrink-0">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </>
      )}
    </>
  )

  const baseClasses = cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
    'hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300',
    isActive && 'bg-lumina-300/10 text-lumina-200',
    !isActive && 'text-lux-200',
    item.disabled && 'opacity-50 cursor-not-allowed',
    level > 0 && 'ml-6'
  )

  const content = item.href && !hasChildren ? (
    <Link
      to={item.href}
      className={baseClasses}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={item.disabled}
    >
      {itemContent}
    </Link>
  ) : (
    <button
      onClick={handleClick}
      className={baseClasses}
      disabled={item.disabled}
      aria-expanded={hasChildren ? isOpen : undefined}
    >
      {itemContent}
    </button>
  )

  return (
    <div>
      {content}
      {hasChildren && isOpen && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <SidebarItem key={index} item={child} collapsed={collapsed} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Sidebar navigation component with collapsible support
 * Supports nested navigation groups and active state highlighting
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, items, collapsed = false, header, footer, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-void-primary border-r border-neutral-700 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
        {...props}
      >
        {header && (
          <div className={cn('p-4 border-b border-neutral-700', collapsed && 'px-2')}>
            {header}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item, index) => (
            <SidebarItem key={index} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {footer && (
          <div className={cn('p-4 border-t border-neutral-700', collapsed && 'px-2')}>
            {footer}
          </div>
        )}
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'
