/**
 * Achievements Page - Olcan Compass v2.5
 * 
 * Full-page achievement showcase using the gamification system.
 * Part of the Metamodern Realignment (MMXD).
 */

'use client'

import { ComingSoonPanel } from '@/components/product/ComingSoonPanel'
import { productSurface } from '@/lib/product-flags'
import { motion } from 'framer-motion'
import { Trophy, ChevronLeft, Zap, Star } from 'lucide-react'
import { GlassButton } from '@/components/ui'
import { AchievementShowcase, GamificationIntegration } from '@/components/gamification'
import Link from 'next/link'

export default function AchievementsPage() {
  if (!productSurface.gamificationHub) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-surface-bg p-6">
        <ComingSoonPanel
          title="Conquistas em breve"
          description="A galeria de conquistas persistentes será ativada junto com o backend de gamificação."
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
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-steel-400/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-steel-500/5 rounded-full blur-[150px]" />
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
                    <span className="text-caption font-semibold uppercase tracking-widest">Retornar à Aura</span>
                  </GlassButton>
                </Link>
                
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-500/10 border border-steel-500/20 text-caption font-semibold uppercase tracking-wide text-steel-600">
                    <Trophy className="w-4 h-4" />
                    Galeria de Prestígio
                  </div>
                  <h1 className="text-6xl md:text-8xl font-display text-ink-950 tracking-tighter leading-tight mt-2">
                    Conquistas
                  </h1>
                  <p className="text-xl text-ink-400 font-medium max-w-2xl leading-relaxed">
                    Sua <span className="text-steel-500 font-semibold">Aura</span> e você em perfeita sincronia. Estes artefatos refletem seu caminho único na mobilidade global.
                  </p>
                </div>
              </div>

              {/* Quick Stats Header Overlay */}
              <div className="flex gap-4 p-2 bg-bone-50/20 backdrop-blur-xl rounded-[2.5rem] border border-bone-500/10">
                <div className="px-8 py-6 rounded-[2rem] bg-white shadow-glass-sm border border-bone-500/10 text-center min-w-[140px]">
                  <Star className="w-6 h-6 text-steel-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-ink-950">12/48</div>
                  <div className="text-[8px] font-semibold text-ink-300 uppercase tracking-widest mt-1">Artefatos</div>
                </div>
                <div className="px-8 py-6 rounded-[2rem] bg-white shadow-glass-sm border border-bone-500/10 text-center min-w-[140px]">
                  <Zap className="w-6 h-6 text-steel-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-ink-950">Nível 8</div>
                  <div className="text-[8px] font-semibold text-ink-300 uppercase tracking-widest mt-1">Status Aura</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievement Showcase - Fluid Grid */}
          <div className="relative z-10">
            <AchievementShowcase />
          </div>
        </div>
      </div>
    </>
  )
}
