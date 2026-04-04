"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'light'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: boolean
  border?: boolean
  hover?: boolean
  animated?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  rounded = 'lg',
  padding = 'md',
  shadow = true,
  border = true,
  hover = false,
  animated = true
}) => {
  const variantClasses = {
    default: 'bg-white/10 backdrop-blur-md',
    dark: 'bg-black/20 backdrop-blur-md',
    light: 'bg-white/20 backdrop-blur-sm'
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        variantClasses[variant],
        roundedClasses[rounded],
        paddingClasses[padding],
        shadow && 'shadow-liquid-glass',
        border && 'border border-white/10',
        hover && 'hover:scale-[1.02] hover:shadow-liquid-glass-hover transition-all duration-300',
        className
      )}
      animate={animated ? {
        y: [0, -2, 0],
      } : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
