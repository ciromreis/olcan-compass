"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Lock } from 'lucide-react'
import { cn } from '../../utils'

interface AchievementCardProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    unlocked: boolean
    progress?: number
    maxProgress?: number
    unlockedAt?: string
  }
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
  className?: string
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  size = 'md',
  interactive = true,
  onClick,
  className
}) => {
  const rarityColors = {
    common: 'border-gray-300/30 bg-gray-500/10',
    rare: 'border-blue-300/30 bg-blue-500/10',
    epic: 'border-purple-300/30 bg-purple-500/10',
    legendary: 'border-yellow-300/30 bg-yellow-500/10'
  }

  const rarityGradients = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600'
  }

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <motion.div
      className={cn(
        'liquid-glass rounded-xl border transition-all duration-300',
        rarityColors[achievement.rarity],
        sizeClasses[size],
        interactive && 'hover:scale-105 cursor-pointer',
        !achievement.unlocked && 'opacity-60',
        className
      )}
      onClick={interactive && onClick ? onClick : undefined}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      {/* Achievement Icon */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          achievement.unlocked 
            ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]}`
            : 'bg-foreground/10'
        )}>
          {achievement.unlocked ? (
            achievement.icon
          ) : (
            <Lock className="w-6 h-6 text-foreground/40" />
          )}
        </div>

        {/* Achievement Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {achievement.name}
            </h3>
            {achievement.rarity === 'legendary' && (
              <Trophy className="w-4 h-4 text-yellow-400" />
            )}
            {achievement.rarity === 'epic' && (
              <Star className="w-4 h-4 text-purple-400" />
            )}
          </div>
          
          <p className="text-sm text-foreground/60 mb-2">
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                <span>Progress</span>
                <span>{achievement.progress} / {achievement.maxProgress}</span>
              </div>
              <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-companion-primary to-companion-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-foreground/40 mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
