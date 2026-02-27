import { forwardRef, ReactNode, useState, useRef, useEffect } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'
import type { BaseComponentProps } from './types'

export interface TopBarProps extends BaseComponentProps {
  /** Left content (e.g., logo, breadcrumb) */
  left?: ReactNode
  /** Center content */
  center?: ReactNode
  /** Right content (overrides default user menu) */
  right?: ReactNode
  /** User information */
  user?: {
    name: string
    email: string
    avatar?: string
  }
  /** Notification count */
  notificationCount?: number
  /** Callback when notifications clicked */
  onNotificationsClick?: () => void
  /** Callback when user menu clicked */
  onUserMenuClick?: () => void
  /** Callback when mobile menu toggled */
  onMobileMenuToggle?: () => void
  /** Whether mobile menu is open */
  mobileMenuOpen?: boolean
}

/**
 * TopBar component with user menu and notifications
 * Responsive behavior for mobile devices
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(
  (
    {
      className,
      left,
      center,
      right,
      user,
      notificationCount = 0,
      onNotificationsClick,
      onUserMenuClick,
      onMobileMenuToggle,
      mobileMenuOpen = false,
      ...props
    },
    ref
  ) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setUserMenuOpen(false)
        }
      }

      if (userMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [userMenuOpen])

    const handleUserMenuClick = () => {
      setUserMenuOpen(!userMenuOpen)
      onUserMenuClick?.()
    }

    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between h-16 px-4 md:px-6 bg-void-light border-b border-neutral-700',
          className
        )}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {left}
        </div>

        {/* Center Section */}
        {center && <div className="hidden md:flex items-center flex-1 justify-center">{center}</div>}

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          {right ? (
            right
          ) : (
            <>
              {/* Notifications */}
              <button
                onClick={onNotificationsClick}
                className="relative p-2 rounded-lg hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300"
                aria-label="Notificações"
              >
                <Bell size={20} className="text-lux-200" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-void-primary bg-semantic-error rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={handleUserMenuClick}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lumina-300"
                    aria-label="Menu do usuário"
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar src={user.avatar} alt={user.name} size="sm" />
                    <span className="hidden md:block text-sm text-lux-200 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-void-light border border-neutral-700 rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-neutral-700">
                        <p className="text-sm font-medium text-lux-100">{user.name}</p>
                        <p className="text-xs text-lux-300 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full px-3 py-2 text-left text-sm text-lux-200 hover:bg-neutral-700 rounded">
                          Perfil
                        </button>
                        <button className="w-full px-3 py-2 text-left text-sm text-lux-200 hover:bg-neutral-700 rounded">
                          Configurações
                        </button>
                        <button className="w-full px-3 py-2 text-left text-sm text-semantic-error hover:bg-neutral-700 rounded">
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </header>
    )
  }
)

TopBar.displayName = 'TopBar'
