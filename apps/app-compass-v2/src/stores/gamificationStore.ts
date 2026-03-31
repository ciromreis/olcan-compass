/**
 * @deprecated Legacy gamification store.
 * Use `@/stores/canonicalGamificationStore` (re-exports `eventDrivenGamificationStore.ts`) instead.
 *
 * Comprehensive Gamification Store
 * Manages achievements, rewards, streaks, and gamified features
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

// Types
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'companion' | 'guild' | 'marketplace' | 'social' | 'creation'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: {
    type: 'level' | 'xp' | 'activities' | 'guild_level' | 'evolutions' | 'videos'
    value: number
    description: string
  }[]
  rewards: {
    type: 'coins' | 'gems' | 'items' | 'abilities' | 'titles'
    value: number | string
    description: string
  }[]
  unlockedAt?: string
  progress: number
  isUnlocked: boolean
}

interface Streak {
  type: 'daily' | 'weekly' | 'monthly'
  current: number
  best: number
  lastActivity: string
  isActive: boolean
  multiplier: number
}

interface Reward {
  id: string
  type: 'coins' | 'gems' | 'item' | 'ability' | 'title' | 'badge'
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  value: number | string
  claimed: boolean
  claimedAt?: string
  expiresAt?: string
}

interface Leaderboard {
  id: string
  type: 'level' | 'xp' | 'guild_battles' | 'companion_care' | 'video_views'
  title: string
  description: string
  icon: string
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  entries: LeaderboardEntry[]
  userRank?: number
  userScore?: number
}

interface LeaderboardEntry {
  userId: number
  username: string
  companionName?: string
  guildName?: string
  score: number
  rank: number
  avatar?: string
}

interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  requirements: {
    type: string
    current: number
    target: number
    description: string
  }[]
  rewards: {
    type: string
    value: number | string
    description: string
  }[]
  progress: number
  isCompleted: boolean
  expiresAt?: string
  startedAt?: string
  completedAt?: string
}

interface GamificationState {
  // Achievements
  achievements: Achievement[]
  unlockedAchievements: string[]
  
  // Streaks
  streaks: Streak[]
  
  // Rewards
  availableRewards: Reward[]
  claimedRewards: Reward[]
  
  // Leaderboards
  leaderboards: Leaderboard[]
  
  // Quests
  activeQuests: Quest[]
  completedQuests: Quest[]
  
  // User stats
  totalPoints: number
  currentLevel: number
  title: string
  badges: string[]
  
  // Actions
  unlockAchievement: (achievementId: string) => void
  claimReward: (rewardId: string) => void
  updateStreak: (type: 'daily' | 'weekly' | 'monthly', isActive: boolean) => void
  completeQuest: (questId: string) => void
  addPoints: (points: number) => void
  checkAchievements: () => void
  refreshLeaderboards: () => void
  getAchievementsByCategory: (category: string) => Achievement[]
  getAvailableQuests: () => Quest[]
  
  // Computed
  getProgressPercentage: (achievementId: string) => number
  getTotalUnlockedAchievements: () => number
  getCurrentStreakMultiplier: () => number
  getRankInLeaderboard: (leaderboardId: string) => number
}

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_companion',
    title: 'First Steps',
    description: 'Create your first companion',
    icon: '🥚',
    category: 'companion',
    rarity: 'common',
    points: 10,
    requirements: [
      { type: 'level', value: 1, description: 'Reach level 1' }
    ],
    rewards: [
      { type: 'coins', value: 100, description: '100 coins' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'companion_level_10',
    title: 'Rising Star',
    description: 'Reach level 10 with your companion',
    icon: '⭐',
    category: 'companion',
    rarity: 'rare',
    points: 50,
    requirements: [
      { type: 'level', value: 10, description: 'Reach level 10' }
    ],
    rewards: [
      { type: 'coins', value: 500, description: '500 coins' },
      { type: 'gems', value: 5, description: '5 gems' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'companion_evolution_master',
    title: 'Evolution Master',
    description: 'Evolve your companion to master stage',
    icon: '🏆',
    category: 'companion',
    rarity: 'epic',
    points: 100,
    requirements: [
      { type: 'evolutions', value: 4, description: '4 evolutions completed' }
    ],
    rewards: [
      { type: 'coins', value: 2000, description: '2000 coins' },
      { type: 'gems', value: 20, description: '20 gems' },
      { type: 'titles', value: 'Evolution Master', description: 'Special title' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'guild_founder',
    title: 'Guild Founder',
    description: 'Create your first guild',
    icon: '🏰',
    category: 'guild',
    rarity: 'rare',
    points: 75,
    requirements: [
      { type: 'guild_level', value: 1, description: 'Create a guild' }
    ],
    rewards: [
      { type: 'coins', value: 1000, description: '1000 coins' },
      { type: 'gems', value: 10, description: '10 gems' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'marketplace_trader',
    title: 'Marketplace Trader',
    description: 'Complete 10 marketplace transactions',
    icon: '💰',
    category: 'marketplace',
    rarity: 'common',
    points: 25,
    requirements: [
      { type: 'activities', value: 10, description: '10 transactions' }
    ],
    rewards: [
      { type: 'coins', value: 300, description: '300 coins' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'video_creator',
    title: 'Video Creator',
    description: 'Create your first video',
    icon: '🎥',
    category: 'creation',
    rarity: 'common',
    points: 20,
    requirements: [
      { type: 'videos', value: 1, description: 'Create 1 video' }
    ],
    rewards: [
      { type: 'coins', value: 200, description: '200 coins' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Join 5 different guilds',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    points: 60,
    requirements: [
      { type: 'activities', value: 5, description: 'Join 5 guilds' }
    ],
    rewards: [
      { type: 'coins', value: 800, description: '800 coins' },
      { type: 'gems', value: 15, description: '15 gems' }
    ],
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'legendary_companion',
    title: 'Legendary Companion',
    description: 'Evolve your companion to legendary stage',
    icon: '👑',
    category: 'companion',
    rarity: 'legendary',
    points: 500,
    requirements: [
      { type: 'level', value: 50, description: 'Reach level 50' },
      { type: 'evolutions', value: 5, description: 'Complete all evolutions' }
    ],
    rewards: [
      { type: 'coins', value: 10000, description: '10000 coins' },
      { type: 'gems', value: 100, description: '100 gems' },
      { type: 'titles', value: 'Legendary Companion', description: 'Legendary title' },
      { type: 'abilities', value: 'legendary_ability', description: 'Legendary ability' }
    ],
    progress: 0,
    isUnlocked: false
  }
]

// Quest definitions
const DAILY_QUESTS: Quest[] = [
  {
    id: 'daily_care',
    title: 'Daily Companion Care',
    description: 'Care for your companion 3 times today',
    type: 'daily',
    difficulty: 'easy',
    requirements: [
      { type: 'activities', current: 0, target: 3, description: 'Care for companion' }
    ],
    rewards: [
      { type: 'coins', value: 50, description: '50 coins' }
    ],
    progress: 0,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'daily_social',
    title: 'Daily Social',
    description: 'Send 5 messages in guild chat',
    type: 'daily',
    difficulty: 'easy',
    requirements: [
      { type: 'activities', current: 0, target: 5, description: 'Send messages' }
    ],
    rewards: [
      { type: 'coins', value: 30, description: '30 coins' }
    ],
    progress: 0,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
]

// Store implementation
export const useGamificationStore = create<GamificationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        achievements: ACHIEVEMENTS,
        unlockedAchievements: [],
        streaks: [
          { type: 'daily', current: 0, best: 0, lastActivity: '', isActive: false, multiplier: 1.0 },
          { type: 'weekly', current: 0, best: 0, lastActivity: '', isActive: false, multiplier: 1.5 },
          { type: 'monthly', current: 0, best: 0, lastActivity: '', isActive: false, multiplier: 2.0 }
        ],
        availableRewards: [],
        claimedRewards: [],
        leaderboards: [],
        activeQuests: [],
        completedQuests: [],
        totalPoints: 0,
        currentLevel: 1,
        title: 'Adventurer',
        badges: [],
        
        // Actions
        unlockAchievement: (achievementId: string) => {
          const state = get()
          const achievement = state.achievements.find(a => a.id === achievementId)
          
          if (!achievement || achievement.isUnlocked) return
          
          // Unlock achievement
          const updatedAchievements = state.achievements.map(a => 
            a.id === achievementId ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a
          )
          
          // Add points
          const newPoints = state.totalPoints + achievement.points
          const newLevel = Math.floor(newPoints / 100) + 1
          
          set({
            achievements: updatedAchievements,
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
            totalPoints: newPoints,
            currentLevel: newLevel
          })
        },
        
        claimReward: (rewardId: string) => {
          const state = get()
          const reward = state.availableRewards.find(r => r.id === rewardId)
          
          if (!reward || reward.claimed) return
          
          // Mark as claimed
          const updatedRewards = state.availableRewards.map(r => 
            r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r
          )
          
          set({
            availableRewards: updatedRewards,
            claimedRewards: [...state.claimedRewards, reward]
          })
        },
        
        updateStreak: (type: 'daily' | 'weekly' | 'monthly', isActive: boolean) => {
          const state = get()
          const streak = state.streaks.find(s => s.type === type)
          
          if (!streak) return
          
          const updatedStreaks = state.streaks.map(s => 
            s.type === type ? { ...s, isActive, lastActivity: new Date().toISOString() } : s
          )
          
          set({ streaks: updatedStreaks })
        },
        
        completeQuest: (questId: string) => {
          const state = get()
          const quest = state.activeQuests.find(q => q.id === questId)
          
          if (!quest || quest.isCompleted) return
          
          // Mark as completed
          const updatedQuests = state.activeQuests.map(q => 
            q.id === questId ? { ...q, isCompleted: true, completedAt: new Date().toISOString() } : q
          )
          
          set({
            activeQuests: updatedQuests,
            completedQuests: [...state.completedQuests, quest]
          })
        },
        
        addPoints: (points: number) => {
          const state = get()
          const multiplier = state.getCurrentStreakMultiplier()
          const finalPoints = Math.floor(points * multiplier)
          const newTotalPoints = state.totalPoints + finalPoints
          const newLevel = Math.floor(newTotalPoints / 100) + 1
          
          set({
            totalPoints: newTotalPoints,
            currentLevel: newLevel
          })
          
          // Check for new achievements
          get().checkAchievements()
        },
        
        checkAchievements: () => {
          const state = get()
          
          // Check each achievement
          state.achievements.forEach(achievement => {
            if (achievement.isUnlocked) return
            
            // Check requirements (simplified for example)
            const requirementsMet = achievement.requirements.every(req => {
              // This would check against actual user data
              // For now, we'll simulate some checks
              if (req.type === 'level' && state.currentLevel >= req.value) return true
              if (req.type === 'xp' && state.totalPoints >= req.value * 100) return true
              return false
            })
            
            if (requirementsMet) {
              get().unlockAchievement(achievement.id)
            }
          })
        },
        
        refreshLeaderboards: () => {
          // This would fetch latest leaderboard data from API
          set({ leaderboards: [] })
        },
        
        getAchievementsByCategory: (category: string) => {
          const state = get()
          return state.achievements.filter(a => a.category === category)
        },
        
        getAvailableQuests: () => {
          const state = get()
          const now = new Date()
          
          return DAILY_QUESTS.filter(quest => {
            const expiresAt = new Date(quest.expiresAt || '')
            return expiresAt > now && !state.completedQuests.includes(quest.id)
          })
        },
        
        // Computed
        getProgressPercentage: (achievementId: string) => {
          const state = get()
          const achievement = state.achievements.find(a => a.id === achievementId)
          
          if (!achievement) return 0
          
          // Calculate progress based on requirements
          const totalRequirements = achievement.requirements.length
          const metRequirements = achievement.requirements.filter(req => {
            // This would check against actual user data
            if (req.type === 'level' && state.currentLevel >= req.value) return true
            if (req.type === 'xp' && state.totalPoints >= req.value * 100) return true
            return false
          }).length
          
          return totalRequirements > 0 ? (metRequirements / totalRequirements) * 100 : 0
        },
        
        getTotalUnlockedAchievements: () => {
          return get().unlockedAchievements.length
        },
        
        getCurrentStreakMultiplier: () => {
          const state = get()
          const activeStreaks = state.streaks.filter(s => s.isActive)
          
          if (activeStreaks.length === 0) return 1.0
          
          return Math.max(...activeStreaks.map(s => s.multiplier))
        },
        
        getRankInLeaderboard: (leaderboardId: string) => {
          const state = get()
          const leaderboard = state.leaderboards.find(l => l.id === leaderboardId)
          
          return leaderboard?.userRank || -1
        }
      }),
      {
        name: 'gamification-store',
        partialize: (state) => ({
          unlockedAchievements: state.unlockedAchievements,
          streaks: state.streaks,
          totalPoints: state.totalPoints,
          currentLevel: state.currentLevel,
          title: state.title,
          badges: state.badges
        })
      }
    ),
    {
      name: 'gamification-store'
    }
  )
)

// Hooks for easier usage
export const useGamification = () => useGamificationStore()
export const useGamificationActions = () => useGamificationStore(state => state)

// Utility functions
export const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'text-gray-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500'
  }
  return colors[rarity as keyof typeof colors] || colors.common
}

export const getRarityBgColor = (rarity: string) => {
  const colors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  }
  return colors[rarity as keyof typeof colors] || colors.common
}

export const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-orange-500',
    legendary: 'text-red-500'
  }
  return colors[difficulty as keyof typeof colors] || colors.easy
}

export const getQuestIcon = (type: string) => {
  const icons = {
    daily: '📅',
    weekly: '📆',
    monthly: '📅',
    special: '⭐'
  }
  return icons[type as keyof typeof icons] || icons.daily
}

export const formatPoints = (points: number) => {
  return new Intl.NumberFormat('en-US').format(points)
}

export const getLevelTitle = (level: number) => {
  const titles = [
    'Novice', 'Apprentice', 'Adventurer', 'Explorer', 'Champion',
    'Master', 'Legend', 'Mythic', 'Epic', 'Legendary'
  ]
  
  const index = Math.min(Math.floor((level - 1) / 5), titles.length - 1)
  return titles[index] || 'Novice'
}

export const getNextLevelPoints = (currentLevel: number) => {
  return currentLevel * 100
}

export const getLevelProgress = (currentPoints: number, currentLevel: number) => {
  const levelStartPoints = (currentLevel - 1) * 100
  const levelEndPoints = currentLevel * 100
  const progress = currentPoints - levelStartPoints
  const total = levelEndPoints - levelStartPoints
  
  return total > 0 ? (progress / total) * 100 : 0
}
