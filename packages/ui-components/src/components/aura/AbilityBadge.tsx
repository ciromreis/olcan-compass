"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, Star } from 'lucide-react'
import { cn } from '../../utils'
import { Ability } from '../../types/companion'

interface AbilityBadgeProps {
  ability: Ability
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  selected?: boolean
  onClick?: () => void
  className?: string
}

export const AbilityBadge: React.FC<AbilityBadgeProps> = ({
  ability,
  size = 'md',
  interactive = false,
  selected = false,
  onClick,
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const getAbilityIcon = (type: Ability['type']) => {
    switch (type) {
      case 'active':
        return <Zap className="w-3 h-3" />
      case 'passive':
        return <Shield className="w-3 h-3" />
      case 'ultimate':
        return <Star className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  const getAbilityColor = (type: Ability['type']) => {
    switch (type) {
      case 'active':
        return 'bg-red-100/20 border-red-200/30 text-red-300'
      case 'passive':
        return 'bg-blue-100/20 border-blue-200/30 text-blue-300'
      case 'ultimate':
        return 'bg-purple-100/20 border-purple-200/30 text-purple-300'
      default:
        return 'bg-gray-100/20 border-gray-200/30 text-gray-300'
    }
  }

  return (
    <motion.button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-all duration-200',
        sizeClasses[size],
        getAbilityColor(ability.type),
        interactive && 'hover:scale-105 cursor-pointer',
        selected && 'ring-2 ring-companion-primary ring-offset-2 ring-offset-background',
        className
      )}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      {getAbilityIcon(ability.type)}
      <span className="font-medium">{ability.name}</span>
      {ability.unlockLevel && (
        <span className="text-xs opacity-70">Lv.{ability.unlockLevel}</span>
      )}
    </motion.button>
  )
}
