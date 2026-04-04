"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '../../utils'
import { Companion, EvolutionStage } from '../../types/companion'

interface EvolutionViewerProps {
  companion: Companion
  currentStage: EvolutionStage
  nextStage?: EvolutionStage
  onEvolve?: () => void
  className?: string
}

export const EvolutionViewer: React.FC<EvolutionViewerProps> = ({
  companion,
  currentStage,
  nextStage,
  onEvolve,
  className
}) => {
  const stages: EvolutionStage[] = ['egg', 'sprout', 'young', 'mature', 'master', 'legendary']
  const currentIndex = stages.indexOf(currentStage)

  const getStageIcon = (stage: EvolutionStage) => {
    const icons = {
      egg: '🥚',
      sprout: '🌱',
      young: '🌿',
      mature: '🌳',
      master: '⭐',
      legendary: '🌟'
    }
    return icons[stage]
  }

  const getStageName = (stage: EvolutionStage) => {
    const names = {
      egg: 'Egg',
      sprout: 'Sprout',
      young: 'Young',
      mature: 'Mature',
      master: 'Master',
      legendary: 'Legendary'
    }
    return names[stage]
  }

  const canEvolve = companion.xp >= companion.xpToNext && nextStage

  return (
    <div className={cn('liquid-glass rounded-2xl p-6', className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Evolution Journey
      </h3>

      {/* Evolution Path */}
      <div className="flex items-center justify-between mb-6">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300',
                  index <= currentIndex
                    ? 'border-companion-primary bg-companion-primary/20'
                    : 'border-foreground/20 bg-foreground/5'
                )}
                animate={index <= currentIndex ? {
                  scale: [1, 1.1, 1],
                } : undefined}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                {getStageIcon(stage)}
              </motion.div>
              
              <span className="text-xs text-foreground/60 mt-1">
                {getStageName(stage)}
              </span>
            </div>

            {index < stages.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-gradient-to-r from-companion-primary/20 to-transparent" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current Stage Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-companion-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-companion-primary to-companion-secondary flex items-center justify-center text-white">
              {getStageIcon(currentStage)}
            </div>
            <div>
              <h4 className="font-semibold">{getStageName(currentStage)}</h4>
              <p className="text-sm text-foreground/60">
                Level {companion.level} • {companion.xp} XP
              </p>
            </div>
          </div>
        </div>

        {/* Evolution Button */}
        {canEvolve && onEvolve && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEvolve}
            className="w-full py-3 bg-gradient-to-r from-companion-primary to-companion-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Evolve to {getStageName(nextStage!)}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {/* Evolution Requirements */}
        {!canEvolve && nextStage && (
          <div className="p-4 liquid-glass rounded-xl border border-foreground/20">
            <h4 className="font-semibold mb-2">Evolution Requirements</h4>
            <div className="space-y-2 text-sm text-foreground/60">
              <div className="flex items-center justify-between">
                <span>Level Required:</span>
                <span className="font-medium">{companion.level + 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>XP Required:</span>
                <span className="font-medium">{companion.xpToNext}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Current XP:</span>
                <span className={cn(
                  'font-medium',
                  companion.xp >= companion.xpToNext ? 'text-green-400' : 'text-foreground/80'
                )}>
                  {companion.xp}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
