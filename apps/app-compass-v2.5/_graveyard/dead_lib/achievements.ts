/**
 * Achievement System for v2.5 Gamification
 * Tracks user progress and unlocks rewards
 */

export type AchievementCategory = 
  | 'aura'
  | 'evolution'
  | 'care'
  | 'social'
  | 'career'
  | 'milestone'

export type AchievementRarity = 
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  icon: string
  requirement: {
    type: string
    target: number
    current?: number
  }
  reward: {
    xp?: number
    items?: string[]
    title?: string
  }
  unlocked: boolean
  unlockedAt?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // Aura Achievements
  {
    id: 'first_aura',
    name: 'First Aura',
    description: 'Discovered and created your first career aura',
    category: 'aura',
    rarity: 'common',
    icon: '🐣',
    requirement: { type: 'create_aura', target: 1 },
    reward: { xp: 100 },
    unlocked: false
  },
  {
    id: 'aura_namer',
    name: 'Aura Namer',
    description: 'Gave your aura a unique name',
    category: 'aura',
    rarity: 'common',
    icon: '✏️',
    requirement: { type: 'name_aura', target: 1 },
    reward: { xp: 50 },
    unlocked: false
  },
  
  // Evolution Achievements
  {
    id: 'first_evolution',
    name: 'First Evolution',
    description: 'Evolved your aura for the first time',
    category: 'evolution',
    rarity: 'rare',
    icon: '⚡',
    requirement: { type: 'evolve_aura', target: 1 },
    reward: { xp: 500 },
    unlocked: false
  },
  {
    id: 'young_stage',
    name: 'Coming of Age',
    description: 'Evolved your aura to Young stage',
    category: 'evolution',
    rarity: 'rare',
    icon: '🌱',
    requirement: { type: 'reach_stage_young', target: 1 },
    reward: { xp: 750 },
    unlocked: false
  },
  {
    id: 'mature_stage',
    name: 'Fully Matured',
    description: 'Evolved your aura to Mature stage',
    category: 'evolution',
    rarity: 'epic',
    icon: '🌟',
    requirement: { type: 'reach_stage_mature', target: 1 },
    reward: { xp: 1500 },
    unlocked: false
  },
  {
    id: 'master_stage',
    name: 'Master Presence',
    description: 'Evolved your aura to Master stage',
    category: 'evolution',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'reach_stage_master', target: 1 },
    reward: { xp: 3000 },
    unlocked: false
  },
  {
    id: 'legendary_stage',
    name: 'Legendary Bond',
    description: 'Achieved the legendary evolution stage',
    category: 'evolution',
    rarity: 'legendary',
    icon: '💎',
    requirement: { type: 'reach_stage_legendary', target: 1 },
    reward: { xp: 10000, title: 'Legendary Presence' },
    unlocked: false
  },
  
  // Care Achievements
  {
    id: 'first_care',
    name: 'First Care',
    description: 'Performed your first care activity',
    category: 'care',
    rarity: 'common',
    icon: '❤️',
    requirement: { type: 'care_activity', target: 1 },
    reward: { xp: 50 },
    unlocked: false
  },
  {
    id: 'daily_care_streak_7',
    name: 'Week of Care',
    description: 'Maintained a 7-day care streak',
    category: 'care',
    rarity: 'rare',
    icon: '🔥',
    requirement: { type: 'care_streak', target: 7 },
    reward: { xp: 500 },
    unlocked: false
  },
  {
    id: 'daily_care_streak_30',
    name: 'Month of Dedication',
    description: 'Maintained a 30-day care streak',
    category: 'care',
    rarity: 'epic',
    icon: '🔥🔥',
    requirement: { type: 'care_streak', target: 30 },
    reward: { xp: 2000 },
    unlocked: false
  },
  {
    id: 'daily_care_streak_100',
    name: 'Unwavering Commitment',
    description: 'Maintained a 100-day care streak',
    category: 'care',
    rarity: 'legendary',
    icon: '🔥🔥🔥',
    requirement: { type: 'care_streak', target: 100 },
    reward: { xp: 10000, title: 'Dedicated Caretaker' },
    unlocked: false
  },
  {
    id: 'care_activities_100',
    name: 'Caring Soul',
    description: 'Performed 100 care activities',
    category: 'care',
    rarity: 'rare',
    icon: '💝',
    requirement: { type: 'total_care_activities', target: 100 },
    reward: { xp: 1000 },
    unlocked: false
  },
  
  // Level Achievements
  {
    id: 'level_10',
    name: 'Experienced Guide',
    description: 'Reached level 10 with your aura',
    category: 'aura',
    rarity: 'rare',
    icon: '⭐',
    requirement: { type: 'reach_level', target: 10 },
    reward: { xp: 500 },
    unlocked: false
  },
  {
    id: 'level_25',
    name: 'Veteran Guide',
    description: 'Reached level 25 with your aura',
    category: 'aura',
    rarity: 'epic',
    icon: '⭐⭐',
    requirement: { type: 'reach_level', target: 25 },
    reward: { xp: 1500 },
    unlocked: false
  },
  {
    id: 'level_50',
    name: 'Elite Presence',
    description: 'Reached level 50 with your aura',
    category: 'aura',
    rarity: 'legendary',
    icon: '⭐⭐⭐',
    requirement: { type: 'reach_level', target: 50 },
    reward: { xp: 5000, title: 'Elite Presence' },
    unlocked: false
  },
  
  // Career Achievements
  {
    id: 'first_application',
    name: 'Taking Action',
    description: 'Started your first application',
    category: 'career',
    rarity: 'common',
    icon: '📝',
    requirement: { type: 'create_application', target: 1 },
    reward: { xp: 100 },
    unlocked: false
  },
  {
    id: 'applications_10',
    name: 'Persistent Applicant',
    description: 'Created 10 applications',
    category: 'career',
    rarity: 'rare',
    icon: '📋',
    requirement: { type: 'total_applications', target: 10 },
    reward: { xp: 1000 },
    unlocked: false
  },
  {
    id: 'first_interview',
    name: 'Interview Ready',
    description: 'Completed your first interview simulation',
    category: 'career',
    rarity: 'rare',
    icon: '🎤',
    requirement: { type: 'complete_interview', target: 1 },
    reward: { xp: 300 },
    unlocked: false
  },
  
  // Milestone Achievements
  {
    id: 'profile_complete',
    name: 'Profile Perfectionist',
    description: 'Completed your profile 100%',
    category: 'milestone',
    rarity: 'common',
    icon: '✅',
    requirement: { type: 'profile_completion', target: 100 },
    reward: { xp: 200 },
    unlocked: false
  },
  {
    id: 'first_week',
    name: 'Week One Complete',
    description: 'Completed your first week on Olcan Compass',
    category: 'milestone',
    rarity: 'common',
    icon: '📅',
    requirement: { type: 'days_active', target: 7 },
    reward: { xp: 300 },
    unlocked: false
  },
  {
    id: 'first_month',
    name: 'Month One Complete',
    description: 'Completed your first month on Olcan Compass',
    category: 'milestone',
    rarity: 'rare',
    icon: '📆',
    requirement: { type: 'days_active', target: 30 },
    reward: { xp: 1000 },
    unlocked: false
  }
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity)
}

export function checkAchievementProgress(
  achievement: Achievement,
  userStats: Record<string, number>
): Achievement {
  const current = userStats[achievement.requirement.type] || 0
  const unlocked = current >= achievement.requirement.target
  
  return {
    ...achievement,
    requirement: {
      ...achievement.requirement,
      current
    },
    unlocked,
    unlockedAt: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedAt
  }
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400'
    case 'rare':
      return 'text-blue-400'
    case 'epic':
      return 'text-purple-400'
    case 'legendary':
      return 'text-slate-400'
  }
}

export function getRarityGradient(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return 'from-gray-500 to-gray-700'
    case 'rare':
      return 'from-blue-500 to-blue-700'
    case 'epic':
      return 'from-purple-500 to-purple-700'
    case 'legendary':
      return 'from-slate-500 to-slate-600'
  }
}
