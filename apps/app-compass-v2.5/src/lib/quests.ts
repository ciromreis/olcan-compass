/**
 * Quest System
 * Daily, weekly, and special quest definitions
 */

export type QuestType = 'daily' | 'weekly' | 'special'
export type QuestCategory = 'care' | 'career' | 'social' | 'achievement' | 'exploration'

export interface QuestRequirement {
  type: 'care_activity' | 'level_up' | 'evolution' | 'achievement' | 'application' | 'interview' | 'streak' | 'ability_unlock'
  target: number
  current?: number
}

export interface QuestReward {
  xp: number
  items?: string[]
  currency?: number
  title?: string
}

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  category: QuestCategory
  requirement: QuestRequirement
  reward: QuestReward
  expiresAt?: string
  completed: boolean
  claimedAt?: string
}

// Daily Quests - Reset every 24 hours
export const DAILY_QUESTS: Omit<Quest, 'id' | 'completed' | 'expiresAt'>[] = [
  {
    title: 'Daily Care Routine',
    description: 'Complete 3 care activities with your companion',
    type: 'daily',
    category: 'care',
    requirement: {
      type: 'care_activity',
      target: 3,
      current: 0
    },
    reward: {
      xp: 50,
      items: ['energy_potion']
    }
  },
  {
    title: 'Streak Keeper',
    description: 'Maintain your daily care streak',
    type: 'daily',
    category: 'care',
    requirement: {
      type: 'streak',
      target: 1,
      current: 0
    },
    reward: {
      xp: 30
    }
  },
  {
    title: 'Career Progress',
    description: 'Create or update 1 job application',
    type: 'daily',
    category: 'career',
    requirement: {
      type: 'application',
      target: 1,
      current: 0
    },
    reward: {
      xp: 75,
      currency: 10
    }
  },
  {
    title: 'Achievement Hunter',
    description: 'Unlock 1 achievement',
    type: 'daily',
    category: 'achievement',
    requirement: {
      type: 'achievement',
      target: 1,
      current: 0
    },
    reward: {
      xp: 100
    }
  }
]

// Weekly Quests - Reset every 7 days
export const WEEKLY_QUESTS: Omit<Quest, 'id' | 'completed' | 'expiresAt'>[] = [
  {
    title: 'Dedicated Caretaker',
    description: 'Complete care activities 7 days in a row',
    type: 'weekly',
    category: 'care',
    requirement: {
      type: 'streak',
      target: 7,
      current: 0
    },
    reward: {
      xp: 500,
      items: ['rare_evolution_stone'],
      title: 'Dedicated Caretaker'
    }
  },
  {
    title: 'Evolution Master',
    description: 'Evolve your companion to the next stage',
    type: 'weekly',
    category: 'care',
    requirement: {
      type: 'evolution',
      target: 1,
      current: 0
    },
    reward: {
      xp: 1000,
      currency: 100
    }
  },
  {
    title: 'Career Momentum',
    description: 'Submit 5 job applications',
    type: 'weekly',
    category: 'career',
    requirement: {
      type: 'application',
      target: 5,
      current: 0
    },
    reward: {
      xp: 750,
      currency: 50
    }
  },
  {
    title: 'Interview Champion',
    description: 'Complete 3 interview practice sessions',
    type: 'weekly',
    category: 'career',
    requirement: {
      type: 'interview',
      target: 3,
      current: 0
    },
    reward: {
      xp: 600,
      items: ['confidence_boost']
    }
  },
  {
    title: 'Level Up!',
    description: 'Gain 3 levels with your companion',
    type: 'weekly',
    category: 'care',
    requirement: {
      type: 'level_up',
      target: 3,
      current: 0
    },
    reward: {
      xp: 800,
      items: ['skill_book']
    }
  }
]

// Special Quests - Limited time events
export const SPECIAL_QUESTS: Omit<Quest, 'id' | 'completed' | 'expiresAt'>[] = [
  {
    title: 'New Companion Celebration',
    description: 'Welcome your first companion!',
    type: 'special',
    category: 'care',
    requirement: {
      type: 'care_activity',
      target: 1,
      current: 0
    },
    reward: {
      xp: 200,
      items: ['starter_pack'],
      currency: 50
    }
  },
  {
    title: 'First Evolution',
    description: 'Witness your companion\'s first evolution',
    type: 'special',
    category: 'care',
    requirement: {
      type: 'evolution',
      target: 1,
      current: 0
    },
    reward: {
      xp: 500,
      items: ['evolution_certificate'],
      title: 'Evolution Witness'
    }
  }
]

// Helper Functions
export function generateDailyQuests(): Quest[] {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return DAILY_QUESTS.map((quest, index) => ({
    ...quest,
    id: `daily_${today.toISOString().split('T')[0]}_${index}`,
    completed: false,
    expiresAt: tomorrow.toISOString()
  }))
}

export function generateWeeklyQuests(): Quest[] {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(0, 0, 0, 0)

  return WEEKLY_QUESTS.map((quest, index) => ({
    ...quest,
    id: `weekly_${getWeekNumber(today)}_${index}`,
    completed: false,
    expiresAt: nextWeek.toISOString()
  }))
}

export function getActiveQuests(userQuests: Quest[]): Quest[] {
  const now = new Date()
  return userQuests.filter(quest => {
    if (!quest.expiresAt) return true
    return new Date(quest.expiresAt) > now
  })
}

export function updateQuestProgress(
  quest: Quest,
  userStats: Record<string, number>
): Quest {
  const statMap: Record<string, string> = {
    care_activity: 'total_care_activities',
    level_up: 'reach_level',
    evolution: 'evolve_companion',
    achievement: 'create_companion', // This would need proper achievement counting
    application: 'total_applications',
    interview: 'complete_interview',
    streak: 'care_streak',
    ability_unlock: 'create_companion' // This would need proper ability counting
  }

  const statKey = statMap[quest.requirement.type]
  const current = userStats[statKey] || 0

  return {
    ...quest,
    requirement: {
      ...quest.requirement,
      current
    },
    completed: current >= quest.requirement.target
  }
}

export function getQuestProgress(quest: Quest): number {
  return Math.min((quest.requirement.current || 0) / quest.requirement.target, 1) * 100
}

export function canClaimQuest(quest: Quest): boolean {
  return quest.completed && !quest.claimedAt
}

export function getQuestsByCategory(quests: Quest[], category: QuestCategory): Quest[] {
  return quests.filter(q => q.category === category)
}

export function getQuestsByType(quests: Quest[], type: QuestType): Quest[] {
  return quests.filter(q => q.type === type)
}

// Utility function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Quest completion rewards
export function calculateQuestRewards(quests: Quest[]): {
  totalXP: number
  totalCurrency: number
  items: string[]
  titles: string[]
} {
  return quests.reduce(
    (acc, quest) => {
      if (quest.completed && quest.claimedAt) {
        acc.totalXP += quest.reward.xp
        acc.totalCurrency += quest.reward.currency || 0
        if (quest.reward.items) {
          acc.items.push(...quest.reward.items)
        }
        if (quest.reward.title) {
          acc.titles.push(quest.reward.title)
        }
      }
      return acc
    },
    { totalXP: 0, totalCurrency: 0, items: [] as string[], titles: [] as string[] }
  )
}
