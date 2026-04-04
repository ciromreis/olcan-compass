"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  Heart, 
  Users, 
  ShoppingBag, 
  Video, 
  FileEdit, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Bell,
  Trophy,
  Star,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
  Award,
  Target,
  Flame,
  LayoutDashboard,
  Route,
  Gauge,
  Briefcase,
  Store
} from 'lucide-react'
import { useAuraStore } from '@/stores/auraStore'
import { useGuildStore } from '@/stores/guildStore'
import { useMarketplaceStore } from '@/stores/canonicalMarketplaceEconomyStore'
import { useYouTubeStore } from '@/stores/youtubeStore'
import { useRealtimeStore } from '@/stores/realtimeStore'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  description?: string
  color?: string
  gradient?: string
  requiresAuth?: boolean
}

interface NotificationItem {
  id: string
  type: 'aura' | 'guild' | 'marketplace' | 'video' | 'achievement'
  title: string
  message: string
  timestamp: string
  read: boolean
  icon: React.ReactNode
  color?: string
}

export default function UnifiedNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    totalXp: 100,
    achievements: 0,
    streak: 0
  })

  // Store hooks
  const { aura, isLoading: auraLoading } = useAuraStore()
  const { myGuild, isLoading: guildLoading } = useGuildStore()
  const { economy, isLoading: economyLoading } = useMarketplaceStore()
  const { videos, isLoading: videoLoading } = useYouTubeStore()
  const { connectionStatus, notifications: realtimeNotifications } = useRealtimeStore()

  // Navigation items - Alignment with Metamodern Journey
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Painel',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Visão geral da jornada',
      gradient: 'from-ink-600 to-ink-800'
    },
    {
      id: 'aura',
      label: 'Aura',
      href: '/aura',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Sua identidade evolutiva',
      badge: aura ? 1 : 0,
      gradient: 'from-gold-400 to-gold-600',
      requiresAuth: true
    },
    {
      id: 'routes',
      label: 'Caminhos',
      href: '/routes',
      icon: <Route className="w-5 h-5" />,
      description: 'Modelagem de rotas',
      gradient: 'from-blue-500 to-indigo-600',
      requiresAuth: true
    },
    {
      id: 'marketplace',
      label: 'Mercado',
      href: '/marketplace',
      icon: <Store className="w-5 h-5" />,
      description: 'Suporte especializado',
      gradient: 'from-emerald-500 to-teal-600',
      requiresAuth: true
    },
    {
      id: 'forge',
      label: 'Documentos',
      href: '/forge',
      icon: <FileEdit className="w-5 h-5" />,
      description: 'Narrativa e qualidade',
      gradient: 'from-amber-500 to-orange-600',
      requiresAuth: true
    }
  ]

  // Update notifications from real-time store
  useEffect(() => {
    const newNotifications = realtimeNotifications.map(notif => ({
      id: notif.id.toString(),
      type: (notif.type === 'companion' ? 'aura' : notif.type.split('_')[0]) as any,
      title: notif.title,
      message: notif.message,
      timestamp: notif.timestamp,
      read: false,
      icon: getNotificationIcon(notif.type),
      color: getNotificationColor(notif.type)
    }))
    
    setNotifications(prev => [...newNotifications, ...prev].slice(0, 10))
  }, [realtimeNotifications])

  // Update user stats
  useEffect(() => {
    if (aura) {
      setUserStats({
        level: aura.level,
        xp: aura.experiencePoints,
        totalXp: aura.level * 100,
        achievements: 0, 
        streak: 0 
      })
    }
  }, [aura])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'companion':
      case 'aura': return <Sparkles className="w-4 h-4" />
      case 'guild': return <Users className="w-4 h-4" />
      case 'marketplace': return <ShoppingBag className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'companion':
      case 'aura': return 'text-gold-500'
      case 'guild': return 'text-purple-500'
      case 'marketplace': return 'text-emerald-500'
      case 'video': return 'text-red-500'
      case 'achievement': return 'text-amber-500'
      default: return 'text-ink-400'
    }
  }

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !aura) {
      router.push('/login')
      return
    }
    
    setIsMobileMenuOpen(false)
    router.push(item.href)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-ink-950/80 backdrop-blur-xl border-b border-bone-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20"
              >
                <Sparkles className="w-6 h-6 text-ink-950" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-bone-50">Olcan Compass</span>
                <span className="text-caption font-medium uppercase tracking-wide text-gold-500/80 -mt-1">Aura v2.5</span>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 group ${
                    pathname === item.href
                      ? 'bg-bone-50/10 text-bone-50'
                      : 'text-bone-50/60 hover:text-bone-50 hover:bg-bone-50/5'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-sm group-hover:shadow-md transition-shadow`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-ink-950 text-caption font-bold rounded-full flex items-center justify-center border-2 border-ink-950">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-6">
              {/* User Stats - Glass Card */}
              <div className="flex items-center bg-bone-50/5 border border-bone-50/10 rounded-2xl px-4 py-2 space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-caption uppercase font-bold tracking-wider text-gold-500/80">Nível {userStats.level}</span>
                  <div className="w-24 h-1.5 bg-ink-800 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userStats.xp / userStats.totalXp) * 100}%` }}
                      className="h-full bg-gold-500" 
                    />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-inner">
                  <Star className="w-5 h-5 text-ink-950" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl bg-bone-50/5 hover:bg-bone-50/10 border border-bone-50/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5 text-bone-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-ink-950 text-caption font-bold rounded-full flex items-center justify-center border-2 border-ink-950">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 bg-ink-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-bone-500/10 overflow-hidden"
                      >
                        <div className="p-5 border-b border-bone-500/10 flex items-center justify-between">
                          <h3 className="font-bold text-bone-50">Notificações</h3>
                          <span className="text-xs text-gold-500 font-medium cursor-pointer hover:underline">Marcar todas como lidas</span>
                        </div>
                        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-ink-700 mx-auto mb-3 opacity-20" />
                              <p className="text-bone-500 text-sm">Nenhuma notificação por enquanto</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="p-5 hover:bg-bone-50/5 border-b border-bone-50/5 last:border-b-0 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-start space-x-4">
                                  <div className={`p-2.5 rounded-xl bg-ink-800 ${notification.color} border border-bone-50/10 shadow-sm`}>
                                    {notification.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-bone-50 text-sm group-hover:text-gold-400 transition-colors">
                                      {notification.title}
                                    </h4>
                                    <p className="text-xs text-bone-400 mt-1 leading-relaxed">
                                      {notification.message}
                                    </p>
                                    <p className="text-caption text-ink-500 font-medium mt-2 flex items-center">
                                      <Activity className="w-3 h-3 mr-1" />
                                      {new Date(notification.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings */}
                <motion.button
                  className="p-2.5 rounded-xl bg-bone-50/5 hover:bg-bone-50/10 border border-bone-50/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-bone-300" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-ink-950/90 backdrop-blur-xl border-b border-bone-500/10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Sparkles className="w-5 h-5 text-ink-950" />
              </div>
              <span className="text-lg font-bold text-bone-50">Olcan</span>
            </Link>

            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-bone-50/5 hover:bg-bone-50/10 border border-bone-50/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-bone-50" /> : <Menu className="w-5 h-5 text-bone-50" />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 top-16 z-40 bg-ink-950/98 backdrop-blur-2xl"
          >
            <div className="p-6 space-y-3">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all ${
                    pathname === item.href
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                      : 'border-bone-50/5 text-bone-100 hover:bg-bone-50/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-sm`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm tracking-wide">{item.label}</div>
                    <div className="text-caption opacity-60 font-medium uppercase tracking-wider">{item.description}</div>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="w-5 h-5 bg-gold-500 text-ink-950 text-caption font-bold rounded-full flex items-center justify-center border-2 border-ink-950">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-20" />
    </>
  )
}
