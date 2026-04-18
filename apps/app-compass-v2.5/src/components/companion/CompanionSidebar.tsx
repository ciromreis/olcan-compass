'use client'

/**
 * CompanionSidebar — floating mini-panel showing companion status.
 * Renders in the main app layout; clicking expands to the full /companion page.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuraStore } from '@/stores/auraStore'
import { Heart, Zap, Star, ChevronRight, Sparkles } from 'lucide-react'

const STAGE_EMOJI: Record<string, string> = {
  egg: '🥚',
  sprout: '🌱',
  young: '🐣',
  mature: '⚡',
  master: '🌟',
  legendary: '✨',
}

const MOOD_COLOR: Record<string, string> = {
  happy: 'text-green-400',
  content: 'text-blue-400',
  neutral: 'text-slate-400',
  sad: 'text-slate-500',
  unhappy: 'text-red-400',
}

function MoodIndicator({ happiness }: { happiness: number }) {
  const label = happiness >= 80 ? 'happy' : happiness >= 60 ? 'content' : happiness >= 40 ? 'neutral' : happiness >= 20 ? 'sad' : 'unhappy'
  return <span className={`text-xs font-medium ${MOOD_COLOR[label]}`}>{label}</span>
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6 }}
      />
    </div>
  )
}

export function CompanionSidebar() {
  const { aura } = useAuraStore()
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't render if no companion yet
  if (!aura) return null

  const stageEmoji = STAGE_EMOJI[aura.evolutionStage] ?? '🐾'
  const xpPct = aura.xpToNextLevel > 0
    ? Math.round((aura.experiencePoints / (aura.experiencePoints + aura.xpToNextLevel)) * 100)
    : 100

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-56 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-white leading-tight">{aura.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MoodIndicator happiness={aura.happiness} />
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/60 text-xs">Lv {aura.level}</span>
                </div>
              </div>
              <span className="text-2xl">{stageEmoji}</span>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-white/60">HP</span>
                  </div>
                  <span className="text-xs text-white/60">{aura.health}/{aura.maxHealth}</span>
                </div>
                <StatBar value={aura.health} max={aura.maxHealth} color="bg-red-400" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-white/60">Energy</span>
                  </div>
                  <span className="text-xs text-white/60">{aura.energy}/{aura.maxEnergy}</span>
                </div>
                <StatBar value={aura.energy} max={aura.maxEnergy} color="bg-yellow-400" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-white/60">XP</span>
                  </div>
                  <span className="text-xs text-white/60">{xpPct}%</span>
                </div>
                <StatBar value={xpPct} max={100} color="bg-purple-400" />
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/companion"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Cuidar da presença
              <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 shadow-lg flex items-center justify-center text-2xl relative"
        title={`${aura.name} (Lv ${aura.level})`}
      >
        {stageEmoji}
        {/* Happiness pulse ring */}
        {aura.happiness >= 70 && (
          <span className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping" />
        )}
        {/* Level badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
          {aura.level}
        </span>
      </motion.button>
    </div>
  )
}

export default CompanionSidebar
