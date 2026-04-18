/**
 * Evolution Ritual Overlay - Olcan Compass v2.5
 * 
 * A cinematic overlay that displays the "Digivolution" moment.
 * Part of the Liquid-Glass (MMXD) design system.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Orbit } from 'lucide-react'
import { ProceduralAuraFigure } from '@/components/aura/ProceduralAuraFigure'
import type { PresenceFigureSpec } from '@/lib/aura-presence'

interface EvolutionRitualOverlayProps {
  isVisible: boolean
  oldSpec: PresenceFigureSpec | null
  newSpec: PresenceFigureSpec | null
  oldStage: string
  newStage: string
  auraName: string
  onComplete: () => void
}

export function EvolutionRitualOverlay({
  isVisible,
  oldSpec: _oldSpec,
  newSpec,
  oldStage,
  newStage,
  auraName,
  onComplete
}: EvolutionRitualOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 backdrop-blur-3xl overflow-hidden"
        >
          {/* Background Particles/Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-steel-400/20 rounded-full blur-[120px]"
            />
          </div>

          <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-500/10 border border-steel-500/20 text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-400">
                <Sparkles className="w-4 h-4" />
                Manifestação Consolidada
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-display text-white tracking-tighter mb-4">
              {auraName} está evoluindo
            </h2>
            <p className="text-white/50 text-base uppercase tracking-widest font-semibold mb-12">
              {oldStage} <span className="mx-4 text-steel-500">→</span> {newStage}
            </p>

            <div className="relative h-80 w-80 mb-16">
              {/* Old Form Fading Out */}
              <AnimatePresence mode="wait">
                <motion.div
                  key="evolution-sequence"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* The actual "Recombination" transition effect */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.5, 1],
                      boxShadow: [
                        '0 0 0px rgba(148,163,184,0)',
                        '0 0 100px rgba(148,163,184,0.4)',
                        '0 0 0px rgba(148,163,184,0)'
                      ]
                    }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border border-steel-500/30 overflow-hidden"
                  >
                    <Orbit className="absolute inset-0 w-full h-full text-steel-500/10 p-4 animate-spin-slow" />
                  </motion.div>

                  <div className="relative z-20">
                    {newSpec && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, filter: 'brightness(2)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
                        transition={{ delay: 1.5, duration: 1.5 }}
                      >
                        <ProceduralAuraFigure spec={newSpec} size={280} active />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Light Burst */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 2.5], opacity: [0, 1, 0] }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute inset-0 bg-white rounded-full blur-2xl z-30"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
              className="space-y-6"
            >
              <p className="text-white/70 text-base max-w-sm mx-auto">
                A nova forma foi sincronizada com seu contexto atual. A presença agora opera em densidade superior.
              </p>
              
              <button
                onClick={onComplete}
                className="group flex items-center gap-3 px-12 py-5 rounded-[2rem] bg-steel-500 text-ink-950 font-bold text-sm uppercase tracking-widest hover:bg-white transition-all shadow-2xl"
              >
                Retomar Jornada
                <Zap className="w-5 h-5 group-hover:fill-steel-500 transition-colors" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
