/**
 * Evolution Check Component - Olcan Compass v2.5
 * 
 * Displays evolution eligibility and allows triggering evolution for the Aura.
 * Part of the Liquid-Glass (MMXD) design system.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, Lock, Loader2, Zap } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'
import { useAuraStore } from '@/stores/auraStore'

interface EvolutionRequirement {
  label: string
  current: number
  required: number
  percentage: number
  unit: string
}

export function EvolutionCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [eligibility, setEligibility] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    aura, 
    checkEvolutionEligibility, 
    triggerEvolution,
    isLoading 
  } = useAuraStore()

  if (!aura) return null

  const handleCheckEligibility = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      const result = await checkEvolutionEligibility()
      setEligibility(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao verificar elegibilidade')
    } finally {
      setIsChecking(false)
    }
  }

  const handleEvolve = async () => {
    try {
      await triggerEvolution()
      setEligibility(null) // Reset after evolution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao evoluir Aura')
    }
  }

  const getRequirements = (): EvolutionRequirement[] => {
    if (!eligibility?.progress) return []
    
    return [
      {
        label: 'Nível',
        current: eligibility.progress.level.current,
        required: eligibility.progress.level.required,
        percentage: eligibility.progress.level.percentage,
        unit: '',
      },
      {
        label: 'Consistência',
        current: eligibility.progress.care_streak.current,
        required: eligibility.progress.care_streak.required,
        percentage: eligibility.progress.care_streak.percentage,
        unit: 'dias',
      },
      {
        label: 'Tempo de Estágio',
        current: eligibility.progress.days_at_stage.current,
        required: eligibility.progress.days_at_stage.required,
        percentage: eligibility.progress.days_at_stage.percentage,
        unit: 'dias',
      },
      {
        label: 'Conquistas',
        current: eligibility.progress.achievements.unlocked,
        required: eligibility.progress.achievements.required,
        percentage: eligibility.progress.achievements.percentage,
        unit: '',
      },
    ].filter(r => r.required > 0)
  }

  return (
    <GlassCard className="p-8 rounded-[2.5rem] bg-white border border-bone-500/10 shadow-glass-sm overflow-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl p-0" />
      
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20">
          <Sparkles className="w-6 h-6 text-gold-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-ink-950 uppercase tracking-tight leading-none">Evolução de Aura</h3>
          <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest mt-1.5 leading-none">
            Manifestação Atual: <span className="text-gold-500">{aura.evolutionStage}</span>
          </p>
        </div>
      </div>

      {/* Check Eligibility Button */}
      {!eligibility && !isChecking && (
        <GlassButton
          onClick={handleCheckEligibility}
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-ink-950 text-white font-semibold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-ink-950 transition-all shadow-lg"
        >
          Verificar Elegibilidade
          <ChevronRight className="w-4 h-4 ml-2" />
        </GlassButton>
      )}

      {/* Loading State */}
      {isChecking && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
          <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest animate-pulse">Sincronizando Requisitos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Eligibility Results */}
      <AnimatePresence>
        {eligibility && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Status Header */}
            <div className={`p-6 rounded-3xl border ${
              eligibility.eligible 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <div className="flex items-center gap-3">
                {eligibility.eligible ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-caption font-semibold text-emerald-600/70 uppercase tracking-widest">Sincronia Total</span>
                      <span className="text-sm font-semibold text-emerald-700 leading-tight">
                        Prontidão para manifestar {eligibility.next_stage}!
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-caption font-semibold text-amber-600/70 uppercase tracking-widest">Acesso Restrito</span>
                      <span className="text-sm font-semibold text-amber-700 leading-tight">
                        Ainda faltam marcos de manifestação.
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {!eligibility.eligible && eligibility.reasons?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-500/10">
                  <ul className="space-y-2">
                    {eligibility.reasons.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-body-sm text-amber-600/80 font-medium">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Requirements Progress */}
            <div className="space-y-4">
              <h4 className="text-caption font-semibold text-ink-300 uppercase tracking-[0.2em] px-1">
                Vetores de Evolução
              </h4>
              
              <div className="grid gap-4">
                {getRequirements().map((req) => (
                  <div key={req.label} className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-xs font-semibold text-ink-950 uppercase tracking-tight">{req.label}</span>
                      <span className={`text-caption font-semibold ${req.percentage >= 100 ? 'text-emerald-500' : 'text-ink-300'}`}>
                        {req.current} / {req.required} {req.unit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-ink-950/5 rounded-full overflow-hidden p-0.5 border border-bone-400/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(req.percentage, 100)}%` }}
                        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                        className={`h-full rounded-full ${
                          req.percentage >= 100 
                            ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'bg-gold-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolve Button */}
            {eligibility.eligible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4"
              >
                <GlassButton
                  onClick={handleEvolve}
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl bg-gold-500 text-ink-950 font-semibold text-sm uppercase tracking-widest hover:bg-ink-950 hover:text-white transition-all shadow-xl active:scale-95 group"
                >
                  <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Manifestar {eligibility.next_stage}
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </GlassButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
