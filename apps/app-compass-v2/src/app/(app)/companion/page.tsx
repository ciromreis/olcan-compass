/**
 * Companion Page - Olcan Compass v2.5
 * Wrapper for Aura system with proper branding
 */

'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Zap, Sparkles, Shield, Trophy, Target, Orbit, Activity } from 'lucide-react'
import { GlassCard, GlassButton } from '@olcan/ui-components'
import { 
  useAuraStore, 
  useAura,
  useCareStreak,
  type CareActivityType 
} from '@/stores/auraStore'
import { EvolutionCheck } from '@/components/aura/EvolutionCheck'
import { AuraVisual } from '@/components/aura/AuraVisual'
import { 
  GamificationIntegration, 
  StreakVisualizer,
  CelebrationToastContainer
} from '@/components/gamification'
import Link from 'next/link'

const CARE_ACTIVITIES: { type: CareActivityType; icon: any; label: string; xpReward: number; energyCost: number; description: string }[] = [
  { type: 'feed', icon: Heart, label: 'Nutrir', xpReward: 10, energyCost: 5, description: 'Fortalece a conexão e vitalidade' },
  { type: 'train', icon: Zap, label: 'Treinar', xpReward: 20, energyCost: 15, description: 'Desenvolve habilidades e poder' },
  { type: 'play', icon: Sparkles, label: 'Interagir', xpReward: 8, energyCost: 8, description: 'Aumenta felicidade e carisma' },
  { type: 'rest', icon: Shield, label: 'Descansar', xpReward: 5, energyCost: 0, description: 'Recupera energia e saúde' },
]

export default function CompanionPage() {
  const companion = useAura()
  const careStreak = useCareStreak()
  
  const { 
    fetchAura, 
    performCareActivity, 
    isLoading 
  } = useAuraStore()

  useEffect(() => {
    fetchAura()
  }, [fetchAura])

  if (!companion && !isLoading) {
    if (typeof window !== 'undefined') {
      window.location.href = '/companion/discover'
    }
    return null
  }

  if (!companion) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Orbit className="w-8 h-8 text-brand-500 animate-spin" />
          <div className="text-sm text-text-muted animate-pulse">Carregando seu companion...</div>
        </div>
      </div>
    )
  }

  const handleCareActivity = async (activity: typeof CARE_ACTIVITIES[0]) => {
    try {
      await performCareActivity(activity.type)
    } catch (error) {
      console.error('Atividade de cuidado falhou:', error)
    }
  }

  return (
    <>
      <GamificationIntegration />
      <CelebrationToastContainer />
      
      <div className="max-w-[1400px] mx-auto pb-24 px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold uppercase tracking-wider text-brand-600">
              <Heart className="w-4 h-4" />
              Seu Companion de Jornada
            </div>
            <h1 className="font-heading text-5xl md:text-7xl text-text-primary tracking-tight">{companion.name}</h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              Arquétipo: <span className="text-text-primary font-semibold capitalize">{companion.archetype.replace('_', ' ')}</span> • Estágio: <span className="text-text-primary font-semibold capitalize">{companion.evolutionStage}</span>
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/companion/achievements">
              <GlassButton className="min-w-[180px] h-14 rounded-2xl border border-brand-200 bg-white hover:bg-brand-500 hover:text-white transition-all group">
                <Trophy className="w-5 h-5 mr-2 text-brand-500 group-hover:text-white transition-colors" />
                Conquistas
              </GlassButton>
            </Link>
            <Link href="/companion/quests">
              <GlassButton className="min-w-[180px] h-14 rounded-2xl border border-brand-200 bg-white hover:bg-brand-500 hover:text-white transition-all group">
                <Target className="w-5 h-5 mr-2 text-brand-500 group-hover:text-white transition-colors" />
                Missões
              </GlassButton>
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Visual & Stats Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="card-surface p-12 rounded-3xl flex flex-col items-center"
            >
              <div className="mb-8 w-full flex justify-center">
                <AuraVisual
                  evolutionStage={companion.evolutionStage}
                  archetype={companion.archetype}
                  name={companion.name}
                  level={companion.level}
                  stats={companion.stats}
                  happiness={companion.happiness}
                  energy={companion.energy}
                />
              </div>

              {/* Progress UI */}
              <div className="w-full max-w-2xl space-y-4">
                <div className="flex justify-between items-end px-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Nível</span>
                    <span className="font-heading text-4xl text-text-primary mt-1">{companion.level}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Experiência</span>
                    <span className="text-base font-semibold text-brand-600 mt-1">{companion.experiencePoints} / {companion.xpToNextLevel}</span>
                  </div>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(companion.experiencePoints / companion.xpToNextLevel) * 100}%` }}
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-3xl">
                <StatItem icon={<Activity className="w-5 h-5" />} label="Força" value={companion.stats.power} />
                <StatItem icon={<Zap className="w-5 h-5" />} label="Agilidade" value={companion.stats.agility} />
                <StatItem icon={<Target className="w-5 h-5" />} label="Sabedoria" value={companion.stats.wisdom} />
                <StatItem icon={<Sparkles className="w-5 h-5" />} label="Carisma" value={companion.stats.charisma} />
              </div>
            </motion.div>

            {/* Care Activities */}
            <div className="grid md:grid-cols-2 gap-6">
              {CARE_ACTIVITIES.map((activity, idx) => (
                <motion.div
                  key={activity.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <ActivityButton
                    activity={activity}
                    currentEnergy={companion.energy}
                    onClick={() => handleCareActivity(activity)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Energy Card */}
            <GlassCard className="card-surface p-8 rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Energia</h3>
                  <div className="p-2 rounded-xl bg-brand-50">
                    <Zap className="w-5 h-5 text-brand-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-6xl text-brand-600">{Math.round(companion.energy)}</span>
                  <span className="text-lg font-semibold text-text-muted">/ {companion.maxEnergy}</span>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(companion.energy / companion.maxEnergy) * 100}%` }}
                    className="h-full bg-brand-500"
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Recuperação: 1.5 por hora
                </div>
              </div>
            </GlassCard>

            {/* Streak Visualizer */}
            <div className="rounded-3xl overflow-hidden">
              <StreakVisualizer
                currentStreak={careStreak}
                bestStreak={careStreak}
                multiplier={1 + (careStreak >= 7 ? 0.25 : 0)}
              />
            </div>

            {/* Evolution Check */}
            <div className="rounded-3xl overflow-hidden">
              <EvolutionCheck />
            </div>

            {/* Quick Links */}
            <GlassCard className="card-surface p-6 rounded-3xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Acesso Rápido</h3>
              <div className="space-y-3">
                <Link href="/companion/achievements" className="block">
                  <GlassButton className="w-full justify-between h-12 px-4 rounded-xl bg-white border border-cream-300 hover:bg-brand-50 transition-all">
                    <span className="font-semibold text-sm">Conquistas</span>
                    <Trophy className="w-4 h-4 text-brand-500" />
                  </GlassButton>
                </Link>
                <Link href="/companion/quests" className="block">
                  <GlassButton className="w-full justify-between h-12 px-4 rounded-xl bg-white border border-cream-300 hover:bg-brand-50 transition-all">
                    <span className="font-semibold text-sm">Missões</span>
                    <Target className="w-4 h-4 text-brand-500" />
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  )
}

function StatItem({ icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white border border-cream-300 p-5 rounded-2xl flex flex-col items-start gap-3 hover:shadow-md transition-all group">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">{label}</div>
        <div className="text-2xl font-semibold text-text-primary">{value}</div>
      </div>
    </div>
  )
}

function ActivityButton({ activity, currentEnergy, onClick }: { activity: any; currentEnergy: number; onClick: () => void }) {
  const canAfford = currentEnergy >= activity.energyCost
  
  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`
        group w-full p-6 flex items-center gap-6 rounded-2xl border transition-all
        ${canAfford 
          ? 'bg-white border-cream-300 cursor-pointer hover:bg-brand-500 hover:border-brand-500 hover:shadow-lg hover:-translate-y-0.5' 
          : 'bg-cream-100 border-cream-200 opacity-40 cursor-not-allowed'}
      `}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all
        ${canAfford ? 'bg-brand-500 text-white group-hover:bg-white group-hover:text-brand-500' : 'bg-cream-200 text-cream-400'}
      `}>
        <activity.icon className="w-7 h-7" />
      </div>
      <div className="text-left flex-1">
        <div className={`font-heading text-xl mb-1 ${canAfford ? 'text-text-primary group-hover:text-white' : 'text-text-muted'}`}>
          {activity.label}
        </div>
        <p className={`text-xs font-medium ${canAfford ? 'text-text-secondary group-hover:text-white/80' : 'text-text-muted'}`}>
          {activity.description}
        </p>
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${canAfford ? 'text-text-primary group-hover:text-white' : 'text-text-muted'}`}>
          -{activity.energyCost}
        </div>
        <div className={`text-xs uppercase tracking-wider mt-0.5 ${canAfford ? 'text-text-muted group-hover:text-white/60' : 'text-text-muted'}`}>
          Energia
        </div>
      </div>
    </button>
  )
}
