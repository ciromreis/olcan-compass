/**
 * Evolution Path Visualization
 * Shows the 6-stage evolution journey with progress indicators
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Orbit } from 'lucide-react'

export interface EvolutionStage {
  id: string
  name: string
  mark: string
  level: number
  unlocked: boolean
  current: boolean
  descriptor: string
}

export interface EvolutionPathProps {
  currentStage: 'egg' | 'sprout' | 'young' | 'mature' | 'master' | 'legendary'
  currentLevel: number
  archetype: string
  onStageClick?: (stage: string) => void
}

const EVOLUTION_STAGES: EvolutionStage[] = [
  { id: 'egg', name: 'Semente', mark: '01', level: 1, unlocked: true, current: false, descriptor: 'núcleo latente' },
  { id: 'sprout', name: 'Traço', mark: '02', level: 5, unlocked: false, current: false, descriptor: 'primeiro contorno' },
  { id: 'young', name: 'Figura', mark: '03', level: 15, unlocked: false, current: false, descriptor: 'mistura visível' },
  { id: 'mature', name: 'Entidade', mark: '04', level: 30, unlocked: false, current: false, descriptor: 'assinatura própria' },
  { id: 'master', name: 'Insígnia', mark: '05', level: 50, unlocked: false, current: false, descriptor: 'presença calibrada' },
  { id: 'legendary', name: 'Ressonância', mark: '06', level: 75, unlocked: false, current: false, descriptor: 'eco memorável' }
]

export const EvolutionPath: React.FC<EvolutionPathProps> = ({
  currentStage,
  currentLevel,
  archetype,
  onStageClick
}) => {
  const stages = EVOLUTION_STAGES.map(stage => ({
    ...stage,
    unlocked: currentLevel >= stage.level,
    current: stage.id === currentStage
  }))

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-foreground/70 backdrop-blur-md">
          <Orbit className="h-3.5 w-3.5" />
          Recomposição visual
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Sequência de recombinação</h3>
        <p className="text-foreground/60">A leitura da presença muda conforme o uso, a cadência e o contexto</p>
      </div>

      {/* Evolution Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-0 right-0 top-12 hidden h-1 bg-foreground/10 lg:block">
          <motion.div
            className="h-full bg-gradient-to-r from-slate-300 via-companion-primary to-companion-secondary"
            initial={{ width: '0%' }}
            animate={{
              width: `${(stages.findIndex(s => s.current) / (stages.length - 1)) * 100}%`
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Stages */}
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, index) => (
            <StageNode
              key={stage.id}
              stage={stage}
              index={index}
              onClick={() => onStageClick?.(stage.id)}
            />
          ))}
        </div>
      </div>

      {/* Current Stage Info */}
      <div className="mt-8 rounded-[28px] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(241,245,249,0.66))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(226,232,240,0.72))] text-xl font-bold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            {stages.find(s => s.current)?.mark}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-foreground mb-1">
              Leitura atual: {stages.find(s => s.current)?.name}
            </h4>
            <p className="text-foreground/60 mb-2">
              Nível {currentLevel} • {archetype}
            </p>
            <p className="text-sm text-foreground/75">
              {stages.find(s => s.current)?.descriptor}
            </p>
            {stages.findIndex(s => s.current) < stages.length - 1 && (
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <span>Próxima leitura no nível {stages[stages.findIndex(s => s.current) + 1]?.level}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const StageNode: React.FC<{
  stage: EvolutionStage
  index: number
  onClick: () => void
}> = ({ stage, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center"
    >
      {/* Node Card */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: stage.unlocked ? 1.03 : 1 }}
        whileTap={{ scale: stage.unlocked ? 0.95 : 1 }}
        className={`
          relative z-10 w-full rounded-[24px]
          flex flex-col items-center justify-center gap-3
          px-3 py-4
          transition-all duration-300
          ${stage.current
            ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(219,234,254,0.86))] shadow-[0_18px_40px_rgba(37,99,235,0.18)]'
            : stage.unlocked
            ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,245,249,0.72))] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(235,242,250,0.8))]'
            : 'bg-foreground/5'
          }
          ${stage.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
          border ${stage.current ? 'border-white/90' : 'border-white/25'}
        `}
        disabled={!stage.unlocked}
      >
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)]" />
        {stage.unlocked ? (
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/35 bg-[conic-gradient(from_130deg,rgba(255,255,255,0.82),rgba(148,163,184,0.28),rgba(37,99,235,0.18),rgba(255,255,255,0.7))]" />
            <div className="absolute inset-[18%] rounded-full border border-white/45 bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(226,232,240,0.82)_68%,rgba(148,163,184,0.26)_100%)]" />
            <span className="relative text-sm font-bold tracking-[0.25em] text-slate-700">{stage.mark}</span>
          </div>
        ) : (
          <Lock className="w-8 h-8 text-foreground/30" />
        )}

        {stage.current && (
          <motion.div
            className="absolute inset-0 rounded-[24px] border border-white/80"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {stage.unlocked && !stage.current && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="text-center">
          <div className={`text-sm font-semibold ${stage.current ? 'text-companion-primary' : stage.unlocked ? 'text-foreground' : 'text-foreground/40'}`}>
            {stage.name}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-foreground/55">
            {stage.descriptor}
          </div>
          <div className="mt-2 text-xs text-foreground/60">
            Nv. {stage.level}
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}
