"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, Heart, Brain } from 'lucide-react'
import { cn } from '../../utils'
import type { CompanionStats as CompanionStatsType } from '../../types/companion'

interface CompanionStatsProps {
  stats: CompanionStatsType
  compact?: boolean
  animated?: boolean
  className?: string
}

export const CompanionStatsComponent: React.FC<CompanionStatsProps> = ({
  stats,
  compact = false,
  animated = true,
  className
}) => {
  const statItems = [
    {
      label: 'Power',
      value: stats.power,
      icon: Zap,
      color: 'from-red-500 to-orange-500'
    },
    {
      label: 'Wisdom',
      value: stats.wisdom,
      icon: Brain,
      color: 'from-blue-500 to-purple-500'
    },
    {
      label: 'Charisma',
      value: stats.charisma,
      icon: Heart,
      color: 'from-pink-500 to-purple-500'
    },
    {
      label: 'Agility',
      value: stats.agility,
      icon: Shield,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className={cn('space-y-2', className)}>
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="flex items-center gap-2"
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: index * 0.1 } : undefined}
        >
          {/* Icon */}
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-white',
            compact ? 'w-4 h-4' : 'w-6 h-6'
          )}>
            <stat.icon 
              className={cn(
                compact ? 'w-3 h-3' : 'w-4 h-4'
              )}
              style={{
                background: `linear-gradient(135deg, ${stat.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}
            />
          </div>
          
          {/* Label */}
          {!compact && (
            <span className="text-xs text-foreground/60 w-16">
              {stat.label}
            </span>
          )}
          
          {/* Stat Bar */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${stat.color})`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ 
                    duration: animated ? 1 : 0,
                    delay: animated ? index * 0.1 : 0,
                    ease: "easeOut"
                  }}
                />
              </div>
              
              {/* Value */}
              <span className={cn(
                'text-xs font-semibold text-foreground/80',
                compact && 'text-xs'
              )}>
                {stat.value}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Export as CompanionStats to match the import
export const CompanionStats = CompanionStatsComponent
