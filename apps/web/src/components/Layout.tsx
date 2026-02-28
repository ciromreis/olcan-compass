import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Brain,
  Map,
  BookOpen,
  MessageSquare,
  FolderOpen,
  Zap,
  Store,
  Filter,
  Compass,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useLogout } from '@/hooks/useAuth'
import { BottomTabBar } from './ui/BottomTabBar'
import { MobileMenu } from './ui/MobileMenu'
import { MaterialSymbol } from './ui/MaterialSymbol'

/**
 * Navigation items for the main sidebar.
 * Labels are in PT-BR per MMXD spec.
 */
const NAV_ITEMS = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/psychology', label: 'Perfil', icon: Brain },
  { path: '/routes', label: 'Rotas', icon: Map },
  { path: '/narratives', label: 'Narrativas', icon: BookOpen },
  { path: '/interviews', label: 'Entrevistas', icon: MessageSquare },
  { path: '/applications', label: 'Candidaturas', icon: FolderOpen },
  { path: '/sprints', label: 'Sprints', icon: Zap },
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/constraints', label: 'Restrições', icon: Filter },
]

/**
 * MMXD Layout — Void dark sidebar with Lux/Lumina accents.
 * Implements the Operating Map navigation pattern from the PRD.
 * Responsive: Desktop sidebar, mobile bottom tab bar + hamburger menu.
 */
export function Layout() {
  const location = useLocation()
  const { user } = useAuthStore()
  const logoutMutation = useLogout()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mobile bottom nav follows Stitch/global-mobile IA: Home / Rotas / Prática / Candidaturas / Mais
  const mobileTabItems = [
    { href: '/', label: 'Home', icon: <MaterialSymbol name="home" size={22} /> },
    { href: '/routes', label: 'Rotas', icon: <MaterialSymbol name="route" size={22} /> },
    { href: '/interviews', label: 'Prática', icon: <MaterialSymbol name="psychology_alt" size={22} /> },
    { href: '/applications', label: 'Candidaturas', icon: <MaterialSymbol name="work" size={22} /> },
    { href: '/more', label: 'Mais', icon: <MaterialSymbol name="more_horiz" size={22} /> },
  ]

  return (
    <div className="flex h-screen bg-void">
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-neutral-800/80 backdrop-blur-lg border-r border-neutral-700/50 flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-neutral-700/40">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lumina-200 to-lumina-300 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-normal">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-white tracking-tight">
                Compass
              </span>
              <span className="block text-caption text-neutral-400 -mt-0.5">
                Olcan Mobility OS
              </span>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-body-sm font-medium
                  transition-all duration-fast
                  group
                  ${isActive
                    ? 'bg-lumina/10 text-lumina border-l-[3px] border-lumina ml-0'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-lumina' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-lumina/60" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-neutral-700/40">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 flex items-center justify-center text-caption font-bold text-white">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-white truncate">
                {user?.full_name || 'Usuário'}
              </p>
              <p className="text-caption text-neutral-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="p-1.5 rounded-md text-neutral-400 hover:text-error hover:bg-error/10 transition-colors duration-fast"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main id="main-content" className="flex-1 overflow-auto pb-24 md:pb-0" tabIndex={-1}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle grain overlay for Liquid Glass (mobile-first) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] noise-overlay" />
          {/* Mobile Header with Hamburger */}
          <div className="md:hidden flex items-center justify-between mb-4 pb-4 border-b border-neutral-700">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lumina-200 to-lumina-300 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-white">Compass</span>
            </Link>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar (visible on mobile only) ── */}
      <div className="md:hidden">
        <BottomTabBar items={mobileTabItems} />
      </div>

      {/* ── Mobile Hamburger Menu ── */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Menu"
      >
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-neutral-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-neutral-400 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-lumina/10 text-lumina border-l-2 border-lumina'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-lumina' : 'text-neutral-400'}`} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-6 pt-6 border-t border-neutral-700">
          <button
            onClick={() => {
              logoutMutation.mutate()
              setIsMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </MobileMenu>
    </div>
  )
}
