/**
 * Ability Unlock Panel
 * Shows available abilities and unlock progress
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Star, Zap, Shield, Heart, Sparkles, Check } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'

export interface Ability {
  id: string
  name: string
  description: string
  type: 'passive' | 'active'
  unlockLevel: number
  evolutionStage: string
  icon: string
  unlocked: boolean
  effect?: {
    stat?: string
    value?: number
    description?: string
  }
}

export interface AbilityUnlockPanelProps {
  abilities: Ability[]
  currentLevel: number
  currentStage: string
  onUnlock?: (abilityId: string) => void
}

const ABILITY_ICONS: Record<string, React.ReactNode> = {
  star: <Star className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  sparkles: <Sparkles className="w-6 h-6" />
}

export const AbilityUnlockPanel: React.FC<AbilityUnlockPanelProps> = ({
  abilities,
  currentLevel,
  currentStage: _currentStage,
  onUnlock
}) => {
  const unlockedAbilities = abilities.filter(a => a.unlocked)
  const availableToUnlock = abilities.filter(a => !a.unlocked && currentLevel >= a.unlockLevel)
  const lockedAbilities = abilities.filter(a => !a.unlocked && currentLevel < a.unlockLevel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Abilities</h2>
        <p className="text-foreground/60">
          {unlockedAbilities.length} / {abilities.length} Unlocked
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedAbilities.length / abilities.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="absolute -top-1 right-0 text-xs font-semibold text-foreground/60">
          {Math.round((unlockedAbilities.length / abilities.length) * 100)}%
        </div>
      </div>

      {/* Available to Unlock */}
      {availableToUnlock.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-500" />
            Ready to Unlock
          </h3>
          <div className="grid gap-4">
            {availableToUnlock.map((ability, index) => (
              <motion.div
                key={ability.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 relative overflow-hidden">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-500/10 animate-pulse" />
                  
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-500/50">
                      {ABILITY_ICONS[ability.icon] || <Star className="w-8 h-8 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{ability.name}</h4>
                          <p className="text-sm text-foreground/60">{ability.description}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-500/20 text-slate-600 text-xs font-semibold">
                          {ability.type}
                        </span>
                      </div>
                      
                      {ability.effect && (
                        <div className="mb-3 p-3 rounded-xl bg-foreground/5 border border-white/10">
                          <div className="text-sm text-foreground/80">{ability.effect.description}</div>
                        </div>
                      )}
                      
                      {onUnlock && (
                        <GlassButton
                          onClick={() => onUnlock(ability.id)}
                          className="w-full"
                        >
                          <Sparkles className="w-4 h-4" />
                          Unlock Ability
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Abilities */}
      {unlockedAbilities.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Unlocked Abilities
          </h3>
          <div className="grid gap-3">
            {unlockedAbilities.map((ability, index) => (
              <motion.div
                key={ability.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      {ABILITY_ICONS[ability.icon] || <Star className="w-6 h-6 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{ability.name}</h4>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-sm text-foreground/60">{ability.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Abilities */}
      {lockedAbilities.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-foreground/40" />
            Locked Abilities
          </h3>
          <div className="grid gap-3">
            {lockedAbilities.map((ability, index) => (
              <motion.div
                key={ability.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-foreground/30" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{ability.name}</h4>
                        <span className="text-xs text-foreground/60">Level {ability.unlockLevel}</span>
                      </div>
                      <p className="text-sm text-foreground/60">{ability.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
