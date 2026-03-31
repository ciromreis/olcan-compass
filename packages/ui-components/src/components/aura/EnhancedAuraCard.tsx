/**
 * Enhanced Aura Card - Olcan Compass v2.5
 * Metamodern Minimalism (MMXD) + Liquid Glass
 */

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Zap, Shield, Star, TrendingUp, Orbit } from 'lucide-react'
import { ProceduralPresenceFigure, type PresencePhenotype } from './ProceduralPresenceFigure'

export interface EnhancedAuraProps {
  aura: {
    id: string
    name: string
    archetype: string
    level: number
    xp: number
    xpToNext: number
    evolutionStage: 'egg' | 'sprout' | 'young' | 'mature' | 'master' | 'legendary'
    currentHealth: number
    maxHealth: number
    energy: number
    maxEnergy: number
    stats: {
      power: number
      wisdom: number
      charisma: number
      agility: number
    }
  }
  size?: 'small' | 'medium' | 'large'
  showStats?: boolean
  showProgress?: boolean
  interactive?: boolean
  onInteract?: () => void
  phenotype?: PresencePhenotype
}

/**
 * ARCHETYPE_THEMES - SOBER V2.5
 * Using Gold, Silver, and Ink instead of generic blues/greens.
 */
const ARCHETYPE_THEMES: Record<string, { primary: string; secondary: string; mood: string }> = {
  individual_sovereignty: { primary: '#D4AF37', secondary: '#0A0A0B', mood: 'Definitivo' }, // Escapee
  academic_elite: { primary: '#7E8CA3', secondary: '#F9F6F0', mood: 'Erudito' }, // Scholar
  career_mastery: { primary: '#4D4D51', secondary: '#D4AF37', mood: 'Evolutivo' }, // Pivot
  global_presence: { primary: '#D4AF37', secondary: '#7E8CA3', mood: 'Livre' }, // Nomad
  frontier_architect: { primary: '#0A0A0B', secondary: '#ADB5BD', mood: 'Estrutural' }, // Bridge
  verified_talent: { primary: '#7E8CA3', secondary: '#F9F6F0', mood: 'Certificado' }, // DEV
  future_guardian: { primary: '#D4AF37', secondary: '#F9F6F0', mood: 'Protetor' }, // Mother
  change_agent: { primary: '#4D4D51', secondary: '#ADB5BD', mood: 'Impacto' }, // Servant
  knowledge_node: { primary: '#7E8CA3', secondary: '#0A0A0B', mood: 'Verdade' }, // Hermit
  conscious_leader: { primary: '#D4AF37', secondary: '#0A0A0B', mood: 'Sóbrio' }, // Refugee
  cultural_protagonist: { primary: '#7E8CA3', secondary: '#D4AF37', mood: 'Expressivo' }, // Visionary
  destiny_arbitrator: { primary: '#0A0A0B', secondary: '#F9F6F0', mood: 'Eficiente' } // Optimizer
}

const STAGE_DISPLAY: Record<string, { name: string; accent: string }> = {
  egg: { name: 'Semente', accent: 'from-gold-100 to-gold-400' },
  sprout: { name: 'Traço', accent: 'from-silver-100 to-silver-400' },
  young: { name: 'Figura', accent: 'from-slate-200 to-slate-500' },
  mature: { name: 'Entidade', accent: 'from-ink-300 to-ink-600' },
  master: { name: 'Insígnia', accent: 'from-gold-300 to-gold-600' },
  legendary: { name: 'Ressonância', accent: 'from-white via-gold-200 to-silver-300' }
}

const ARCHETYPE_LABELS: Record<string, string> = {
  individual_sovereignty: 'Soberania Individual',
  academic_elite: 'Elite Acadêmica',
  career_mastery: 'Maestria de Carreira',
  global_presence: 'Presença Global',
  frontier_architect: 'Arquiteto de Fronteira',
  verified_talent: 'Talento Validado',
  future_guardian: 'Guardiã do Futuro',
  change_agent: 'Agente de Mudança',
  knowledge_node: 'Nó de Conhecimento',
  conscious_leader: 'Liderança Consciente',
  cultural_protagonist: 'Protagonista Cultural',
  destiny_arbitrator: 'Arbitrador de Destino'
}

export const EnhancedAuraCard: React.FC<EnhancedAuraProps> = memo(({
  aura,
  size = 'medium',
  showStats = true,
  showProgress = true,
  interactive = true,
  onInteract,
  phenotype,
}) => {
  const theme = ARCHETYPE_THEMES[aura.archetype] || ARCHETYPE_THEMES.individual_sovereignty
  const stage = STAGE_DISPLAY[aura.evolutionStage]
  
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }
  
  const glyphSizes = {
    small: 'h-40 w-40',
    medium: 'h-52 w-52',
    large: 'h-64 w-64'
  }

  return (
    <motion.div
      whileHover={interactive ? { y: -4, transition: { duration: 0.3, ease: 'easeOut' } } : {}}
      whileTap={interactive ? { scale: 0.99 } : {}}
      onClick={onInteract}
      className={`
        relative overflow-hidden rounded-[2rem]
        bg-surface-card backdrop-blur-2xl border border-white/40
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer' : ''}
        shadow-card hover:shadow-card-hover transition-all duration-500
      `}
    >
      {/* Liquid Glow (Replaces Blue Gradients) */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none"
      />
      <div 
        className="absolute -bottom-16 -left-16 w-48 h-48 bg-silver-500/5 rounded-full blur-[60px] pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-500/5 border border-ink-500/10 text-[10px] font-bold uppercase tracking-widest text-ink-300">
              <Orbit className="h-3 w-3 text-gold-500" />
              Manifesto de Identidade
            </div>
            <h3 className="text-3xl font-display text-ink-500 tracking-tight">{aura.name}</h3>
            <div className="flex items-center gap-2 text-sm text-ink-300/80">
              <span className="font-semibold text-gold-600">{stage.name}</span>
              <span className="w-1 h-1 rounded-full bg-ink-100" />
              <span>{ARCHETYPE_LABELS[aura.archetype] || aura.archetype}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold-500/10 border border-gold-500/20">
            <Star className="w-4 h-4 text-gold-600 fill-gold-600" />
            <span className="text-gold-700 font-bold text-sm">Nível {aura.level}</span>
          </div>
        </div>

        {/* Aura Visual (Centered) */}
        <div className="flex-1 flex justify-center items-center py-6">
          <ProceduralPresenceFigure
            sizeClass={glyphSizes[size]}
            primary={theme.primary}
            secondary={theme.secondary}
            stageName={stage.name}
            stageMotif={stage.name}
            accentClass={stage.accent}
            phenotype={phenotype}
          />
        </div>

        {/* Footer Metrics */}
        <div className="mt-auto space-y-6">
          {/* XP Progress (Clean Sidebar-style) */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-ink-300">
                <span>Densidade de Experiência</span>
                <span className="text-gold-600">{Math.round((aura.xp / aura.xpToNext) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-ink-500/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(aura.xp / aura.xpToNext) * 100}%` }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          )}

          {/* Core Stats (Sober Grid) */}
          {showStats && (
            <div className="grid grid-cols-2 gap-4">
              <StatItem icon={<Shield className="w-3.5 h-3.5" />} label="Resiliência" value={aura.stats.power} />
              <StatItem icon={<Star className="w-3.5 h-3.5" />} label="Eloquência" value={aura.stats.charisma} />
              <StatItem icon={<Zap className="w-3.5 h-3.5" />} label="Intelecto" value={aura.stats.wisdom} />
              <StatItem icon={<TrendingUp className="w-3.5 h-3.5" />} label="Tração" value={aura.stats.agility} />
            </div>
          )}
        </div>
      </div>

      {/* Surface Grain Overlay (for Premium Feel) */}
      <div className="absolute inset-0 pointer-events-none bg-noise-texture opacity-[0.03]" />
    </motion.div>
  )
})

EnhancedAuraCard.displayName = 'EnhancedAuraCard'

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({
  icon,
  label,
  value
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-300">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-lg font-display text-ink-500">{value}</div>
  </div>
)
