"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const GlassInput: React.FC<GlassInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  className,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }

  const variantClasses = {
    default: 'bg-white/10 border-white/20 focus:border-companion-primary/50',
    primary: 'bg-companion-primary/10 border-companion-primary/30 focus:border-companion-primary'
  }

  const baseClasses = cn(
    'w-full liquid-glass rounded-xl border transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-companion-primary/20',
    'placeholder:text-foreground/40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
    className
  )

  const inputClasses = cn(
    baseClasses,
    icon && iconPosition === 'left' && 'pl-12',
    icon && iconPosition === 'right' && 'pr-12'
  )

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(inputClasses, 'min-h-[100px] resize-none')}
        />
      )
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
            {icon}
          </div>
        )}
        
        {renderInput()}
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
