"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@olcan/ui-components'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true
}) => {
  const baseClasses = 'bg-foreground/20'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px')
  }

  const animationClass = animated ? 'animate-pulse' : ''

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              animationClass,
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClass,
        className
      )}
      style={style}
    />
  )
}

// Predefined skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 liquid-glass rounded-xl border border-white/20', className)}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="40%" height={20} />
        <SkeletonLoader width="60%" height={16} />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonLoader lines={3} height={14} />
    </div>
  </div>
)

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="30%" height={16} />
          <SkeletonLoader width="80%" height={14} />
        </div>
      </div>
    ))}
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className
}) => (
  <div className={cn('space-y-2', className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4">
      {Array.from({ length: cols }).map((_, index) => (
        <SkeletonLoader key={index} width={100} height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} width={120} height={16} />
        ))}
      </div>
    ))}
  </div>
)

export default SkeletonLoader
