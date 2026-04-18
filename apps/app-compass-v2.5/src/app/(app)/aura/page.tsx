/**
 * Aura Dashboard - Olcan Compass v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */

'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Sparkles, Shield, Trophy, Target, Orbit, Fingerprint, Activity, Book, Download, Lock, Dna } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
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
import { productSurface } from '@/lib/product-flags'
import { useRouteStore } from '@/stores/routes'
import { useForgeStore } from '@/stores/forge'
import { useInterviewStore } from '@/stores/interviews'
import { derivePresencePhenotype, deriveRoutePresenceSignals } from '@/lib/presence-phenotype'

const AURA_ACTIVITIES: { type: CareActivityType; icon: React.ComponentType; label: string; xpReward: number; energyCost: number; description: string }[] = [
  { type: 'feed', icon: Fingerprint, label: 'Calibrar', xpReward: 10, energyCost: 5, description: 'Sincronia biomecânica' },
  { type: 'train', icon: Zap, label: 'Potencializar', xpReward: 20, energyCost: 15, description: 'Expansão de tração' },
  { type: 'play', icon: Sparkles, label: 'Manifestar', xpReward: 8, energyCost: 8, description: 'Ressonância ativa' },
  { type: 'rest', icon: Shield, label: 'Preservar', xpReward: 5, energyCost: 0, description: 'Recuperação de densidade' },
]

export default function AuraPage() {
  const router = useRouter()
  const aura = useAura()
  const careStreak = useCareStreak()
  const { routes, getRouteProgress } = useRouteStore()
  const { documents } = useForgeStore()
  const { sessions } = useInterviewStore()

  const {
    fetchAura,
    performCareActivity,
    isLoading
  } = useAuraStore()

  useEffect(() => {
    fetchAura()
  }, [fetchAura])

  useEffect(() => {
    if (!isLoading && !aura) {
      router.push('/aura/discover')
    }
  }, [isLoading, aura, router])

  const routeSignals = useMemo(
    () => deriveRoutePresenceSignals(routes, documents, sessions, getRouteProgress),
    [routes, documents, sessions, getRouteProgress]
  )
  const phenotype = useMemo(() => derivePresencePhenotype(routeSignals), [routeSignals])

  if (!aura) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Orbit className="w-8 h-8 text-steel-500 animate-spin-slow" />
          <div className="text-[10px] uppercase tracking-wide text-ink-300 font-bold animate-pulse">Sincronizando Aura...</div>
        </div>
      </div>
    )
  }

  const handleAuraActivity = async (activity: typeof AURA_ACTIVITIES[0]) => {
    try {
      await performCareActivity(activity.type)
    } catch (error) {
      console.error('Aura activity failed:', error)
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-500/10 border border-steel-500/20 text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-600">
              <Orbit className="w-4 h-4" />
              Sua Presença
            </div>
            <h1 className="text-6xl md:text-8xl font-display text-ink-950 tracking-tighter leading-tight">{aura.name}</h1>
            <p className="text-xl text-ink-400 font-medium max-w-2xl">
              Estágio: <span className="text-ink-950 font-semibold capitalize tracking-tight bg-steel-500/10 px-2 rounded-md">{aura.evolutionStage}</span> • Nível <span className="text-ink-950 font-semibold">{aura.level}</span>
            </p>
            <p className="text-sm text-ink-400 font-medium max-w-2xl">
              {phenotype.routeLabel ? `Rota dominante: ${phenotype.routeLabel}.` : 'Sem rota dominante no momento.'} Adaptação atual em {Math.round((phenotype.adaptationLevel ?? 0.18) * 100)}% com urgência de {Math.round((phenotype.urgencyLevel ?? 0.22) * 100)}%.
            </p>
            {!productSurface.gamificationHub ? (
              <p className="max-w-2xl border-l-2 border-steel-500/35 pl-3 text-xs font-medium leading-relaxed text-ink-400">
                As telas completas de Missões e Conquistas ainda estão em construção; você pode abrir os atalhos ao lado para ver o estado
                atual. XP, nível e atividades de cuidado da Aura permanecem ativos nesta página.
              </p>
            ) : null}
          </div>
          
          <div className="flex gap-4">
            <Link href="/aura/achievements">
              <GlassButton className="min-w-[180px] h-16 rounded-[2rem] border border-bone-500/20 bg-bone-50/40 backdrop-blur-xl shadow-glass-sm font-semibold text-ink-900 hover:bg-steel-500 hover:text-ink-950 hover:border-steel-500 transition-all duration-500 group">
                <Trophy className="w-6 h-6 mr-3 text-steel-500 group-hover:text-ink-950 transition-colors" />
                Conquistas
              </GlassButton>
            </Link>
            <Link href="/aura/quests">
              <GlassButton className="min-w-[180px] h-16 rounded-[2rem] border border-bone-500/20 bg-bone-50/40 backdrop-blur-xl shadow-glass-sm font-semibold text-ink-900 hover:bg-steel-500 hover:text-ink-950 hover:border-steel-500 transition-all duration-500 group">
                <Target className="w-6 h-6 mr-3 text-steel-500 group-hover:text-ink-950 transition-colors" />
                Missões
              </GlassButton>
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Visual & Stats Area */}
          <div className="lg:col-span-8 space-y-12">
            {/* Visual Glass Podium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="relative overflow-hidden rounded-[4rem] bg-bone-50/30 backdrop-blur-[64px] border border-bone-500/20 shadow-glass p-16 flex flex-col items-center"
            >
              {/* Decorative dynamic lights */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-steel-500/10 rounded-full blur-[120px]" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px]" />
              
              <div className="mb-12 w-full flex justify-center">
                <AuraVisual
                  evolutionStage={aura.evolutionStage}
                  archetype={aura.archetype}
                  name={aura.name}
                  level={aura.level}
                  stats={aura.stats}
                  happiness={aura.happiness}
                  energy={aura.energy}
                  phenotype={phenotype}
                  pathnameHint="/aura"
                />
              </div>

              {/* Progress UI */}
              <div className="w-full max-w-2xl space-y-6">
                <div className="flex justify-between items-end px-2">
                  <div className="flex flex-col">
                    <span className="text-body-sm font-semibold uppercase tracking-wide text-ink-300">Nível Operacional</span>
                    <span className="text-4xl font-display text-ink-950 leading-none mt-1">{aura.level}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-body-sm font-semibold uppercase tracking-wide text-ink-300">Sincronia XP</span>
                    <span className="text-base font-semibold text-steel-600 mt-1">{aura.experiencePoints} / {aura.xpToNextLevel}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-ink-950/5 rounded-full overflow-hidden p-0.5 border border-bone-500/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(aura.experiencePoints / aura.xpToNextLevel) * 100}%` }}
                    className="h-full bg-gradient-to-r from-steel-400 to-steel-600 rounded-full shadow-[0_0_20px_rgba(148,163,184,0.4)]"
                    transition={{ duration: 2.5, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
              </div>

              {/* Critical Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 w-full max-w-3xl">
                <StatItem icon={<Activity className="w-5 h-5" />} label="Resiliência" value={aura.stats.power} />
                <StatItem icon={<Zap className="w-5 h-5" />} label="Tração" value={aura.stats.agility} />
                <StatItem icon={<Target className="w-5 h-5" />} label="Intelecto" value={aura.stats.wisdom} />
                <StatItem icon={<Sparkles className="w-5 h-5" />} label="Fluência" value={aura.stats.charisma} />
              </div>
            </motion.div>

            {/* Aura Manifestation Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              {AURA_ACTIVITIES.map((activity, idx) => (
                <motion.div
                  key={activity.type}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ActivityButton
                    activity={activity}
                    currentEnergy={aura.energy}
                    onClick={() => handleAuraActivity(activity)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            {/* Energy Reserve Card - Ultra Dark Liquid Glass */}
            <GlassCard className="p-10 rounded-[3rem] bg-ink-950 border-ink-900 border-2 text-white overflow-hidden relative shadow-2xl">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-steel-400/15 rounded-full blur-[80px]" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-sm font-semibold uppercase tracking-wider text-steel-400">Potencial de Ação</h3>
                  <div className="p-2 rounded-xl bg-steel-500/10 border border-steel-500/20">
                    <Zap className="w-5 h-5 text-steel-500 fill-steel-500/30" />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-display leading-none tracking-tighter text-steel-500">{Math.round(aura.energy)}</span>
                  <span className="text-lg font-semibold text-white/50 uppercase tracking-widest">/ {aura.maxEnergy} EP</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(aura.energy / aura.maxEnergy) * 100}%` }}
                    className="h-full bg-steel-500 shadow-[0_0_15px_rgba(148,163,184,0.5)]"
                    transition={{ duration: 1.5 }}
                  />
                </div>
                <div className="flex items-center gap-2 text-body-sm text-white/60 font-semibold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Recuperação ativa: 1.5 por hora
                </div>
              </div>
            </GlassCard>

            {/* Streak Visualizer with MMXD styling */}
            <div className="rounded-[3rem] overflow-hidden border border-bone-500/20">
              <StreakVisualizer
                currentStreak={careStreak}
                bestStreak={careStreak}
                multiplier={1 + (careStreak >= 7 ? 0.25 : 0)}
              />
            </div>

            {/* Evolution Check with MMXD styling */}
            <div className="rounded-[3rem] overflow-hidden shadow-sm">
              <EvolutionCheck />
            </div>

            {/* Digital Dossier Card - High Fidelity Output */}
            <GlassCard className="p-10 rounded-[3rem] bg-gradient-to-br from-steel-50 to-bone-50 border border-steel-200/40 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Book className="w-24 h-24 text-steel-900" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-steel-500 animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-500">Output Profissional</span>
                </div>
                <h3 className="text-2xl font-display text-ink-950 mb-3">Dossier Digital v2.5</h3>
                <p className="text-sm text-ink-400 mb-8 leading-relaxed">
                  Consolidação do seu perfil de mobilidade, progresso no Forge e prontidão para o mercado global em um artefato soberano.
                </p>

                {aura.level >= 10 ? (
                  <GlassButton 
                    onClick={async () => {
                      const res = await fetch('/api/dossier/export', {
                        method: 'POST',
                        body: JSON.stringify({ userId: aura.userId, level: aura.level })
                      });
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Dossier-Digital-${aura.name}.docx`;
                        a.click();
                      }
                    }}
                    className="w-full h-16 rounded-2xl bg-ink-950 text-white font-semibold flex items-center justify-center gap-3 hover:bg-steel-600 transition-all duration-500 shadow-2xl"
                  >
                    <Download className="w-5 h-5" />
                    Exportar Dossier (.docx)
                  </GlassButton>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-steel-100/50 border border-steel-200/20 text-[11px] font-medium text-steel-500 flex items-center gap-3">
                      <Lock className="w-4 h-4" />
                      Manifestação em nível {aura.level}/10 para desbloqueio
                    </div>
                    <div className="w-full h-1.5 bg-steel-200/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-steel-400 transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (aura.level / 10) * 100)}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Quick Access Card */}
            <GlassCard className="p-10 rounded-[3rem] bg-bone-50/20 border border-bone-500/10 backdrop-blur-xl">
              <h3 className="text-body-sm font-semibold uppercase tracking-wide text-ink-300 mb-8">Navegação Auxiliar</h3>
              <div className="space-y-4">
                <Link href="/aura/achievements" className="block">
                  <GlassButton className="w-full justify-between h-16 px-6 rounded-2xl bg-white border border-bone-400/10 hover:bg-ink-950 hover:text-white group transition-all duration-300">
                    <span className="font-semibold text-sm uppercase tracking-tight">Registro de Evolução</span>
                    <Trophy className="w-5 h-5 text-steel-500 group-hover:rotate-12 transition-transform" />
                  </GlassButton>
                </Link>
                <Link href="/aura/quests" className="block">
                  <GlassButton className="w-full justify-between h-16 px-6 rounded-2xl bg-white border border-bone-400/10 hover:bg-ink-950 hover:text-white group transition-all duration-300">
                    <span className="font-semibold text-sm uppercase tracking-tight">Missões Ativas</span>
                    <Target className="w-5 h-5 text-steel-500 group-hover:scale-125 transition-transform" />
                  </GlassButton>
                </Link>
                <Link href="/atlas" className="block">
                  <GlassButton className="w-full justify-between h-16 px-6 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-950 hover:text-white group transition-all duration-300">
                    <span className="font-semibold text-sm uppercase tracking-tight text-slate-900 group-hover:text-white">Perfil de Mobilidade (Atlas)</span>
                    <Dna className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform" />
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

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white/50 border border-bone-500/10 p-6 rounded-3xl flex flex-col items-start gap-4 hover:shadow-lg hover:bg-white transition-all duration-500 group">
      <div className="w-12 h-12 rounded-2xl bg-ink-950/5 flex items-center justify-center text-steel-600 group-hover:bg-steel-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-300 leading-none mb-2">{label}</div>
        <div className="text-2xl font-semibold text-ink-950 tracking-tighter">{value}</div>
      </div>
    </div>
  )
}

function ActivityButton({ activity, currentEnergy, onClick }: { activity: { icon: React.ComponentType<{ className?: string }>; label: string; description: string; energyCost: number }; currentEnergy: number; onClick: () => void }) {
  const canAfford = currentEnergy >= activity.energyCost
  
  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`
        group w-full p-8 flex items-center gap-8 rounded-[3rem] border transition-all duration-500
        ${canAfford 
          ? 'bg-white/60 border-bone-500/20 cursor-pointer hover:bg-ink-950 hover:border-ink-950 hover:shadow-2xl hover:-translate-y-1' 
          : 'bg-ink-500/5 border-bone-500/10 opacity-30 cursor-not-allowed'}
      `}
    >
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-glass-sm
        ${canAfford ? 'bg-steel-500 text-ink-950 group-hover:bg-white group-hover:scale-110' : 'bg-ink-100 text-ink-300'}
      `}>
        <activity.icon className="w-8 h-8" />
      </div>
      <div className="text-left flex-1">
        <div className={`font-display text-2xl leading-none mb-2 ${canAfford ? 'text-ink-950 group-hover:text-steel-400' : 'text-ink-400'}`}>
          {activity.label}
        </div>
        <p className={`text-xs font-bold uppercase tracking-wider ${canAfford ? 'text-ink-400 group-hover:text-white/70' : 'text-ink-300'}`}>
          {activity.description}
        </p>
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold tracking-tighter ${canAfford ? 'text-ink-950 group-hover:text-white' : 'text-ink-400'}`}>
          -{activity.energyCost} EP
        </div>
        <div className={`text-[10px] font-semibold uppercase tracking-wide mt-1 ${canAfford ? 'text-ink-300 group-hover:text-steel-400/70' : 'text-ink-200'}`}>
          Custo
        </div>
      </div>
    </button>
  )
}
