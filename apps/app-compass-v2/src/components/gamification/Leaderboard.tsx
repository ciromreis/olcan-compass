/**
 * Leaderboard Component - Olcan Compass v2.5
 * 
 * Displays rankings for the global community, guilds, and archetypes.
 * Upgraded to the Metamodern Liquid-Glass (MMXD) aesthetic.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, ChevronRight, Crown, Star, Zap } from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import { AuraVisual } from '@/components/aura/AuraVisual'
import Link from 'next/link'
import type { EvolutionStage } from '@/stores/auraStore'

type LeaderboardType = 'global' | 'guild' | 'archetype'
type TimePeriod = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  level: number
  xp: number
  companionStage: EvolutionStage
  companionName: string
  streak: number
  achievements: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  type: LeaderboardType
  period: TimePeriod
  currentUserRank?: number
  onTypeChange?: (type: LeaderboardType) => void
  onPeriodChange?: (period: TimePeriod) => void
}

const TYPE_LABELS: Record<LeaderboardType, string> = {
  global: 'Ranking Global',
  guild: 'Ranking de Guilda',
  archetype: 'Ranking de Arquétipo',
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  weekly: 'Esta Semana',
  monthly: 'Este Mês',
  alltime: 'Sempre',
}

export function Leaderboard({
  entries,
  type,
  period,
  currentUserRank,
  onTypeChange,
  onPeriodChange,
}: LeaderboardProps) {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)
  const currentUserEntry = entries.find(e => e.isCurrentUser)

  return (
    <div className="space-y-8">
      {/* Header with filters - Liquid Glass */}
      <GlassCard className="p-8 rounded-[3rem] bg-bone-50/20 border border-bone-500/10 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-caption font-semibold uppercase tracking-wide text-gold-600 mb-4">
              <Trophy className="w-4 h-4" />
              Arena de Prestígio
            </div>
            <h2 className="text-4xl font-display text-ink-950 tracking-tighter leading-none">
              {TYPE_LABELS[type]}
            </h2>
            <p className="text-sm text-ink-400 font-medium mt-3">
              Período: <span className="text-ink-950 font-semibold uppercase tracking-tight">{PERIOD_LABELS[period]}</span>
              {currentUserRank && (
                <span className="ml-3 text-gold-600 font-semibold">
                   • Sua Posição: #{currentUserRank}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex bg-white/40 p-1.5 rounded-2xl border border-bone-500/10">
              {(Object.keys(TYPE_LABELS) as LeaderboardType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onTypeChange?.(t)}
                  className={`px-4 py-2.5 rounded-xl text-caption font-semibold uppercase tracking-tight transition-all duration-300 ${
                    type === t
                      ? 'bg-ink-950 text-white shadow-xl'
                      : 'text-ink-300 hover:text-ink-950'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex bg-white/40 p-1.5 rounded-2xl border border-bone-500/10">
              {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange?.(p)}
                  className={`px-4 py-2.5 rounded-xl text-caption font-semibold uppercase tracking-tight transition-all duration-300 ${
                    period === p
                      ? 'bg-gold-500 text-ink-950 shadow-xl'
                      : 'text-ink-300 hover:text-ink-950'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Podium for top 3 */}
      {podium.length > 0 && (
        <div className="flex justify-center items-end gap-6 md:gap-12 py-12 relative">
          {/* Background Highlight */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-64 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* 2nd place */}
          {podium[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-[1.5rem] bg-white border-2 border-slate-200 shadow-glass flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <AuraVisual 
                    evolutionStage={podium[1].companionStage} 
                    archetype="global_nomad"
                    name={podium[1].companionName}
                    level={podium[1].level}
                    stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                    happiness={100}
                    energy={100}
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center shadow-lg">
                  <Medal className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-display text-ink-950 group-hover:text-gold-500 transition-colors uppercase tracking-tight">{podium[1].username}</div>
                <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-1">Nível {podium[1].level}</div>
              </div>
            </motion.div>
          )}

          {/* 1st place */}
          {podium[0] && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center group -mt-12"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-[2rem] bg-ink-950 border-4 border-gold-500 shadow-glass flex items-center justify-center overflow-hidden scale-110"
                >
                  <AuraVisual 
                    evolutionStage={podium[0].companionStage} 
                    archetype="global_nomad"
                    name={podium[0].companionName}
                    level={podium[0].level}
                    stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                    happiness={100}
                    energy={100}
                  />
                </motion.div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-gold-500 drop-shadow-lg">
                  <Crown className="w-12 h-12 fill-current" />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gold-500 border-4 border-ink-950 flex items-center justify-center shadow-2xl">
                  <Trophy className="w-7 h-7 text-ink-950" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-ink-950 uppercase tracking-tighter leading-none">{podium[0].username}</div>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-caption font-semibold text-gold-600 uppercase tracking-widest">
                  Campeão do Ciclo
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd place */}
          {podium[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-amber-100 shadow-glass flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <AuraVisual 
                    evolutionStage={podium[2].companionStage} 
                    archetype="global_nomad"
                    name={podium[2].companionName}
                    level={podium[2].level}
                    stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                    happiness={100}
                    energy={100}
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-lg">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-display text-ink-950 group-hover:text-gold-500 transition-colors uppercase tracking-tight">{podium[2].username}</div>
                <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-1">Nível {podium[2].level}</div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* List - Rest of leaderboard */}
      <GlassCard className="rounded-[2.5rem] bg-white/60 border border-bone-500/10 shadow-sm overflow-hidden">
        <div className="divide-y divide-bone-500/10">
          {rest.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-6 p-6 hover:bg-gold-500/5 transition-all duration-500 cursor-pointer group ${
                entry.isCurrentUser ? 'bg-gold-500/10' : ''
              }`}
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="w-12 text-center font-display text-2xl text-ink-200 group-hover:text-gold-500 transition-colors">
                #{entry.rank}
              </div>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-ink-950/5 flex items-center justify-center overflow-hidden border border-bone-500/10 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <AuraVisual 
                  evolutionStage={entry.companionStage} 
                  archetype="global_nomad"
                  name={entry.companionName}
                  level={entry.level}
                  stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                  happiness={100}
                  energy={100}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg font-display text-ink-950 uppercase tracking-tight truncate flex items-center gap-3">
                  {entry.username}
                  {entry.isCurrentUser && (
                    <span className="px-2 py-0.5 rounded bg-gold-500 text-ink-950 text-[8px] font-semibold uppercase tracking-tight">VOCÊ</span>
                  )}
                </div>
                <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-1">
                  Manifestação {entry.companionName} • Nível {entry.level}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-10">
                <div className="text-right">
                  <div className="text-xs font-semibold text-ink-950 uppercase tracking-tight">{entry.xp.toLocaleString()}</div>
                  <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest">Sincronia</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-ink-950 uppercase tracking-tight">{entry.streak}d</div>
                  <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest">Frequência</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-ink-950 uppercase tracking-tight">{entry.achievements}</div>
                  <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest">Artefatos</div>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-bone-500 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>

        {/* Floating User Recap if not in top list */}
        {currentUserEntry && !entries.slice(0, 10).find(e => e.isCurrentUser) && (
          <div className="sticky bottom-0 bg-ink-950 text-white p-6 shadow-2xl border-t border-gold-500/20">
            <div className="flex items-center gap-6">
              <div className="w-12 text-center font-display text-2xl text-gold-500">
                #{currentUserEntry.rank}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                <AuraVisual 
                  evolutionStage={currentUserEntry.companionStage} 
                  archetype="global_nomad"
                  name={currentUserEntry.companionName}
                  level={currentUserEntry.level}
                  stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                  happiness={100}
                  energy={100}
                />
              </div>
              <div className="flex-1">
                <div className="text-lg font-display uppercase tracking-tight">Recapitulação de Status</div>
                <div className="text-caption font-medium text-white/50 uppercase tracking-widest mt-1">
                  Nível {currentUserEntry.level} • {currentUserEntry.xp.toLocaleString()} Sincronia TOTAL
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-caption font-semibold text-gold-500 uppercase tracking-widest">Em Ascensão</p>
                </div>
                <Zap className="w-6 h-6 text-gold-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

/**
 * Compact leaderboard preview for dashboard
 */
export function LeaderboardPreview({
  entries,
  currentUserRank,
}: {
  entries: LeaderboardEntry[]
  currentUserRank: number
}) {
  const top3 = entries.slice(0, 3)

  return (
    <GlassCard className="p-8 rounded-[2.5rem] bg-white border border-bone-500/10 shadow-sm group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-display text-ink-950 flex items-center gap-3 uppercase tracking-tight">
          <Trophy className="w-6 h-6 text-gold-500" />
          Mestres da Aura
        </h3>
        <div className="px-3 py-1 rounded-lg bg-gold-500/10 text-gold-600 text-caption font-semibold uppercase tracking-widest">
          Sua Posição: #{currentUserRank}
        </div>
      </div>

      <div className="space-y-4">
        {top3.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center gap-4 p-4 rounded-3xl bg-bone-50/50 border border-bone-500/5 hover:border-gold-500/20 transition-all group/item"
          >
            <div className="w-10 text-center font-display text-xl text-ink-200 group-hover/item:text-gold-500 transition-colors">
              #{entry.rank}
            </div>
            <div className="w-10 h-10 rounded-lg bg-ink-950/5 flex items-center justify-center overflow-hidden border border-bone-500/10">
              <AuraVisual 
                evolutionStage={entry.companionStage} 
                archetype="global_nomad"
                name={entry.companionName}
                level={entry.level}
                stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5, battlesWon: 0, battlesLost: 0 }}
                happiness={100}
                energy={100}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink-950 uppercase tracking-tight truncate">{entry.username}</div>
              <div className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-0.5">
                Lv.{entry.level} • {entry.xp.toLocaleString()} Sincronia
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/aura/leaderboard">
        <GlassButton className="w-full h-14 mt-8 rounded-2xl bg-ink-950 text-white font-semibold text-caption uppercase tracking-widest hover:bg-gold-500 hover:text-ink-950 transition-all shadow-lg group">
          Ver Ranking Completo
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </GlassButton>
      </Link>
    </GlassCard>
  )
}
