'use client'

import { useState, useEffect } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import {
  TrophyIcon,
  LockIcon,
  CheckIcon,
  StarIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  category: string
  xp_reward: number
  icon: string
  requirement: number
  is_unlocked: boolean
  unlocked_at?: string
  progress?: number
}

type ViewMode = 'grid' | 'list'
type FilterCategory = 'ALL' | 'FIRST_STEPS' | 'CONSISTENCY' | 'MASTERY' | 'SOCIAL' | 'SPEED' | 'SPECIAL'

interface MergedAchievement {
  id: string
  code: string
  name: string
  description: string
  category: string
  xp_reward: number
  icon: string
  requirement: number
  is_unlocked: boolean
  unlocked_at?: string
  progress?: number
}

const categoryLabels: Record<string, string> = {
  FIRST_STEPS: 'Primeiros passos',
  CONSISTENCY: 'Consistencia',
  MASTERY: 'Dominio',
  SOCIAL: 'Social',
  SPEED: 'Velocidade',
  SPECIAL: 'Especial',
}

const categoryColors: Record<string, string> = {
  FIRST_STEPS: 'bg-blue-100 text-blue-800 border-blue-300',
  CONSISTENCY: 'bg-slate-100 text-slate-800 border-slate-300',
  MASTERY: 'bg-purple-100 text-purple-800 border-purple-300',
  SOCIAL: 'bg-green-100 text-green-800 border-green-300',
  SPEED: 'bg-slate-100 text-slate-800 border-slate-300',
  SPECIAL: 'bg-pink-100 text-pink-800 border-pink-300',
}

export function AchievementGallery() {
  const { achievements, fetchAchievements, userAchievements } = useTaskStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  // Merge achievements with user progress
  const mergedAchievements: MergedAchievement[] = achievements.map((achievement) => {
    const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id)
    return {
      id: achievement.id,
      code: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      xp_reward: achievement.xp_bonus,
      icon: achievement.icon,
      requirement: (achievement.unlock_condition?.count as number) || 1,
      is_unlocked: !!userAchievement,
      unlocked_at: userAchievement?.unlocked_at,
      progress: userAchievement?.progress || 0,
    }
  })

  // Filter achievements
  const filteredAchievements = mergedAchievements.filter((achievement) => {
    if (showOnlyUnlocked && !achievement.is_unlocked) return false
    if (filterCategory !== 'ALL' && achievement.category !== filterCategory) return false
    return true
  })

  // Statistics
  const totalUnlocked = mergedAchievements.filter((a) => a.is_unlocked).length
  const totalAchievements = mergedAchievements.length
  const totalXPEarned = mergedAchievements
    .filter((a) => a.is_unlocked)
    .reduce((sum, a) => sum + a.xp_reward, 0)

  const categories: FilterCategory[] = ['ALL', 'FIRST_STEPS', 'CONSISTENCY', 'MASTERY', 'SOCIAL', 'SPEED', 'SPECIAL']

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Conquistas</h2>
              <p className="text-sm text-slate-500">
                {totalUnlocked} / {totalAchievements} desbloqueadas
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Progresso geral</span>
            <span className="font-semibold text-gray-900">
              {Math.round((totalUnlocked / totalAchievements) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-500"
              style={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'ALL' ? 'Todas' : categoryLabels[category] || category}
                </button>
              ))}
            </div>
          </div>

          {/* Unlocked Filter */}
          <button
            onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              showOnlyUnlocked
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckIcon className="w-3 h-3" />
            Desbloqueadas
          </button>
        </div>
      </div>

      {/* Achievement List */}
      <div className="p-6">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <LockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Nenhuma conquista encontrada</p>
            <p className="text-slate-400 text-sm mt-2">Ajuste seus filtros</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAchievements.map((achievement) => (
              <AchievementListItem key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Grid Card View
function AchievementCard({ achievement }: { achievement: MergedAchievement }) {
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        achievement.is_unlocked
          ? 'border-slate-400 bg-gradient-to-br from-slate-50 to-slate-50'
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      {/* Unlocked Badge */}
      {achievement.is_unlocked && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-3">{achievement.icon}</div>

      {/* Category Badge */}
      <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium border mb-2 ${categoryColors[achievement.category]}`}>
        {categoryLabels[achievement.category] || achievement.category}
      </div>

      {/* Name & Description */}
      <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>

      {/* XP Reward */}
      <div className="flex items-center gap-1 mb-3">
        <StarIcon className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">+{achievement.xp_reward} XP</span>
      </div>

      {/* Progress or Unlocked Date */}
      {achievement.is_unlocked ? (
        <div className="text-xs text-gray-500">
          Desbloqueada em {format(new Date(achievement.unlocked_at!), "d 'de' MMM, yyyy", { locale: ptBR })}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progresso</span>
            <span>{achievement.progress || 0} / {achievement.requirement}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((achievement.progress || 0) / achievement.requirement) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Lock Overlay */}
      {!achievement.is_unlocked && (
        <div className="absolute inset-0 bg-gray-900/5 rounded-xl flex items-center justify-center">
          <LockIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  )
}

// List View
function AchievementListItem({ achievement }: { achievement: MergedAchievement }) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${
        achievement.is_unlocked
          ? 'border-slate-300 bg-gradient-to-r from-slate-50 to-slate-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Icon */}
      <div className="text-3xl flex-shrink-0">{achievement.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900">{achievement.name}</h3>
          {achievement.is_unlocked && (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-1">{achievement.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${categoryColors[achievement.category]}`}>
            {categoryLabels[achievement.category] || achievement.category}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <StarIcon className="w-3 h-3 text-slate-500" />
            <span className="font-semibold text-slate-700">+{achievement.xp_reward} XP</span>
          </div>
        </div>
      </div>

      {/* Progress or Date */}
      <div className="flex-shrink-0 text-right">
        {achievement.is_unlocked ? (
          <div className="text-xs text-gray-500">
            {format(new Date(achievement.unlocked_at!), "d 'de' MMM, yyyy", { locale: ptBR })}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xs text-gray-500">
              {achievement.progress || 0} / {achievement.requirement}
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(((achievement.progress || 0) / achievement.requirement) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lock Icon */}
      {!achievement.is_unlocked && (
        <LockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </div>
  )
}
