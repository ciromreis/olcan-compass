"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Users, 
  Sword, 
  ShoppingBag, 
  Video, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  Search,
  User,
  Zap,
  Trophy,
  Target,
  Download,
  Share2,
  Heart,
  Star,
  Crown
} from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: string
  description?: string
  isNew?: boolean
}

const Navigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('companion')
  const [showNotifications, setShowNotifications] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      id: 'companion',
      label: 'Companion',
      icon: <Heart className="w-5 h-5" />,
      href: '/companion',
      description: 'Your digital career companion'
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: <Star className="w-5 h-5" />,
      href: '/companion/discover',
      description: 'Find your perfect companion',
      isNew: true
    },
    {
      id: 'forge',
      label: 'Narrative Forge',
      icon: <FileText className="w-5 h-5" />,
      href: '/forge',
      description: 'AI-powered document creation'
    },
    {
      id: 'interviews',
      label: 'Interview Practice',
      icon: <Target className="w-5 h-5" />,
      href: '/interviews',
      description: 'Practice with AI feedback'
    },
    {
      id: 'youtube',
      label: 'YouTube Studio',
      icon: <Video className="w-5 h-5" />,
      href: '/youtube',
      description: 'Create YouTube videos',
      isNew: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/analytics',
      description: 'Document analysis & insights'
    },
    {
      id: 'guilds',
      label: 'Guilds',
      icon: <Users className="w-5 h-5" />,
      href: '/guilds',
      description: 'Join guilds and battles',
      badge: 'New'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="w-5 h-5" />,
      href: '/marketplace',
      description: 'Buy accessories and items'
    },
    {
      id: 'export',
      label: 'Export & Share',
      icon: <Download className="w-5 h-5" />,
      href: '/export',
      description: 'Export and share creations'
    }
  ]

  const notifications = [
    {
      id: '1',
      title: 'Your companion leveled up!',
      message: 'Flame reached level 15',
      time: '2 min ago',
      icon: <Zap className="w-4 h-4 text-yellow-500" />
    },
    {
      id: '2',
      title: 'Guild battle starting soon',
      message: 'Dragon Masters vs Strategic Minds',
      time: '15 min ago',
      icon: <Sword className="w-4 h-4 text-red-500" />
    },
    {
      id: '3',
      title: 'New item in marketplace',
      message: 'Legendary Dragon Wings available',
      time: '1 hour ago',
      icon: <ShoppingBag className="w-4 h-4 text-purple-500" />
    }
  ]

  const handleNavigation = (itemId: string, href: string) => {
    setActiveItem(itemId)
    setIsSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <GlassButton
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          size="sm"
          variant="default"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </GlassButton>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md z-50 lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Olcan Compass</h2>
                  <GlassButton
                    onClick={() => setIsSidebarOpen(false)}
                    size="sm"
                    variant="default"
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id, item.href)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                        activeItem === item.id
                          ? 'bg-companion-primary/20 text-companion-primary'
                          : 'text-foreground/60 hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.isNew && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/60">{item.description}</p>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-1 bg-companion-accent/20 text-companion-accent text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-md border-r border-white/10 z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-companion-primary to-companion-secondary rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Olcan Compass</h1>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.href)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                  activeItem === item.id
                    ? 'bg-companion-primary/20 text-companion-primary'
                    : 'text-foreground/60 hover:text-foreground hover:bg-white/10'
                }`}
              >
                {item.icon}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60">{item.description}</p>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 bg-companion-accent/20 text-companion-accent text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-companion-primary to-companion-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">John Doe</div>
              <div className="text-xs text-foreground/60">Level 15 Strategist</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <GlassButton
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full"
              variant="default"
              size="sm"
            >
              <Bell className="w-4 h-4" />
              Notifications
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </GlassButton>
            
            <GlassButton
              className="w-full"
              variant="default"
              size="sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </GlassButton>
            
            <GlassButton
              className="w-full"
              variant="default"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden lg:block absolute bottom-32 left-6 right-6 z-40"
          >
            <GlassCard className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 liquid-glass rounded-lg">
                    {notification.icon}
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">
                        {notification.title}
                      </div>
                      <div className="text-xs text-foreground/60">
                        {notification.message}
                      </div>
                      <div className="text-xs text-foreground/40 mt-1">
                        {notification.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar for Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-white/10 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-companion-primary to-companion-secondary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Olcan Compass</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <GlassButton size="sm" variant="default">
              <Search className="w-4 h-4" />
            </GlassButton>
            <GlassButton size="sm" variant="default">
              <Bell className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navigation
