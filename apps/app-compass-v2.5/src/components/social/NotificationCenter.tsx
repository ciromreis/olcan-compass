/**
 * Notification Center Component
 * 
 * Displays user notifications with real-time updates.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell,
  X,
  Check,
  Award,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { GlassCard } from '@/components/ui'

type NotificationType = 
  | 'achievement'
  | 'level_up'
  | 'quest'
  | 'guild_invite'
  | 'guild_event'
  | 'follower'
  | 'comment'
  | 'like'
  | 'system'

interface Notification {
  id: string
  notification_type: NotificationType
  title: string
  message?: string
  action_url?: string
  is_read: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  achievement: Award,
  level_up: TrendingUp,
  quest: Award,
  guild_invite: Users,
  guild_event: Calendar,
  follower: UserPlus,
  comment: MessageCircle,
  like: Heart,
  system: AlertCircle
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  achievement: 'text-slate-500',
  level_up: 'text-green-500',
  quest: 'text-blue-500',
  guild_invite: 'text-purple-500',
  guild_event: 'text-indigo-500',
  follower: 'text-pink-500',
  comment: 'text-cyan-500',
  like: 'text-red-500',
  system: 'text-slate-500'
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getNotifications()
      const remoteNotifications = (data as Notification[]) || []
      setNotifications(remoteNotifications)
      setUnreadCount(remoteNotifications.filter((n) => !n.is_read).length)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load notifications:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      void loadNotifications()
    }
  }, [isOpen, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationRead(notificationId)
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mark notification as read:', error)
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mark all as read:', error)
      }
    }
  }

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    setNotifications(notifications.filter(n => n.id !== notificationId))
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <GlassCard className="max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-foreground/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
                  <p className="text-foreground/60 font-medium">No notifications</p>
                  <p className="text-foreground/40 text-sm mt-1">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-foreground/10">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={() => markAsRead(notification.id)}
                        onDelete={() => deleteNotification(notification.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete
}: {
  notification: Notification
  onMarkRead: () => void
  onDelete: () => void
}) {
  const Icon = NOTIFICATION_ICONS[notification.notification_type]
  const colorClass = NOTIFICATION_COLORS[notification.notification_type]
  const timeAgo = getTimeAgo(notification.created_at)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 hover:bg-foreground/5 transition-all cursor-pointer ${
        !notification.is_read ? 'bg-purple-500/5' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
            )}
          </div>
          
          {notification.message && (
            <p className="text-sm text-foreground/70 mb-2">
              {notification.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/40">{timeAgo}</span>
            
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkRead()
                  }}
                  className="p-1 hover:bg-foreground/10 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 hover:bg-foreground/10 rounded transition-colors"
                title="Delete"
              >
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export default NotificationCenter
