/**
 * Quests Page
 * 
 * Full-page quest dashboard using the gamification system.
 */

'use client'

import { ComingSoonPanel } from '@/components/product/ComingSoonPanel'
import { productSurface } from '@/lib/product-flags'
import { motion } from 'framer-motion'
import { Target, ChevronLeft } from 'lucide-react'
import { GlassButton } from '@/components/ui'
import { QuestDashboard, GamificationIntegration } from '@/components/gamification'
import Link from 'next/link'

export default function QuestsPage() {
  if (!productSurface.gamificationHub) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-surface-bg p-6">
        <ComingSoonPanel
          title="Missões e quests em breve"
          description="O hub de gamificação (quests, progressão ligada à rota) ainda está em construção. Sua Aura e o painel principal já refletem evolução básica."
          backHref="/aura"
          backLabel="Voltar à Aura"
        />
      </div>
    )
  }

  return (
    <>
      <GamificationIntegration />
      
      <div className="min-h-screen bg-surface-bg pb-24">
        {/* Decorative background orbs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[15%] right-[5%] w-72 h-72 bg-steel-400/5 rounded-full blur-[130px]" />
          <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-steel-500/5 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-12">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-6">
                <Link href="/aura">
                  <GlassButton className="h-12 px-5 rounded-2xl bg-white border border-bone-500/20 text-ink-300 hover:text-ink-950 transition-all shadow-sm flex items-center gap-2 group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Retornar à Aura</span>
                  </GlassButton>
                </Link>
                
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-500/10 border border-steel-500/20 text-[10px] font-semibold uppercase tracking-wide text-steel-600">
                    <Target className="w-4 h-4" />
                    Central de Missões
                  </div>
                  <h1 className="text-6xl md:text-8xl font-display text-ink-950 tracking-tighter leading-tight mt-2">
                    Quests
                  </h1>
                  <p className="text-xl text-ink-400 font-medium max-w-2xl leading-relaxed">
                    Acelere sua evolução global. Complete marcos estratégicos e fortaleça sua <span className="text-steel-500 font-semibold">Aura</span> em cada etapa da jornada.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quest Dashboard */}
          <div className="relative z-10 glass-container rounded-[3rem] overflow-hidden">
            <QuestDashboard />
          </div>
        </div>
      </div>
    </>
  )
}
