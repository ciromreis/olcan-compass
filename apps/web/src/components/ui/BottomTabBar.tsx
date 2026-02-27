import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface TabBarItem {
  /** Item label */
  label: string
  /** Navigation path */
  href: string
  /** Icon component */
  icon: React.ReactNode
  /** Badge content (e.g., notification count) */
  badge?: string | number
}

export interface BottomTabBarProps extends BaseComponentProps {
  /** Tab items */
  items: TabBarItem[]
}

/**
 * Mobile bottom tab bar navigation
 * Provides touch-friendly navigation with 44x44px minimum touch targets
 */
export const BottomTabBar = forwardRef<HTMLElement, BottomTabBarProps>(
  ({ className, items, ...props }, ref) => {
    const location = useLocation()

    return (
      <nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-void-primary/95 backdrop-blur-lg',
          'border-t border-neutral-700',
          'safe-area-inset-bottom',
          className
        )}
        aria-
        {...props}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'min-w-[44px] min-h-[44px] px-3 py-2',
                  'rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-lumina-300',
                  isActive && 'text-lumina-200',
                  !isActive && 'text-neutral-400 hover:text-lux-200'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-error text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-0.5 truncate max-w-[60px]">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }
)

BottomTabBar.displayName = 'BottomTabBar'
