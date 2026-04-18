/**
 * Celebration System
 * 
 * Provides toast notifications and modal celebrations for gamification events.
 * Includes achievement unlocks, level ups, quest completions, and streak milestones.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Star,
  Sparkles,
  Zap,
  Target,
  Flame,
  X,
  ChevronRight,
  Crown,
} from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { 
  useGamificationStore,
  type GamificationEvent,
} from '@/stores/eventDrivenGamificationStore'

// ============================================================================
// TYPES
// ============================================================================

type ToastType = 'achievement' | 'levelup' | 'quest' | 'streak' | 'reward'

interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  meta?: Record<string, unknown>
  duration?: number
}

// ============================================================================
// CELEBRATION TOAST SYSTEM
// ============================================================================

export function CelebrationToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Get the event subscription function from the store
  const gamificationStore = useGamificationStore()

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id, duration: toast.duration || 5000 }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }, [removeToast])

  useEffect(() => {
    const unsubscribe = gamificationStore.onGamificationEvent((event: GamificationEvent) => {
      const toast = createToastFromEvent(event)
      if (toast) {
        addToast(toast)
      }
    })

    return unsubscribe
  }, [gamificationStore, addToast])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = TOAST_CONFIG[toast.type]
  const meta = (toast.meta || {}) as Record<string, string | number | boolean | undefined>

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className="pointer-events-auto"
    >
      <GlassCard 
        className={`p-4 min-w-[320px] max-w-[400px] border-l-4 ${config.borderColor}`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className={`p-2 rounded-full ${config.bgColor}`}
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <config.icon className={`w-5 h-5 ${config.iconColor}`} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${config.titleColor}`}>
              {toast.title}
            </h4>
            <p className="text-sm text-foreground/80 mt-0.5">
              {String(toast.message)}
            </p>
            
            {/* Meta info */}
            {Object.keys(meta).length > 0 && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {meta.xpReward && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Zap className="w-3 h-3" />
                    +{String(meta.xpReward)} XP
                  </span>
                )}
                {meta.coinReward && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Star className="w-3 h-3" />
                    +{String(meta.coinReward)} coins
                  </span>
                )}
                {meta.rarity && (
                  <span className={`capitalize ${RARITY_COLORS[String(meta.rarity)]}`}>
                    {String(meta.rarity)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <motion.div
          className={`h-0.5 mt-3 rounded-full ${config.progressColor}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration! / 1000, ease: 'linear' }}
        />
      </GlassCard>
    </motion.div>
  )
}

const TOAST_CONFIG: Record<ToastType, {
  icon: typeof Trophy
  iconColor: string
  bgColor: string
  borderColor: string
  titleColor: string
  progressColor: string
}> = {
  achievement: {
    icon: Trophy,
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-l-slate-400',
    titleColor: 'text-slate-400',
    progressColor: 'bg-slate-400',
  },
  levelup: {
    icon: Crown,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-l-purple-400',
    titleColor: 'text-purple-400',
    progressColor: 'bg-purple-400',
  },
  quest: {
    icon: Target,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-l-blue-400',
    titleColor: 'text-blue-400',
    progressColor: 'bg-blue-400',
  },
  streak: {
    icon: Flame,
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-l-slate-400',
    titleColor: 'text-slate-400',
    progressColor: 'bg-slate-400',
  },
  reward: {
    icon: Sparkles,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-l-green-400',
    titleColor: 'text-green-400',
    progressColor: 'bg-green-400',
  },
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-slate-400',
}

interface ToastData {
  type: ToastType
  title: string
  message: string
  meta?: Record<string, unknown>
  duration?: number
}

function createToastFromEvent(event: GamificationEvent): ToastData | null {
  switch (event.type) {
    case 'achievement.unlocked':
      return {
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: event.payload.name as string,
        meta: {
          xpReward: event.payload.xpReward,
          rarity: event.payload.rarity,
        },
        duration: 6000,
      }
    
    case 'level.up':
      return {
        type: 'levelup',
        title: `Level ${event.payload.newLevel}!`,
        message: `You've reached ${event.payload.newTitle} rank!`,
        meta: {
          newLevel: event.payload.newLevel,
          newTitle: event.payload.newTitle,
        },
        duration: 5000,
      }
    
    case 'quest.completed':
      return {
        type: 'quest',
        title: 'Quest Complete!',
        message: event.payload.name as string,
        meta: {
          xpReward: event.payload.xpReward,
          coinReward: event.payload.coinReward,
        },
        duration: 5000,
      }
    
    case 'quest.claimed':
      return {
        type: 'reward',
        title: 'Rewards Claimed!',
        message: 'Your quest rewards have been added',
        meta: {
          xpReward: event.payload.xpReward,
          coinReward: event.payload.coinReward,
        },
        duration: 4000,
      }
    
    case 'streak.updated':
      if (event.payload.broken) return null
      const streak = event.payload.streak as number
      if (streak === 1) return null // Don't show for day 1
      
      return {
        type: 'streak',
        title: `${streak} Day Streak!`,
        message: streak >= 7 
          ? `Amazing dedication! Keep it up!` 
          : `You're building momentum!`,
        meta: {
          streak,
          multiplier: event.payload.multiplier,
        },
        duration: 4000,
      }
    
    default:
      return null
  }
}

// ============================================================================
// LEVEL UP MODAL
// ============================================================================

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  level: number
  title: string
  xpToNext: number
}

export function LevelUpModal({ isOpen, onClose, level, title, xpToNext }: LevelUpModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
          
          <GlassCard className="relative p-8 text-center max-w-md">
            {/* Level badge */}
            <motion.div
              className="relative mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold text-white">{level}</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold mb-2"
            >
              Level Up!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-purple-400 font-medium mb-4"
            >
              {title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-foreground/60 text-sm mb-6"
            >
              {xpToNext.toLocaleString()} XP to next level
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2 mb-6"
            >
              <div className="flex items-center gap-2 text-sm text-foreground/80 justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>New title unlocked: {title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80 justify-center">
                <Trophy className="w-4 h-4 text-slate-400" />
                <span>+50 XP bonus awarded</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <GlassButton onClick={onClose} className="px-8">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </GlassButton>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Confetti effect placeholder */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#A855F7', '#EC4899', '#F59E0B', '#3B82F6'][i % 4],
                left: `${Math.random() * 100}%`,
                top: -10,
              }}
              animate={{
                y: [0, 800],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// ACHIEVEMENT UNLOCK MODAL
// ============================================================================

interface AchievementModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: {
    name: string
    description: string
    icon: string
    rarity: string
    xpReward: number
  }
}

export function AchievementModal({ isOpen, onClose, achievement }: AchievementModalProps) {
  if (!isOpen) return null

  const rarityConfig = {
    common: { color: '#94A3B8', glow: 'rgba(148, 163, 184, 0.3)' },
    rare: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.3)' },
    epic: { color: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)' },
    legendary: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  }

  const config = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect based on rarity */}
          <div 
            className="absolute inset-0 blur-3xl"
            style={{ backgroundColor: config.glow }}
          />

          <div className="p-8 text-center max-w-md border-2 rounded-2xl bg-white/10 backdrop-blur-md border-white/20 relative"
            style={{ borderColor: config.color }}>
            {/* Achievement badge */}
            <motion.div
              className="relative mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div 
                className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto"
                style={{ 
                  background: `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
                  border: `2px solid ${config.color}`,
                  boxShadow: `0 0 30px ${config.glow}`,
                }}
              >
                {achievement.icon}
              </div>

              {/* Rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px dashed ${config.color}` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Rarity badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                  border: `1px solid ${config.color}40`,
                }}
              >
                {achievement.rarity}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold mb-2"
            >
              Achievement Unlocked!
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-semibold mb-2"
              style={{ color: config.color }}
            >
              {achievement.name}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-foreground/70 mb-6"
            >
              {achievement.description}
            </motion.p>

            {/* XP reward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-semibold text-purple-400">
                +{achievement.xpReward} XP
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <GlassButton onClick={onClose} className="px-8">
                Awesome!
              </GlassButton>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { GamificationEvent, Toast, ToastType, ToastData }
