"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left'
}) => {
  const variantClasses = {
    default: 'bg-white/70 hover:bg-white/80 border border-white/30 backdrop-blur-xl shadow-lg hover:shadow-xl',
    primary: 'bg-gradient-to-br from-navy-600 to-brand-500 hover:from-navy-500 hover:to-brand-400 border border-white/20 shadow-lg hover:shadow-2xl text-white',
    secondary: 'bg-white/40 hover:bg-white/50 border border-white/20 backdrop-blur-lg shadow-md hover:shadow-lg'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[32px]',
    md: 'px-6 py-3 text-base min-h-[40px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]'
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden font-semibold transition-all duration-300',
        'rounded-xl',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      {/* Glass Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
      
      {/* Inner Glow */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
      </div>
      
      {/* Content - Centralized */}
      <div className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && iconPosition === 'left' && !loading && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-center">{children}</span>
        {icon && iconPosition === 'right' && !loading && <span className="flex-shrink-0">{icon}</span>}
      </div>
    </motion.button>
  )
}
