/**
 * Streak Visualization Component
 * 
 * Visual representation of care streaks with fire effects,
 * milestone celebrations, and streak protection indicators.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Shield, AlertTriangle, Trophy, Calendar } from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'

interface StreakVisualizerProps {
  currentStreak: number
  bestStreak: number
  multiplier: number
  isInDanger?: boolean
  hoursUntilReset?: number
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100]

const FLAME_COLORS = [
  { threshold: 0, color: '#F97316', glow: 'rgba(249, 115, 22, 0.5)' },   // 0-6 days
  { threshold: 7, color: '#EF4444', glow: 'rgba(239, 68, 68, 0.6)' },      // 7-13 days
  { threshold: 14, color: '#DC2626', glow: 'rgba(220, 38, 38, 0.7)' },      // 14-29 days
  { threshold: 30, color: '#991B1B', glow: 'rgba(153, 27, 27, 0.8)' },     // 30-59 days
  { threshold: 60, color: '#FEF3C7', glow: 'rgba(254, 243, 199, 0.9)' },   // 60+ days (golden)
]

export function StreakVisualizer({
  currentStreak,
  bestStreak,
  multiplier,
  isInDanger,
  hoursUntilReset,
}: StreakVisualizerProps) {
  const [showMilestone, setShowMilestone] = useState(false)
  
  // Get flame intensity based on streak
  const getFlameConfig = () => {
    for (let i = FLAME_COLORS.length - 1; i >= 0; i--) {
      if (currentStreak >= FLAME_COLORS[i].threshold) {
        return FLAME_COLORS[i]
      }
    }
    return FLAME_COLORS[0]
  }
  
  const flameConfig = getFlameConfig()
  
  // Get next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m > currentStreak) || null
  const progressToNext = nextMilestone ? (currentStreak / nextMilestone) * 100 : 100
  
  // Check for milestone
  useEffect(() => {
    if (STREAK_MILESTONES.includes(currentStreak)) {
      setShowMilestone(true)
      const timer = setTimeout(() => setShowMilestone(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [currentStreak])

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      {/* Background flame effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at bottom, ${flameConfig.glow}, transparent 70%)`,
        }}
      />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{ 
                backgroundColor: `${flameConfig.color}20`,
                boxShadow: `0 0 20px ${flameConfig.glow}`,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame 
                  className="w-6 h-6"
                  style={{ color: flameConfig.color }}
                />
              </motion.div>
            </div>
            <div>
              <h3 className="text-lg font-bold">{currentStreak} Day Streak</h3>
              <p className="text-sm text-foreground/60">
                Best: {bestStreak} days
              </p>
            </div>
          </div>
          
          {/* Multiplier badge */}
          <div 
            className="px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${flameConfig.color}20`,
              color: flameConfig.color,
              border: `1px solid ${flameConfig.color}40`,
            }}
          >
            {multiplier}x XP
          </div>
        </div>
        
        {/* Large streak number */}
        <div className="flex items-center justify-center py-4">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Animated flames around number */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: flameConfig.color }}
                  animate={{
                    y: [0, -30 - Math.random() * 20, 0],
                    x: [(i - 2) * 15, (i - 2) * 20, (i - 2) * 15],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
            
            <span 
              className="text-7xl font-bold relative z-10"
              style={{ 
                color: flameConfig.color,
                textShadow: `0 0 30px ${flameConfig.glow}`,
              }}
            >
              {currentStreak}
            </span>
          </motion.div>
        </div>
        
        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/60">Next milestone: {nextMilestone} days</span>
              <span className="text-foreground/80">{currentStreak}/{nextMilestone}</span>
            </div>
            <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: flameConfig.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
        
        {/* Streak protection / danger warning */}
        {isInDanger && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Streak in danger!</p>
              <p className="text-xs text-amber-300/80">
                {hoursUntilReset} hours left to maintain your streak
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-foreground/5">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-foreground/40" />
            <div className="text-lg font-bold">{currentStreak}</div>
            <div className="text-xs text-foreground/60">Current</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-foreground/5">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-foreground/40" />
            <div className="text-lg font-bold">{bestStreak}</div>
            <div className="text-xs text-foreground/60">Best</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-foreground/5">
            <Shield className="w-4 h-4 mx-auto mb-1 text-foreground/40" />
            <div className="text-lg font-bold">{multiplier}x</div>
            <div className="text-xs text-foreground/60">Multiplier</div>
          </div>
        </div>
        
        {/* Milestone celebration */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  {currentStreak} Day Milestone!
                </h4>
                <p className="text-white/80">
                  Incredible dedication! Keep it up!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

/**
 * Compact streak badge for inline use
 */
export function StreakBadge({ 
  streak, 
  size = 'md',
  showMultiplier = false,
  multiplier,
}: { 
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showMultiplier?: boolean
  multiplier?: number
}) {
  const getFlameColor = () => {
    if (streak >= 60) return '#FEF3C7'
    if (streak >= 30) return '#991B1B'
    if (streak >= 14) return '#DC2626'
    if (streak >= 7) return '#EF4444'
    return '#F97316'
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${getFlameColor()}15`,
        color: getFlameColor(),
        border: `1px solid ${getFlameColor()}30`,
      }}
    >
      <Flame className={`${iconSizes[size]}`} />
      <span>{streak}</span>
      {showMultiplier && multiplier && (
        <span className="opacity-70">({multiplier}x)</span>
      )}
    </div>
  )
}

/**
 * Streak calendar visualization
 */
export function StreakCalendar({ 
  streakDays,
  caredDays,
}: { 
  streakDays: number
  caredDays: boolean[] // Array of 7 days, true if care was given
}) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDay()
  
  // Rotate array so today is last
  const rotatedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)]
  const rotatedCared = [...caredDays.slice(today + 1), ...caredDays.slice(0, today + 1)]
  
  return (
    <div className="flex justify-between gap-1">
      {rotatedDays.map((day, i) => (
        <div key={day} className="flex flex-col items-center gap-1">
          <div 
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
              rotatedCared[i]
                ? 'bg-orange-500 text-white'
                : 'bg-foreground/10 text-foreground/40'
            }`}
          >
            {rotatedCared[i] ? '🔥' : '·'}
          </div>
          <span className="text-xs text-foreground/40">{day}</span>
        </div>
      ))}
    </div>
  )
}
