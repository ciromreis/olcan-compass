"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

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
    default: 'bg-white/10 hover:bg-white/20 border border-white/20',
    primary: 'bg-gradient-to-r from-companion-primary to-companion-secondary hover:from-companion-primary/80 hover:to-companion-secondary/80 border border-companion-primary/30',
    secondary: 'bg-white/5 hover:bg-white/10 border border-white/10'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden font-medium transition-all duration-300',
        'backdrop-blur-md rounded-xl',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.05 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
    >
      {/* Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && iconPosition === 'left' && !loading && icon}
        <span>{children}</span>
        {icon && iconPosition === 'right' && !loading && icon}
      </div>
    </motion.button>
  )
}
