/**
 * Aura Visual Display - v2.5 Metamodern
 *
 * Renders the user's Aura using Liquid-Glass aesthetics.
 * Replaces legacy emojis with abstract, animated geometric orbs.
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, Sparkles, Shield, Activity, Star, Info } from 'lucide-react'
import type { EvolutionStage, ArchetypeType, AuraStats } from '@/stores/auraStore'

interface AuraVisualProps {
  evolutionStage: EvolutionStage
  archetype: ArchetypeType
  name: string
  level: number
  stats: AuraStats
  happiness: number
  energy: number
  isPerformingActivity?: boolean
  activityType?: 'feed' | 'train' | 'play' | 'rest'
}

// Visual configurations for each evolution stage - Metamodern Liquid Glass
const STAGE_VISUALS: Record<EvolutionStage, {
  label: string
  size: number
  layers: number
  blur: string
  color: string
  animation: string
}> = {
  egg: {
    label: 'Núcleo Primário',
    size: 100,
    layers: 2,
    blur: 'blur-md',
    color: 'bg-bone-500/20',
    animation: 'pulse'
  },
  sprout: {
    label: 'Despertar',
    size: 130,
    layers: 3,
    blur: 'blur-lg',
    color: 'bg-emerald-500/30',
    animation: 'breathe'
  },
  young: {
    label: 'Expansão',
    size: 160,
    layers: 4,
    blur: 'blur-xl',
    color: 'bg-blue-500/40',
    animation: 'float'
  },
  mature: {
    label: 'Transcendente',
    size: 200,
    layers: 5,
    blur: 'blur-2xl',
    color: 'bg-gold-500/50',
    animation: 'radiate'
  },
  master: {
    label: 'Arquetípico',
    size: 240,
    layers: 6,
    blur: 'blur-3xl',
    color: 'bg-purple-500/60',
    animation: 'vortex'
  },
  legendary: {
    label: 'Soberano',
    size: 300,
    layers: 8,
    blur: 'blur-[64px]',
    color: 'bg-gold-400/70',
    animation: 'divine'
  }
}

export function AuraVisual({
  evolutionStage,
  archetype,
  name,
  level,
  stats,
  happiness,
  energy,
  isPerformingActivity,
  activityType,
}: AuraVisualProps) {
  const [isHovered, setIsHovered] = useState(false)
  const visual = STAGE_VISUALS[evolutionStage] || STAGE_VISUALS.egg

  // Emotion determination in PT-BR
  const emotion = useMemo(() => {
    if (happiness > 80 && energy > 50) return { label: 'Elevado', color: 'text-gold-500' }
    if (happiness < 30) return { label: 'Dissonante', color: 'text-ink-300' }
    if (energy < 20) return { label: 'Latente', color: 'text-blue-300' }
    return { label: 'Em Estágio', color: 'text-bone-400' }
  }, [happiness, energy])

  return (
    <div 
      className="relative flex items-center justify-center p-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambient Glow */}
      <motion.div
        className={`absolute rounded-full pointer-events-none ${visual.blur} opacity-20`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          width: visual.size * 2,
          height: visual.size * 2,
          backgroundColor: visual.color.match(/bg-(\w+-\d+)/)?.[1] || 'gold-500'
        }}
      />

      {/* Main Liquid Glass Orb */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={evolutionStage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="relative"
          >
            {/* Multiple nested layers for Liquid-Glass depth */}
            {[...Array(visual.layers)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-white/10 backdrop-blur-3xl"
                initial={false}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 0.95, 1],
                  borderRadius: [
                    '50% 50% 50% 50%',
                    '60% 40% 70% 30%',
                    '40% 60% 30% 70%',
                    '50% 50% 50% 50%'
                  ]
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  width: visual.size,
                  height: visual.size,
                  backgroundColor: `rgba(255, 255, 255, ${0.05 / (i + 1)})`,
                  left: -visual.size / 2,
                  top: -visual.size / 2,
                  zIndex: visual.layers - i
                }}
              />
            ))}

            {/* Core Essence Creature */}
            <motion.div
              className="absolute flex items-center justify-center pointer-events-none"
              animate={isPerformingActivity ? {
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
              } : {
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: visual.size * 0.8,
                height: visual.size * 0.8,
                left: -visual.size * 0.4,
                top: -visual.size * 0.4,
                zIndex: visual.layers + 1
              }}
            >
              <Image 
                src={archetype.toLowerCase().includes('scholar') || archetype.toLowerCase().includes('sage') ? "/images/creature-scholar.png" : "/images/creature-compass.png"}
                alt={`${name} Creature`}
                width={visual.size * 0.8}
                height={visual.size * 0.8}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats UI Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-[-20%] z-50 w-full max-w-xs"
          >
            <div className="bg-ink-950/80 backdrop-blur-2xl border border-bone-500/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-bone-50 font-bold text-lg">{name}</h3>
                  <p className="text-caption uppercase font-bold tracking-widest text-gold-500">
                    {visual.label} • {archetype.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-gold-500/20 px-3 py-1 rounded-full border border-gold-500/30">
                  <span className="text-gold-500 text-xs font-bold">Lvl {level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatItem label="Poder" value={stats.power} icon={<Zap className="w-3 h-3" />} color="text-amber-500" />
                <StatItem label="Sabedoria" value={stats.wisdom} icon={<Star className="w-3 h-3" />} color="text-blue-500" />
                <StatItem label="Carisma" value={stats.charisma} icon={<Heart className="w-3 h-3" />} color="text-pink-500" />
                <StatItem label="Agilidade" value={stats.agility} icon={<Activity className="w-3 h-3" />} color="text-emerald-500" />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-bone-500/10">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${emotion.color}`}>{emotion.label}</span>
                </div>
                <div className="text-xs text-bone-500">
                  Felicidade: <span className="text-bone-200 font-bold">{Math.round(happiness)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Icons */}
      <AnimatePresence>
        {isPerformingActivity && activityType && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute z-40 pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-gold-500/20 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatItem({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-1 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-caption uppercase font-semibold text-bone-500 tracking-wider font-mono">{label}</span>
      </div>
      <div className="text-sm font-bold text-bone-100">{value}</div>
    </div>
  )
}

/**
 * Compact Aura Avatar
 */
export function AuraAvatar({
  evolutionStage,
  size = 'md',
  showLevel = false,
  level,
}: {
  evolutionStage: EvolutionStage
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  level?: number
}) {
  const visual = STAGE_VISUALS[evolutionStage] || STAGE_VISUALS.egg
  
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64
  }

  const currentSize = sizeMap[size]

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`rounded-full ${visual.color} border border-white/20 backdrop-blur-md shadow-lg overflow-hidden flex items-center justify-center`}
        style={{
          width: currentSize,
          height: currentSize,
          boxShadow: `0 0 15px ${visual.color.replace('bg-', '')}`
        }}
      >
        <Image 
          src="/images/creature-compass.png"
          alt="Aura Avatar"
          width={currentSize * 0.8}
          height={currentSize * 0.8}
          className="object-contain"
        />
      </motion.div>
      
      {showLevel && level && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-caption font-semibold text-ink-950 border border-ink-950">
          {level}
        </div>
      )}
    </div>
  )
}

/**
 * Evolution Stage Badge in PT-BR
 */
export function EvolutionBadge({ 
  stage,
  showGlow = false,
}: { 
  stage: EvolutionStage
  showGlow?: boolean
}) {
  const visual = STAGE_VISUALS[stage] || STAGE_VISUALS.egg
  
  return (
    <div 
      className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-ink-900/50 backdrop-blur-md border border-bone-500/10"
      style={showGlow ? { boxShadow: `0 0 30px ${visual.color.replace('bg-', '')}20` } : {}}
    >
      <div className={`w-3 h-3 rounded-full ${visual.color}`} />
      <span className="text-xs font-semibold uppercase tracking-widest text-bone-300">{visual.label}</span>
    </div>
  )
}
