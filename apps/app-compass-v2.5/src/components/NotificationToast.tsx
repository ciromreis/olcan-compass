/**
 * Notification Toast System
 * Shows achievement unlocks, level ups, and other notifications
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Star, Zap, Heart, Award, TrendingUp } from 'lucide-react'

export type NotificationType = 'achievement' | 'level_up' | 'evolution' | 'quest_complete' | 'streak' | 'ability_unlock'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  icon?: React.ReactNode
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationToastProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  achievement: <Trophy className="w-6 h-6" />,
  level_up: <TrendingUp className="w-6 h-6" />,
  evolution: <Star className="w-6 h-6" />,
  quest_complete: <Award className="w-6 h-6" />,
  streak: <Heart className="w-6 h-6" />,
  ability_unlock: <Zap className="w-6 h-6" />
}

const NOTIFICATION_COLORS: Record<NotificationType, { gradient: string; glow: string }> = {
  achievement: { gradient: 'from-slate-500 to-slate-500', glow: 'shadow-slate-500/50' },
  level_up: { gradient: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' },
  evolution: { gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' },
  quest_complete: { gradient: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/50' },
  streak: { gradient: 'from-red-500 to-pink-500', glow: 'shadow-red-500/50' },
  ability_unlock: { gradient: 'from-indigo-500 to-purple-500', glow: 'shadow-indigo-500/50' }
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ToastItem: React.FC<{
  notification: Notification
  onDismiss: (id: string) => void
}> = ({ notification, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false)
  const colors = NOTIFICATION_COLORS[notification.type]
  const icon = notification.icon || NOTIFICATION_ICONS[notification.type]
  const duration = notification.duration || 5000

  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => {
        onDismiss(notification.id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isHovered, duration, notification.id, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl ${colors.glow}`}
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-90`} />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {icon}
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-lg mb-1">{notification.title}</h4>
            <p className="text-white/90 text-sm">{notification.description}</p>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {!isHovered && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/30"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </motion.div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random()}`
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll
  }
}

// Pre-built notification creators
export const NotificationCreators = {
  achievementUnlocked: (achievementName: string, xp: number): Omit<Notification, 'id'> => ({
    type: 'achievement',
    title: 'Achievement Unlocked!',
    description: `${achievementName} (+${xp} XP)`,
    duration: 6000
  }),

  levelUp: (newLevel: number): Omit<Notification, 'id'> => ({
    type: 'level_up',
    title: `Level ${newLevel}!`,
    description: 'Your companion has grown stronger!',
    duration: 5000
  }),

  evolution: (stageName: string): Omit<Notification, 'id'> => ({
    type: 'evolution',
    title: 'Evolution Complete!',
    description: `Your companion evolved to ${stageName}!`,
    duration: 7000
  }),

  questComplete: (questName: string, xp: number): Omit<Notification, 'id'> => ({
    type: 'quest_complete',
    title: 'Quest Complete!',
    description: `${questName} (+${xp} XP)`,
    duration: 5000
  }),

  streakMilestone: (days: number): Omit<Notification, 'id'> => ({
    type: 'streak',
    title: `${days} Day Streak!`,
    description: 'Keep up the great work!',
    duration: 6000
  }),

  abilityUnlocked: (abilityName: string): Omit<Notification, 'id'> => ({
    type: 'ability_unlock',
    title: 'New Ability!',
    description: `Unlocked: ${abilityName}`,
    duration: 5000
  })
}
