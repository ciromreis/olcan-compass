/**
 * Evolution Ceremony Component
 * 
 * A full-screen immersive experience for companion evolution.
 * Features particle effects, stage transitions, and celebration animations.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, Crown, Zap, Heart, Trophy } from 'lucide-react'
import { GlassButton } from '@olcan/ui-components'
import type { EvolutionStage, ArchetypeType } from '@/stores/canonicalCompanionStore'

interface EvolutionCeremonyProps {
  isOpen: boolean
  onClose: () => void
  fromStage: EvolutionStage
  toStage: EvolutionStage
  companionName: string
  archetype: ArchetypeType
  newStats?: {
    power: number
    wisdom: number
    charisma: number
    agility: number
  }
}

const STAGE_CONFIG: Record<EvolutionStage, {
  emoji: string
  color: string
  glowColor: string
  title: string
  description: string
  particleCount: number
}> = {
  egg: {
    emoji: '🥚',
    color: '#E8E4E1',
    glowColor: 'rgba(232, 228, 225, 0.5)',
    title: 'Egg',
    description: 'A new beginning awaits',
    particleCount: 20,
  },
  sprout: {
    emoji: '🌱',
    color: '#4ADE80',
    glowColor: 'rgba(74, 222, 128, 0.5)',
    title: 'Sprout',
    description: 'First growth emerges',
    particleCount: 40,
  },
  young: {
    emoji: '🌿',
    color: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    title: 'Young',
    description: 'Growing stronger every day',
    particleCount: 60,
  },
  mature: {
    emoji: '🌳',
    color: '#16A34A',
    glowColor: 'rgba(22, 163, 74, 0.5)',
    title: 'Mature',
    description: 'Fully developed and capable',
    particleCount: 80,
  },
  master: {
    emoji: '🌲',
    color: '#15803D',
    glowColor: 'rgba(21, 128, 61, 0.5)',
    title: 'Master',
    description: 'Wisdom and power combined',
    particleCount: 100,
  },
  legendary: {
    emoji: '👑',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    title: 'Legendary',
    description: 'A legend among companions',
    particleCount: 150,
  },
}

export function EvolutionCeremony({
  isOpen,
  onClose,
  fromStage,
  toStage,
  companionName,
  archetype,
  newStats,
}: EvolutionCeremonyProps) {
  const [phase, setPhase] = useState<'intro' | 'transition' | 'reveal' | 'complete'>('intro')
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isOpen) {
      // Generate particles
      const newParticles = Array.from({ length: STAGE_CONFIG[toStage].particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)

      // Phase timing
      const timer1 = setTimeout(() => setPhase('transition'), 1500)
      const timer2 = setTimeout(() => setPhase('reveal'), 3500)
      const timer3 = setTimeout(() => setPhase('complete'), 5500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setPhase('intro')
    }
  }, [isOpen, toStage])

  if (!isOpen) return null

  const fromConfig = STAGE_CONFIG[fromStage]
  const toConfig = STAGE_CONFIG[toStage]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        {/* Particle Effects */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: toConfig.glowColor,
              boxShadow: `0 0 10px ${toConfig.color}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Main Content */}
        <div className="relative text-center px-4">
          {/* Phase: Intro - Show current stage */}
          {phase === 'intro' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                {fromConfig.emoji}
              </motion.div>
              <h2 className="text-2xl font-bold text-white/80 mb-2">
                {companionName} is ready to evolve!
              </h2>
              <p className="text-white/60">Something magical is happening...</p>
            </motion.div>
          )}

          {/* Phase: Transition - Energy burst */}
          {phase === 'transition' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Energy burst rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: toConfig.color }}
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.3, ease: 'easeOut' }}
                />
              ))}

              {/* Morphing companion */}
              <motion.div
                className="text-8xl relative z-10"
                animate={{
                  scale: [1, 1.5, 0.8, 1.2],
                  rotate: [0, 360, 720],
                  filter: [
                    'brightness(1)',
                    'brightness(2) saturate(2)',
                    'brightness(1) saturate(1)',
                  ],
                }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                {fromConfig.emoji}
              </motion.div>

              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Sparkles className="w-16 h-16 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}

          {/* Phase: Reveal - Show new stage */}
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-9xl mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                style={{
                  filter: `drop-shadow(0 0 30px ${toConfig.glowColor})`,
                }}
              >
                {toConfig.emoji}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-4xl font-bold text-white mb-2">
                  Evolution Complete!
                </h2>
                <p className="text-xl text-white/80 mb-1">
                  {companionName} evolved into
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: toConfig.color }}
                >
                  {toConfig.title} Stage
                </p>
                <p className="text-white/60 mt-2">{toConfig.description}</p>
              </motion.div>

              {/* Stats increase animation */}
              {newStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 flex justify-center gap-6"
                >
                  {Object.entries(newStats).map(([stat, value], index) => (
                    <motion.div
                      key={stat}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold text-green-400">+{value}</div>
                      <div className="text-sm text-white/60 capitalize">{stat}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase: Complete - Continue button */}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <motion.div
                className="text-8xl"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {toConfig.emoji}
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Congratulations!
                </h2>
                <p className="text-white/80">
                  {companionName} is now a <span style={{ color: toConfig.color }}>{toConfig.title}</span>
                </p>
              </div>

              {/* Rewards summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-4"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">+200 XP</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-white">Achievement Unlocked</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassButton
                  onClick={onClose}
                  className="px-8 py-3 text-lg"
                >
                  Continue Journey
                </GlassButton>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Background gradient pulse */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              `radial-gradient(circle at 50% 50%, transparent 0%, black 70%)`,
              `radial-gradient(circle at 50% 50%, ${toConfig.glowColor} 0%, black 60%)`,
              `radial-gradient(circle at 50% 50%, transparent 0%, black 70%)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Compact evolution notification (for inline use)
 */
export function EvolutionNotification({
  toStage,
  companionName,
  onView,
}: {
  toStage: EvolutionStage
  companionName: string
  onView: () => void
}) {
  const config = STAGE_CONFIG[toStage]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div 
        className="p-4 rounded-2xl border backdrop-blur-md"
        style={{ 
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}40`,
        }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            className="text-4xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            {config.emoji}
          </motion.div>
          <div className="flex-1">
            <h4 className="font-semibold" style={{ color: config.color }}>
              Evolution Complete!
            </h4>
            <p className="text-sm text-foreground/80 mt-1">
              {companionName} evolved to {config.title}!
            </p>
            <button
              onClick={onView}
              className="text-sm mt-2 font-medium hover:underline"
              style={{ color: config.color }}
            >
              View Ceremony →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
