/**
 * Leaderboard System
 * Rankings and competitive features
 */

export type LeaderboardType = 'level' | 'streak' | 'achievements' | 'xp' | 'evolution'
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time'

export interface LeaderboardEntry {
  userId: string
  username: string
  companionName: string
  archetype: string
  value: number
  rank: number
  avatar?: string
  badge?: string
}

export interface Leaderboard {
  type: LeaderboardType
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  userRank?: number
  totalEntries: number
}

export const LEADERBOARD_CONFIGS = {
  level: {
    title: 'Top Levels',
    description: 'Highest companion levels',
    icon: '📈',
    valueLabel: 'Level'
  },
  streak: {
    title: 'Care Streaks',
    description: 'Longest daily care streaks',
    icon: '🔥',
    valueLabel: 'Days'
  },
  achievements: {
    title: 'Achievement Hunters',
    description: 'Most achievements unlocked',
    icon: '🏆',
    valueLabel: 'Achievements'
  },
  xp: {
    title: 'Total XP',
    description: 'Highest total experience',
    icon: '⭐',
    valueLabel: 'XP'
  },
  evolution: {
    title: 'Evolution Masters',
    description: 'Highest evolution stages',
    icon: '💎',
    valueLabel: 'Stage'
  }
}

export function getLeaderboardTitle(type: LeaderboardType, period: LeaderboardPeriod): string {
  const config = LEADERBOARD_CONFIGS[type]
  const periodLabel = period === 'all_time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)
  return `${config.title} - ${periodLabel}`
}

export function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  if (rank <= 10) return '🏅'
  if (rank <= 100) return '⭐'
  return ''
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'from-slate-500 to-slate-500'
  if (rank === 2) return 'from-gray-400 to-gray-600'
  if (rank === 3) return 'from-slate-700 to-slate-900'
  if (rank <= 10) return 'from-purple-500 to-pink-500'
  return 'from-blue-500 to-cyan-500'
}
