import { forwardRef, useState, ReactNode, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface TabItem {
  /** Tab identifier */
  value: string
  /** Tab label */
  label: string
  /** Tab content */
  content: ReactNode
  /** Whether tab is disabled */
  disabled?: boolean
  /** Badge content */
  badge?: string | number
}

export interface TabsProps extends BaseComponentProps {
  /** Tab items */
  items: TabItem[]
  /** Default active tab value */
  defaultValue?: string
  /** Controlled active tab value */
  value?: string
  /** Callback when tab changes */
  onChange?: (value: string) => void
  /** Tab variant */
  variant?: 'default' | 'pills'
  /** Whether tabs should fill container width */
  fullWidth?: boolean
}

/**
 * Tabs component with keyboard navigation
 * Supports controlled and uncontrolled modes
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      items,
      defaultValue,
      value: controlledValue,
      onChange,
      variant = 'default',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || items[0]?.value)
    const activeValue = controlledValue !== undefined ? controlledValue : internalValue

    const handleTabClick = (value: string, disabled?: boolean) => {
      if (disabled) return
      
      if (controlledValue === undefined) {
        setInternalValue(value)
      }
      onChange?.(value)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const enabledItems = items.filter(item => !item.disabled)
      const currentIndex = enabledItems.findIndex(item => item.value === activeValue)
      let nextIndex = currentIndex

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % enabledItems.length
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        nextIndex = currentIndex - 1 < 0 ? enabledItems.length - 1 : currentIndex - 1
      } else if (event.key === 'Home') {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === 'End') {
        event.preventDefault()
        nextIndex = enabledItems.length - 1
      }

      if (nextIndex !== currentIndex) {
        handleTabClick(enabledItems[nextIndex].value)
      }
    }

    const activeItem = items.find(item => item.value === activeValue)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Tab List */}
        <div
          role="tablist"
          className={cn(
            'flex border-b border-neutral-700',
            fullWidth && 'w-full',
            variant === 'pills' && 'border-0 gap-2 p-1 bg-neutral-800 rounded-lg'
          )}
        >
          {items.map((item) => {
            const isActive = item.value === activeValue

            return (
              <button
                key={item.value}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.value}`}
                aria-disabled={item.disabled}
                tabIndex={isActive ? 0 : -1}
                disabled={item.disabled}
                onClick={() => handleTabClick(item.value, item.disabled)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-lumina-300 focus:ring-offset-2 focus:ring-offset-void-primary',
                  fullWidth && 'flex-1',
                  variant === 'default' && [
                    'border-b-2',
                    isActive
                      ? 'border-lumina-300 text-lumina-200'
                      : 'border-transparent text-lux-300 hover:text-lux-200 hover:border-neutral-600',
                  ],
                  variant === 'pills' && [
                    'rounded-md',
                    isActive
                      ? 'bg-void-primary text-lumina-200'
                      : 'text-lux-300 hover:text-lux-200 hover:bg-neutral-700',
                  ],
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-lumina-300 text-void-primary">
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Panel */}
        {activeItem && (
          <div
            role="tabpanel"
            id={`tabpanel-${activeItem.value}`}
            aria-labelledby={`tab-${activeItem.value}`}
            className="mt-4"
          >
            {activeItem.content}
          </div>
        )}
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'
