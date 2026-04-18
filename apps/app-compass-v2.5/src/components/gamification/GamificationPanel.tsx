'use client'

import { useTaskStore } from '@/stores/taskStore'
import { Award } from 'lucide-react'

export function GamificationPanel() {
  const { progress, userAchievements } = useTaskStore()

  if (!progress) return null

  return (
    <div className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Progresso</h3>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total" value={progress.tasks_completed_total} />
        <Stat label="Semana" value={progress.tasks_completed_this_week} />
        <Stat label="Hoje" value={progress.tasks_completed_today} />
        <Stat label="Sequencia" value={`${progress.streak_current}d`} />
      </div>

      {userAchievements.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-3">Conquistas recentes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {userAchievements.slice(0, 4).map((ua) => (
              <div key={ua.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
                <Award className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{ua.achievement.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{ua.achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}
