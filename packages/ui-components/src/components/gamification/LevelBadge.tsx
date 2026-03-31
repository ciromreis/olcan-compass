"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '../../utils'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
  className?: string
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  animated = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-500 to-purple-700'
    if (level >= 30) return 'from-blue-500 to-blue-700'
    if (level >= 20) return 'from-green-500 to-green-700'
    if (level >= 10) return 'from-yellow-500 to-yellow-700'
    return 'from-gray-500 to-gray-700'
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-level',
        sizeClasses[size],
        className
      )}
      style={{
        background: getLevelColor(level)
      }}
      animate={animated ? {
        scale: [1, 1.05, 1],
      } : undefined}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Glow Effect */}
      {animated && (
        <motion.div
          className="absolute -inset-1 rounded-full opacity-50"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)`
          }}
        />
      )}
      
      {/* Level Number */}
      <span className="relative z-10">
        {level}
      </span>
      
      {/* Star Icon */}
      {showIcon && level >= 10 && (
        <Star 
          className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))'
          }}
        />
      )}
    </motion.div>
  )
}
