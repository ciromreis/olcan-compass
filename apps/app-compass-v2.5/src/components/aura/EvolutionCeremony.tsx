/**
 * Evolution Ceremony Component
 * 
 * A full-screen immersive experience for companion evolution.
 * Features particle effects, stage transitions, and celebration animations.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Trophy } from 'lucide-react'
import { GlassButton } from '@/components/ui'
import type { EvolutionStage, ArchetypeType } from '@/stores/auraStore'

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
  color: string
  glowColor: string
  title: string
  description: string
  particleCount: number
  emoji: string
}> = {
  egg: {
    color: '#F8FAFC',
    glowColor: 'rgba(248, 250, 252, 0.4)',
    title: 'Nascimento',
    description: 'Um novo início despertou',
    particleCount: 20,
    emoji: '🥚',
  },
  sprout: {
    color: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    title: 'Broto',
    description: 'O primeiro crescimento emerge',
    particleCount: 40,
    emoji: '🌱',
  },
  young: {
    color: '#64748B',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    title: 'Jovem',
    description: 'Fortalecendo-se a cada dia',
    particleCount: 60,
    emoji: '⚡',
  },
  mature: {
    color: '#475569',
    glowColor: 'rgba(71, 85, 105, 0.4)',
    title: 'Maturo',
    description: 'Plenamente desenvolvido e capaz',
    particleCount: 80,
    emoji: '🔮',
  },
  master: {
    color: '#334155',
    glowColor: 'rgba(51, 65, 85, 0.4)',
    title: 'Mestre',
    description: 'Sabedoria e poder combinados',
    particleCount: 100,
    emoji: '👑',
  },
  legendary: {
    color: '#F1F5F9',
    glowColor: 'rgba(241, 245, 249, 0.62)',
    title: 'Lendário',
    description: 'Uma lenda entre os companheiros',
    particleCount: 150,
    emoji: '✨',
  },
}

export function EvolutionCeremony({
  isOpen,
  onClose,
  fromStage,
  toStage,
  companionName,
  archetype: _archetype,
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
              <h2 className="text-2xl font-bold text-white/80 mb-2">
                {companionName} está pronto para evoluir!
              </h2>
              <p className="text-white/60">Algo extraordinário está acontecendo...</p>
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
                <Sparkles className="w-16 h-16 text-slate-400" />
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
                  Evolução Concluída!
                </h2>
                <p className="text-xl text-white/80 mb-1">
                  {companionName} evoluiu para
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: toConfig.color }}
                >
                  Estágio {toConfig.title}
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
                  <Zap className="w-5 h-5 text-slate-400" />
                  <span className="text-white">+200 XP</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                  <Trophy className="w-5 h-5 text-slate-400" />
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
                  Retomar Jornada
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
