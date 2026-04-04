"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { Companion, EvolutionStage } from '../../types/companion'
import { cn } from '../../utils'
import { getCompanionColor } from '../../utils/companionColors'
import { CompanionAvatar } from './CompanionAvatar'
import { CompanionStatsComponent } from './CompanionStats'
import { AbilityBadge } from './AbilityBadge'
import { XPBar } from '../gamification/XPBar'
import { LevelBadge } from '../gamification/LevelBadge'

interface CompanionCardProps {
  companion: Companion
  interactive?: boolean
  showAbilities?: boolean
  showStats?: boolean
  showEvolution?: boolean
  size?: 'small' | 'medium' | 'large'
  onInteraction?: (action: string, companion: Companion) => void
  className?: string
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  companion,
  interactive = true,
  showAbilities = true,
  showStats = true,
  showEvolution = true,
  size = 'medium',
  onInteraction,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null)

  const archetypeColors = getCompanionColor(companion.type)
  const sizeClasses = {
    small: 'w-64 h-80',
    medium: 'w-80 h-96', 
    large: 'w-96 h-[28rem]'
  }

  const handleInteraction = (action: string) => {
    if (interactive && onInteraction) {
      onInteraction(action, companion)
    }
  }

  const getEvolutionProgress = () => {
    const stages: EvolutionStage[] = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
    const currentIndex = stages.indexOf(companion.evolutionStage)
    return (currentIndex + 1) / stages.length * 100
  }

  return (
    <motion.div
      className={cn(
        'relative liquid-glass rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer overflow-hidden',
        'hover:scale-[1.02] hover:shadow-companion-hover',
        sizeClasses[size],
        interactive && 'hover:border-companion-primary/30',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={() => interactive && handleInteraction('select')}
    >
      {/* Magical Background Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 -z-10"
          >
            <div 
              className="absolute inset-0 rounded-3xl opacity-20 blur-xl"
              style={{
                background: `radial-gradient(circle, ${archetypeColors.primary} 0%, transparent 70%)`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 12}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-1">
            {companion.name}
          </h3>
          <p className="text-sm text-foreground/60 capitalize">
            {companion.type} • Level {companion.level}
          </p>
        </div>
        <LevelBadge level={companion.level} size="sm" />
      </div>

      {/* Companion Avatar */}
      <div className="flex justify-center mb-6 relative">
        <CompanionAvatar 
          companion={companion}
          size={size === 'small' ? 'md' : size === 'medium' ? 'lg' : 'xl'}
          animated={isHovered}
        />
        
        {/* Evolution Glow */}
        {showEvolution && companion.evolutionStage !== 'egg' && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            style={{
              background: `radial-gradient(circle, ${archetypeColors.glow} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* XP and Progress */}
      <div className="space-y-3 mb-4">
        <XPBar 
          current={companion.xp} 
          max={companion.xpToNext}
          size="sm"
          animated={isHovered}
        />
        
        {showEvolution && (
          <div className="flex items-center justify-between text-xs text-foreground/60">
            <span>Evolution Progress</span>
            <span>{Math.round(getEvolutionProgress())}%</span>
          </div>
        )}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="mb-4">
          <CompanionStatsComponent stats={companion.stats} compact={size === 'small'} animated={true} />
        </div>
      )}

      {/* Abilities */}
      {showAbilities && companion.abilities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground/80">Abilities</h4>
          <div className="flex flex-wrap gap-2">
            {companion.abilities.slice(0, size === 'small' ? 2 : 4).map((ability) => (
              <AbilityBadge
                key={ability.id}
                ability={ability}
                size="sm"
                interactive={interactive}
                selected={selectedAbility === ability.id}
                onClick={() => {
                  setSelectedAbility(ability.id === selectedAbility ? null : ability.id)
                  handleInteraction(`ability-${ability.id}`)
                }}
              />
            ))}
            {companion.abilities.length > (size === 'small' ? 2 : 4) && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20">
                <span className="text-xs font-semibold">
                  +{companion.abilities.length - (size === 'small' ? 2 : 4)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && (
        <div className="flex gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-companion-primary to-companion-secondary text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              handleInteraction('care')
            }}
          >
            <Heart className="w-3 h-3" />
            Care
          </motion.button>
          
          {size !== 'small' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-2 px-3 liquid-glass text-sm font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation()
                handleInteraction('details')
              }}
            >
              <ArrowRight className="w-3 h-3" />
              Details
            </motion.button>
          )}
        </div>
      )}

      {/* Selected Ability Detail */}
      <AnimatePresence>
        {selectedAbility && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-companion-primary/20 rounded-lg border border-companion-primary/30"
          >
            <h4 className="font-semibold text-white mb-2">{selectedAbility}</h4>
            <p className="text-white/70 text-sm mb-2">Ability details would go here</p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-companion-primary/30 px-2 py-1 rounded-full text-white/80">
                Active
              </span>
              <span className="text-xs text-white/60">
                Cooldown: 0s
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  </motion.div>
)
}
