/**
 * Care Streak Tracker
 * Displays daily care streak with visual calendar and rewards
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Calendar, Trophy, Star } from 'lucide-react'

export interface CareStreakProps {
  currentStreak: number
  longestStreak: number
  lastCareDate: string
  careHistory: string[] // Array of dates in ISO format
  onCareToday?: () => void
}

export const CareStreakTracker: React.FC<CareStreakProps> = ({
  currentStreak,
  longestStreak,
  lastCareDate,
  careHistory,
  onCareToday
}) => {
  const today = new Date().toDateString()
  const lastCare = new Date(lastCareDate).toDateString()
  const hasCareTod = lastCare === today

  // Get last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'from-navy-700 via-brand-600 to-slate-400'
    if (streak >= 30) return 'from-navy-700 via-brand-700 to-slate-500'
    if (streak >= 7) return 'from-navy-600 via-brand-600 to-slate-500'
    return 'from-navy-700 to-brand-700'
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 100) return <Flame className="w-20 h-20 text-white" />
    if (streak >= 30) return <Flame className="w-16 h-16 text-white" />
    if (streak >= 7) return <Flame className="w-12 h-12 text-white" />
    return <Star className="w-12 h-12 text-white" />
  }

  return (
    <div className="w-full">
      {/* Main Streak Display */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-6">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStreakColor(currentStreak)} opacity-90`} />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.div
            className="mb-4 flex justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getStreakIcon(currentStreak)}
          </motion.div>
          
          <h3 className="text-4xl font-bold text-white mb-2">
            {currentStreak} {currentStreak === 1 ? 'Dia' : 'Dias'} Seguidos
          </h3>
          
          <p className="text-white/90 text-lg mb-4">
            {hasCareTod ? "Você cuidou da sua presença de bordo hoje." : "Registre cuidado para manter sua sequência de leitura ativa."}
          </p>

          {!hasCareTod && onCareToday && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCareToday}
              className="px-6 py-3 bg-white text-gray-900 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Registrar cuidado
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-brand-500" />
            <span className="text-sm font-semibold text-foreground/60">Sequência Atual</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-semibold text-foreground/60">Maior Sequência</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{longestStreak}</div>
        </div>
      </div>

      {/* 7-Day Calendar */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-white/10 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-foreground/60" />
          <h4 className="font-semibold text-foreground">Últimos 7 Dias</h4>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0]
            const hasCare = careHistory.some(d => d.startsWith(dateStr))
            const isToday = date.toDateString() === today
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-foreground/60 mb-1">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </div>
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${hasCare
                      ? 'bg-gradient-to-br from-brand-500 to-navy-700 shadow-lg shadow-brand-500/35'
                      : 'bg-foreground/10'
                    }
                    ${isToday ? 'ring-2 ring-companion-primary ring-offset-2' : ''}
                  `}
                >
                  {hasCare ? (
                    <Star className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-foreground/30" />
                  )}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  {date.getDate()}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Milestones */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 border border-white/10">
        <h4 className="font-semibold text-foreground mb-4">Marcos de Sequência</h4>
        <StreakMilestone currentStreak={currentStreak} />
      </div>
    </div>
  )
}

const StreakMilestone: React.FC<{ currentStreak: number }> = ({ currentStreak }) => {
  const milestones = [
    { days: 7, name: 'Ritmo da Semana', reward: 'sinal reforçado' },
    { days: 30, name: 'Mestre do Mês', reward: 'leitura ampliada' },
    { days: 100, name: 'Constância de Elite', reward: 'presença rara' }
  ]

  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1]
  const progress = (currentStreak / nextMilestone.days) * 100

  return (
    <div>
      {milestones.map(milestone => (
        <div key={milestone.days} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStreak >= milestone.days ? 'bg-gradient-to-br from-sage-500 to-sage-700' : 'bg-gray-400'}`}>
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-medium text-foreground">{milestone.days} Dias</span>
                <div className="text-xs text-foreground/55">{milestone.name} · {milestone.reward}</div>
              </div>
            </div>
            {currentStreak >= milestone.days && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 font-semibold">
                Desbloqueado!
              </span>
            )}
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-navy-600 to-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
