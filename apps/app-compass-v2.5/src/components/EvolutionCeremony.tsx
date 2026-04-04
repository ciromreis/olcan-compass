/**
 * Evolution Ceremony
 * Dramatic full-screen animation for companion evolution
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, Zap } from 'lucide-react'
import { GlassButton } from '@/components/ui'

export interface EvolutionCeremonyProps {
  isOpen: boolean
  fromStage: string
  toStage: string
  companionName: string
  archetype: string
  onComplete: () => void
}

const STAGE_EMOJIS: Record<string, string> = {
  egg: '🥚',
  sprout: '🌱',
  young: '🐣',
  mature: '🦅',
  master: '👑',
  legendary: '💎'
}

const STAGE_NAMES: Record<string, string> = {
  egg: 'Egg',
  sprout: 'Sprout',
  young: 'Young',
  mature: 'Mature',
  master: 'Master',
  legendary: 'Legendary'
}

export const EvolutionCeremony: React.FC<EvolutionCeremonyProps> = ({
  isOpen,
  fromStage,
  toStage,
  companionName,
  archetype,
  onComplete
}) => {
  const [phase, setPhase] = useState<'intro' | 'transformation' | 'reveal' | 'complete'>('intro')
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPhase('intro')
      setShowParticles(false)
      return
    }

    const timers = [
      setTimeout(() => setPhase('transformation'), 2000),
      setTimeout(() => setShowParticles(true), 2500),
      setTimeout(() => setPhase('reveal'), 4000),
      setTimeout(() => setPhase('complete'), 6000)
    ]

    return () => timers.forEach(clearTimeout)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {showParticles && (
            <>
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl px-8">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Evolution Beginning...
              </h2>
              <p className="text-xl text-white/80">
                {companionName} is ready to evolve!
              </p>
            </motion.div>
          )}

          {/* Transformation Phase */}
          {phase === 'transformation' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="relative"
            >
              <motion.div
                className="text-9xl mb-8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                  filter: [
                    'brightness(1) blur(0px)',
                    'brightness(2) blur(4px)',
                    'brightness(1) blur(0px)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {STAGE_EMOJIS[fromStage]}
              </motion.div>

              {/* Energy Rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/30"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: [0, 400, 400],
                    height: [0, 400, 400],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity
                  }}
                />
              ))}

              <p className="text-2xl text-white font-bold">
                Transforming...
              </p>
            </motion.div>
          )}

          {/* Reveal Phase */}
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="text-9xl mb-8"
                animate={{
                  scale: [1.2, 1],
                  rotate: [0, 10, -10, 0],
                  filter: ['brightness(2)', 'brightness(1)']
                }}
                transition={{ duration: 1 }}
              >
                {STAGE_EMOJIS[toStage]}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Evolution Complete!
                </h2>
                <p className="text-2xl text-white/90 mb-2">
                  {companionName} evolved into
                </p>
                <p className="text-3xl font-bold text-white">
                  {STAGE_NAMES[toStage]} {archetype}!
                </p>
              </motion.div>

              {/* Celebration Effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: '50%',
                      y: '50%',
                      opacity: 0
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: Math.random() * 0.5
                    }}
                  >
                    {i % 3 === 0 ? (
                      <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    ) : i % 3 === 1 ? (
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    ) : (
                      <Zap className="w-6 h-6 text-purple-400" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlassButton
                onClick={onComplete}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-xl"
              >
                Continue Your Journey
              </GlassButton>
            </motion.div>
          )}
        </div>

        {/* Ambient Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
