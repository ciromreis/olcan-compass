"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

interface XPBarProps {
  current: number
  max: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  className?: string
}

export const XPBar: React.FC<XPBarProps> = ({
  current,
  max,
  size = 'md',
  animated = true,
  showLabel = true,
  className
}) => {
  const percentage = Math.min((current / max) * 100, 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
          <span>XP</span>
          <span>{current} / {max}</span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-foreground/10 rounded-full overflow-hidden relative',
        sizeClasses[size]
      )}>
        {/* Background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"
        />
        
        {/* XP Progress */}
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0,
            ease: "easeOut"
          }}
        >
          {/* Shine Effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
        
        {/* Glow Effect */}
        {animated && percentage > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            style={{
              background: `radial-gradient(circle at ${percentage}% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  )
}
