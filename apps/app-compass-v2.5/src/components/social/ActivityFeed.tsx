/**
 * Activity Feed Component
 * 
 * Displays user activity feed with social interactions.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  MessageCircle, 
  Share2,
  TrendingUp,
  Award,
  FileText,
  Mic,
  Users,
  Zap,
  MoreHorizontal
} from 'lucide-react'
import { GlassCard } from '@/components/ui'

type ActivityType = 
  | 'achievement_unlocked'
  | 'level_up'
  | 'companion_evolved'
  | 'quest_completed'
  | 'document_created'
  | 'interview_completed'
  | 'resource_published'
  | 'guild_joined'
  | 'guild_event'

interface Activity {
  id: string
  user_id: string
  user_name?: string
  user_avatar?: string
  activity_type: ActivityType
  title: string
  description?: string
  metadata?: Record<string, any>
  like_count: number
  comment_count: number
  created_at: string
  is_liked?: boolean
}

interface ActivityFeedProps {
  userId?: string
  includeFollowing?: boolean
  limit?: number
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Award> = {
  achievement_unlocked: Award,
  level_up: TrendingUp,
  companion_evolved: Zap,
  quest_completed: Award,
  document_created: FileText,
  interview_completed: Mic,
  resource_published: FileText,
  guild_joined: Users,
  guild_event: Users
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  achievement_unlocked: 'text-amber-500',
  level_up: 'text-green-500',
  companion_evolved: 'text-purple-500',
  quest_completed: 'text-blue-500',
  document_created: 'text-indigo-500',
  interview_completed: 'text-pink-500',
  resource_published: 'text-teal-500',
  guild_joined: 'text-orange-500',
  guild_event: 'text-cyan-500'
}

export function ActivityFeed({ 
  userId, 
  includeFollowing = true,
  limit = 20 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [userId, includeFollowing])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch from API
      // Placeholder data
      setActivities([
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Sarah Chen',
          activity_type: 'achievement_unlocked',
          title: 'Unlocked "Document Master" achievement',
          description: 'Created 10 professional documents',
          like_count: 12,
          comment_count: 3,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          metadata: { achievement_name: 'Document Master', rarity: 'rare' }
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Alex Rodriguez',
          activity_type: 'level_up',
          title: 'Reached Level 15!',
          description: 'Gained 500 XP from completing quests',
          like_count: 24,
          comment_count: 7,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          metadata: { level: 15, xp_gained: 500 }
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Maria Silva',
          activity_type: 'interview_completed',
          title: 'Completed Technical Interview Practice',
          description: 'Scored 85/100 with excellent communication',
          like_count: 8,
          comment_count: 2,
          created_at: new Date(Date.now() - 10800000).toISOString(),
          metadata: { score: 85, interview_type: 'technical' }
        }
      ])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load activities:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (activityId: string) => {
    // TODO: Call API to like activity
    setActivities(activities.map(a => 
      a.id === activityId 
        ? { ...a, like_count: a.is_liked ? a.like_count - 1 : a.like_count + 1, is_liked: !a.is_liked }
        : a
    ))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-foreground/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-3/4" />
                <div className="h-3 bg-foreground/10 rounded w-1/2" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
          >
            <ActivityCard 
              activity={activity} 
              onLike={() => handleLike(activity.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {activities.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">
            No activities yet
          </h3>
          <p className="text-foreground/40">
            Start completing quests and achievements to see activity here
          </p>
        </GlassCard>
      )}
    </div>
  )
}

function ActivityCard({ 
  activity, 
  onLike 
}: { 
  activity: Activity
  onLike: () => void 
}) {
  const Icon = ACTIVITY_ICONS[activity.activity_type]
  const colorClass = ACTIVITY_COLORS[activity.activity_type]
  const timeAgo = getTimeAgo(activity.created_at)

  return (
    <GlassCard className="p-6 hover:bg-foreground/5 transition-all">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {activity.user_avatar ? (
            <img 
              src={activity.user_avatar} 
              alt={activity.user_name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            activity.user_name?.charAt(0) || '?'
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{activity.user_name || 'User'}</span>
                <span className="text-foreground/40 text-sm">·</span>
                <span className="text-foreground/40 text-sm">{timeAgo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${colorClass}`} />
                <span className="font-medium">{activity.title}</span>
              </div>
            </div>
            <button className="text-foreground/40 hover:text-foreground p-1">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="text-foreground/70 text-sm mb-3">
              {activity.description}
            </p>
          )}

          {/* Metadata */}
          {activity.metadata && (
            <div className="mb-3 flex flex-wrap gap-2">
              {Object.entries(activity.metadata).map(([key, value]) => (
                <span 
                  key={key}
                  className="px-2 py-1 rounded-full bg-foreground/10 text-xs font-medium"
                >
                  {String(value)}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 text-foreground/60">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 hover:text-pink-500 transition-colors ${
                activity.is_liked ? 'text-pink-500' : ''
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${activity.is_liked ? 'fill-current' : ''}`} 
              />
              <span className="text-sm">{activity.like_count}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{activity.comment_count}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
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

export default ActivityFeed
