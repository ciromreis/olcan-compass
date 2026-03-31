/**
 * Event-Driven Gamification Store - v2.5
 * 
 * This store implements gamification as a REACTION to real user outcomes,
 * not as isolated game mechanics. It subscribes to domain events and
 * translates them into achievements, quests, streaks, and rewards.
 * 
 * Core Principle:
 * - Gamification reinforces PRODUCT VALUE, not entertainment
 * - XP comes from meaningful actions (route selection, document completion)
 * - Achievements celebrate real milestones (first booking, interview success)
 * - Streaks reflect consistent product engagement, not just daily logins
 * 
 * Architecture:
 * - Subscribes to companion events via onCompanionEvent()
 * - Subscribes to product events (routes, execution, marketplace)
 * - Maintains user progress state (XP, level, achievements, quests)
 * - Emits gamification events for UI celebrations
 * 
 * DO NOT add gamification logic to other stores. Extend this one.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CompanionEvent } from './canonicalCompanionStore'

// ============================================================================
// TYPES - Achievement and Quest System
// ============================================================================

export type AchievementCategory = 
  | 'progression'      // Level up, evolution
  | 'companion'        // Care, bonding
  | 'execution'        // Documents, interviews, applications
  | 'marketplace'      // Bookings, transactions
  | 'social'           // Guilds, battles, friends
  | 'engagement'       // Streaks, consistency

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  icon: string
  xpReward: number
  
  // Unlock conditions
  requirementType: 'count' | 'streak' | 'milestone' | 'one_time'
  requirementTarget: number
  requirementKey: string  // e.g., 'care_activity', 'document_created'
  
  // State
  isUnlocked: boolean
  unlockedAt: string | null
  progress: number  // Current progress toward target
}

export type QuestType = 'daily' | 'weekly' | 'special' | 'event'
export type QuestStatus = 'active' | 'completed' | 'claimed' | 'expired'

export interface Quest {
  id: string
  name: string
  description: string
  type: QuestType
  category: AchievementCategory
  
  // Requirements
  requirementKey: string
  requirementTarget: number
  
  // Rewards
  xpReward: number
  coinReward?: number
  itemReward?: string  // Item ID
  
  // Timing
  startDate: string
  endDate: string | null
  expiresAt: string | null
  
  // State
  status: QuestStatus
  progress: number
  completedAt: string | null
  claimedAt: string | null
}

export interface Streak {
  type: 'daily_care' | 'weekly_engagement' | 'execution_consistency'
  currentCount: number
  bestCount: number
  lastActivityAt: string | null
  multiplier: number  // XP multiplier based on streak
}

export interface UserProgress {
  totalXP: number
  level: number
  xpToNextLevel: number
  totalCoins: number
  title: string
  titles: string[]  // Unlocked titles
  joinDate: string
  daysActive: number
}

// ============================================================================
// EVENT TYPES - Gamification Events (for UI celebrations)
// ============================================================================

export interface GamificationEvent {
  type: GamificationEventType
  timestamp: string
  payload: Record<string, unknown>
}

export type GamificationEventType =
  | 'achievement.unlocked'
  | 'achievement.progress'
  | 'quest.completed'
  | 'quest.claimed'
  | 'level.up'
  | 'streak.updated'
  | 'reward.received'
  | 'title.unlocked'

// ============================================================================
// EVENT EMITTER
// ============================================================================

class GamificationEventEmitter {
  private listeners: Set<(event: GamificationEvent) => void> = new Set()
  
  emit(event: GamificationEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in gamification event listener:', error)
      }
    })
  }
  
  subscribe(callback: (event: GamificationEvent) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
}

const eventEmitter = new GamificationEventEmitter()

// ============================================================================
// CANONICAL ACHIEVEMENT DEFINITIONS
// ============================================================================

export const CANONICAL_ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress'>[] = [
  // Progression Achievements
  {
    id: 'first_companion',
    name: 'First Steps',
    description: 'Hatch your first companion',
    category: 'progression',
    rarity: 'common',
    icon: '🥚',
    xpReward: 100,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'companion.created',
  },
  {
    id: 'first_evolution',
    name: 'Growing Up',
    description: 'Evolve your companion for the first time',
    category: 'progression',
    rarity: 'common',
    icon: '🌱',
    xpReward: 250,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'companion.evolved',
  },
  {
    id: 'max_level_sprout',
    name: 'Sprout Master',
    description: 'Reach the maximum level for a Sprout companion',
    category: 'progression',
    rarity: 'rare',
    icon: '🌿',
    xpReward: 500,
    requirementType: 'milestone',
    requirementTarget: 10,  // Level 10
    requirementKey: 'companion.level.sprout',
  },
  {
    id: 'legendary_companion',
    name: 'Legendary Bond',
    description: 'Evolve a companion to Legendary stage',
    category: 'progression',
    rarity: 'legendary',
    icon: '👑',
    xpReward: 5000,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'companion.stage.legendary',
  },
  
  // Companion Care Achievements
  {
    id: 'first_care',
    name: 'Caring Heart',
    description: 'Perform your first care activity',
    category: 'companion',
    rarity: 'common',
    icon: '❤️',
    xpReward: 50,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'companion.cared',
  },
  {
    id: 'care_streak_7',
    name: 'Week of Care',
    description: 'Maintain a 7-day care streak',
    category: 'companion',
    rarity: 'rare',
    icon: '📅',
    xpReward: 300,
    requirementType: 'streak',
    requirementTarget: 7,
    requirementKey: 'companion.care_streak',
  },
  {
    id: 'care_streak_30',
    name: 'Dedicated Guardian',
    description: 'Maintain a 30-day care streak',
    category: 'companion',
    rarity: 'epic',
    icon: '🏆',
    xpReward: 1000,
    requirementType: 'streak',
    requirementTarget: 30,
    requirementKey: 'companion.care_streak',
  },
  {
    id: 'all_activities',
    name: 'Well-Rounded',
    description: 'Perform all 6 types of care activities',
    category: 'companion',
    rarity: 'rare',
    icon: '🎭',
    xpReward: 200,
    requirementType: 'count',
    requirementTarget: 6,
    requirementKey: 'companion.activity_type.unique',
  },
  
  // Execution Achievements (Product Value)
  {
    id: 'first_document',
    name: 'Document Ready',
    description: 'Create your first document in the Forge',
    category: 'execution',
    rarity: 'common',
    icon: '📄',
    xpReward: 150,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'document.created',
  },
  {
    id: 'first_interview',
    name: 'Practice Makes Perfect',
    description: 'Complete your first interview practice session',
    category: 'execution',
    rarity: 'common',
    icon: '🎤',
    xpReward: 200,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'interview.completed',
  },
  {
    id: 'first_application',
    name: 'Taking the Leap',
    description: 'Submit your first application',
    category: 'execution',
    rarity: 'rare',
    icon: '🚀',
    xpReward: 500,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'application.submitted',
  },
  {
    id: 'interview_master',
    name: 'Interview Master',
    description: 'Complete 10 interview practice sessions',
    category: 'execution',
    rarity: 'rare',
    icon: '🎓',
    xpReward: 750,
    requirementType: 'count',
    requirementTarget: 10,
    requirementKey: 'interview.completed',
  },
  {
    id: 'route_chosen',
    name: 'Pathfinder',
    description: 'Select your migration route',
    category: 'execution',
    rarity: 'common',
    icon: '🗺️',
    xpReward: 100,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'route.selected',
  },
  {
    id: 'milestone_reached',
    name: 'Milestone Achiever',
    description: 'Complete your first route milestone',
    category: 'execution',
    rarity: 'rare',
    icon: '🎯',
    xpReward: 400,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'route.milestone.completed',
  },
  
  // Marketplace Achievements
  {
    id: 'first_booking',
    name: 'Seeking Help',
    description: 'Book your first service with a provider',
    category: 'marketplace',
    rarity: 'common',
    icon: '🤝',
    xpReward: 250,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'marketplace.booking.created',
  },
  {
    id: 'first_review',
    name: 'Community Voice',
    description: 'Leave your first review for a provider',
    category: 'marketplace',
    rarity: 'common',
    icon: '⭐',
    xpReward: 100,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'marketplace.review.submitted',
  },
  
  // Social Achievements
  {
    id: 'guild_joined',
    name: 'Finding Community',
    description: 'Join your first guild',
    category: 'social',
    rarity: 'common',
    icon: '🏰',
    xpReward: 150,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'guild.joined',
  },
  {
    id: 'first_battle',
    name: 'Friendly Competition',
    description: 'Participate in your first companion battle',
    category: 'social',
    rarity: 'common',
    icon: '⚔️',
    xpReward: 200,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'battle.participated',
  },
  {
    id: 'battle_winner',
    name: 'Victorious',
    description: 'Win your first companion battle',
    category: 'social',
    rarity: 'rare',
    icon: '🏅',
    xpReward: 350,
    requirementType: 'one_time',
    requirementTarget: 1,
    requirementKey: 'battle.won',
  },
  
  // Engagement Achievements
  {
    id: 'day_7_active',
    name: 'Getting Started',
    description: 'Active for 7 days',
    category: 'engagement',
    rarity: 'common',
    icon: '🔥',
    xpReward: 100,
    requirementType: 'count',
    requirementTarget: 7,
    requirementKey: 'user.day_active',
  },
  {
    id: 'day_30_active',
    name: 'Committed',
    description: 'Active for 30 days',
    category: 'engagement',
    rarity: 'rare',
    icon: '💎',
    xpReward: 500,
    requirementType: 'count',
    requirementTarget: 30,
    requirementKey: 'user.day_active',
  },
  {
    id: 'day_100_active',
    name: 'Dedicated',
    description: 'Active for 100 days',
    category: 'engagement',
    rarity: 'epic',
    icon: '💍',
    xpReward: 2000,
    requirementType: 'count',
    requirementTarget: 100,
    requirementKey: 'user.day_active',
  },
]

// ============================================================================
// QUEST GENERATION
// ============================================================================

function generateDailyQuests(): Quest[] {
  const today = new Date().toISOString().split('T')[0]
  
  return [
    {
      id: `daily_care_${today}`,
      name: 'Daily Care',
      description: 'Perform 3 care activities today',
      type: 'daily',
      category: 'companion',
      requirementKey: 'companion.cared',
      requirementTarget: 3,
      xpReward: 50,
      coinReward: 10,
      startDate: today,
      endDate: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      progress: 0,
      completedAt: null,
      claimedAt: null,
    },
    {
      id: `daily_check_${today}`,
      name: 'Daily Check-in',
      description: 'View your companion progress',
      type: 'daily',
      category: 'engagement',
      requirementKey: 'companion.viewed',
      requirementTarget: 1,
      xpReward: 25,
      coinReward: 5,
      startDate: today,
      endDate: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      progress: 0,
      completedAt: null,
      claimedAt: null,
    },
  ]
}

// ============================================================================
// STORE STATE & ACTIONS
// ============================================================================

interface GamificationStoreState {
  // Progress
  userProgress: UserProgress
  
  // Achievements
  achievements: Achievement[]
  
  // Quests
  quests: Quest[]
  
  // Streaks
  streaks: Record<string, Streak>
  
  // UI State
  isLoading: boolean
  error: string | null
  lastDailyQuestReset: string | null
  
  // Computed
  getUnlockedAchievements: () => Achievement[]
  getAvailableQuests: () => Quest[]
  getCurrentStreakMultiplier: () => number
}

interface GamificationStoreActions {
  // Initialization
  initializeGamification: () => void
  resetDailyQuests: () => void
  
  // Achievement Actions
  checkAchievementProgress: (key: string, value: number) => void
  unlockAchievement: (achievementId: string) => void
  
  // Quest Actions
  updateQuestProgress: (key: string, increment?: number) => void
  completeQuest: (questId: string) => void
  claimQuestReward: (questId: string) => void
  
  // Progress Actions
  addXP: (amount: number, source: string) => void
  addCoins: (amount: number, source: string) => void
  checkLevelUp: () => void
  
  // Streak Actions
  updateStreak: (type: string, activityDate?: string) => void
  
  // Event Handling
  handleCompanionEvent: (event: CompanionEvent) => void
  handleProductEvent: (eventType: string, payload: Record<string, unknown>) => void
  
  // Subscription
  onGamificationEvent: (callback: (event: GamificationEvent) => void) => () => void
  
  // UI
  clearError: () => void
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const calculateXPForLevel = (level: number): number => {
  return level * 100 + Math.floor(Math.pow(level, 1.5)) * 10
}

const getTitleForLevel = (level: number): string => {
  if (level >= 50) return 'Legend'
  if (level >= 40) return 'Master'
  if (level >= 30) return 'Expert'
  if (level >= 20) return 'Veteran'
  if (level >= 10) return 'Journeyman'
  return 'Apprentice'
}

export const useGamificationStore = create<
  GamificationStoreState & GamificationStoreActions
>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        userProgress: {
          totalXP: 0,
          level: 1,
          xpToNextLevel: calculateXPForLevel(2),
          totalCoins: 0,
          title: 'Apprentice',
          titles: ['Apprentice'],
          joinDate: new Date().toISOString(),
          daysActive: 0,
        },
        achievements: CANONICAL_ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: false, unlockedAt: null, progress: 0 })),
        quests: generateDailyQuests(),
        streaks: {
          daily_care: {
            type: 'daily_care',
            currentCount: 0,
            bestCount: 0,
            lastActivityAt: null,
            multiplier: 1,
          },
          weekly_engagement: {
            type: 'weekly_engagement',
            currentCount: 0,
            bestCount: 0,
            lastActivityAt: null,
            multiplier: 1,
          },
        },
        isLoading: false,
        error: null,
        lastDailyQuestReset: new Date().toISOString().split('T')[0],
        
        // ========================================================================
        // COMPUTED GETTERS
        // ========================================================================
        
        getUnlockedAchievements: () => {
          return get().achievements.filter(a => a.isUnlocked)
        },
        
        getAvailableQuests: () => {
          const now = new Date()
          return get().quests.filter(q => {
            if (q.status === 'claimed' || q.status === 'expired') return false
            if (q.expiresAt && new Date(q.expiresAt) < now) return false
            return true
          })
        },
        
        getCurrentStreakMultiplier: () => {
          const careStreak = get().streaks.daily_care
          if (careStreak.currentCount >= 30) return 2.0
          if (careStreak.currentCount >= 14) return 1.5
          if (careStreak.currentCount >= 7) return 1.25
          return 1.0
        },
        
        // ========================================================================
        // INITIALIZATION
        // ========================================================================
        
        initializeGamification: () => {
          const today = new Date().toISOString().split('T')[0]
          const lastReset = get().lastDailyQuestReset
          
          if (lastReset !== today) {
            get().resetDailyQuests()
          }
        },
        
        resetDailyQuests: () => {
          const today = new Date().toISOString().split('T')[0]
          const newQuests = generateDailyQuests()
          
          set({
            quests: [
              ...get().quests.filter(q => q.type !== 'daily' || q.status === 'completed'),
              ...newQuests,
            ],
            lastDailyQuestReset: today,
          })
        },
        
        // ========================================================================
        // ACHIEVEMENT ACTIONS
        // ========================================================================
        
        checkAchievementProgress: (key: string, value: number = 1) => {
          const { achievements, userProgress } = get()
          
          achievements.forEach(achievement => {
            if (achievement.isUnlocked) return
            if (achievement.requirementKey !== key) return
            
            let shouldUnlock = false
            
            switch (achievement.requirementType) {
              case 'one_time':
                shouldUnlock = value >= achievement.requirementTarget
                break
              case 'count':
              case 'milestone':
                const newProgress = achievement.progress + value
                set(state => ({
                  achievements: state.achievements.map(a =>
                    a.id === achievement.id ? { ...a, progress: newProgress } : a
                  ),
                }))
                shouldUnlock = newProgress >= achievement.requirementTarget
                break
              case 'streak':
                // Streak achievements are handled separately
                break
            }
            
            if (shouldUnlock) {
              get().unlockAchievement(achievement.id)
            } else {
              // Emit progress event
              eventEmitter.emit({
                type: 'achievement.progress',
                timestamp: new Date().toISOString(),
                payload: {
                  achievementId: achievement.id,
                  progress: achievement.progress + value,
                  target: achievement.requirementTarget,
                },
              })
            }
          })
        },
        
        unlockAchievement: (achievementId: string) => {
          const achievement = get().achievements.find(a => a.id === achievementId)
          if (!achievement || achievement.isUnlocked) return
          
          const now = new Date().toISOString()
          
          set(state => ({
            achievements: state.achievements.map(a =>
              a.id === achievementId
                ? { ...a, isUnlocked: true, unlockedAt: now, progress: a.requirementTarget }
                : a
            ),
          }))
          
          // Award XP
          get().addXP(achievement.xpReward, `achievement:${achievementId}`)
          
          // Emit event
          eventEmitter.emit({
            type: 'achievement.unlocked',
            timestamp: now,
            payload: {
              achievementId,
              name: achievement.name,
              rarity: achievement.rarity,
              xpReward: achievement.xpReward,
            },
          })
        },
        
        // ========================================================================
        // QUEST ACTIONS
        // ========================================================================
        
        updateQuestProgress: (key: string, increment: number = 1) => {
          const now = new Date()
          
          set(state => ({
            quests: state.quests.map(quest => {
              if (quest.status !== 'active') return quest
              if (quest.requirementKey !== key) return quest
              if (quest.expiresAt && new Date(quest.expiresAt) < now) return quest
              
              const newProgress = Math.min(quest.progress + increment, quest.requirementTarget)
              const isCompleted = newProgress >= quest.requirementTarget
              
              if (isCompleted && quest.status === 'active') {
                // Auto-complete the quest
                get().completeQuest(quest.id)
              }
              
              return {
                ...quest,
                progress: newProgress,
              }
            }),
          }))
        },
        
        completeQuest: (questId: string) => {
          const quest = get().quests.find(q => q.id === questId)
          if (!quest || quest.status !== 'active') return
          
          const now = new Date().toISOString()
          
          set(state => ({
            quests: state.quests.map(q =>
              q.id === questId ? { ...q, status: 'completed', completedAt: now } : q
            ),
          }))
          
          // Emit completion event
          eventEmitter.emit({
            type: 'quest.completed',
            timestamp: now,
            payload: {
              questId,
              name: quest.name,
              xpReward: quest.xpReward,
              coinReward: quest.coinReward,
            },
          })
        },
        
        claimQuestReward: (questId: string) => {
          const quest = get().quests.find(q => q.id === questId)
          if (!quest || quest.status !== 'completed') return
          
          const now = new Date().toISOString()
          
          // Award rewards
          if (quest.xpReward > 0) {
            get().addXP(quest.xpReward, `quest:${questId}`)
          }
          if (quest.coinReward && quest.coinReward > 0) {
            get().addCoins(quest.coinReward, `quest:${questId}`)
          }
          
          set(state => ({
            quests: state.quests.map(q =>
              q.id === questId ? { ...q, status: 'claimed', claimedAt: now } : q
            ),
          }))
          
          eventEmitter.emit({
            type: 'quest.claimed',
            timestamp: now,
            payload: {
              questId,
              xpReward: quest.xpReward,
              coinReward: quest.coinReward,
            },
          })
        },
        
        // ========================================================================
        // PROGRESS ACTIONS
        // ========================================================================
        
        addXP: (amount: number, source: string) => {
          const multiplier = get().getCurrentStreakMultiplier()
          const finalAmount = Math.floor(amount * multiplier)
          
          set(state => ({
            userProgress: {
              ...state.userProgress,
              totalXP: state.userProgress.totalXP + finalAmount,
            },
          }))
          
          get().checkLevelUp()
          
          // Track XP by source for analytics
          console.log(`[Gamification] +${finalAmount} XP (${multiplier}x) from ${source}`)
        },
        
        addCoins: (amount: number, source: string) => {
          set(state => ({
            userProgress: {
              ...state.userProgress,
              totalCoins: state.userProgress.totalCoins + amount,
            },
          }))
          
          eventEmitter.emit({
            type: 'reward.received',
            timestamp: new Date().toISOString(),
            payload: {
              type: 'coins',
              amount,
              source,
            },
          })
        },
        
        checkLevelUp: () => {
          const { userProgress } = get()
          
          if (userProgress.totalXP >= userProgress.xpToNextLevel) {
            const newLevel = userProgress.level + 1
            const newTitle = getTitleForLevel(newLevel)
            
            set(state => ({
              userProgress: {
                ...state.userProgress,
                level: newLevel,
                xpToNextLevel: calculateXPForLevel(newLevel + 1),
                title: newTitle,
                titles: state.userProgress.titles.includes(newTitle)
                  ? state.userProgress.titles
                  : [...state.userProgress.titles, newTitle],
              },
            }))
            
            eventEmitter.emit({
              type: 'level.up',
              timestamp: new Date().toISOString(),
              payload: {
                newLevel,
                newTitle,
                xpToNextLevel: calculateXPForLevel(newLevel + 1),
              },
            })
            
            // Check for milestone achievements
            get().checkAchievementProgress('user.level', newLevel)
          }
        },
        
        // ========================================================================
        // STREAK ACTIONS
        // ========================================================================
        
        updateStreak: (type: string, activityDate?: string) => {
          const date = activityDate || new Date().toISOString()
          const streak = get().streaks[type]
          
          if (!streak) return
          
          const lastActivity = streak.lastActivityAt
            ? new Date(streak.lastActivityAt)
            : null
          
          const now = new Date(date)
          
          let newStreak = streak.currentCount
          
          if (!lastActivity) {
            // First activity
            newStreak = 1
          } else {
            const daysSinceLastActivity = Math.floor(
              (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            if (daysSinceLastActivity === 0) {
              // Same day, don't increment
              return
            } else if (daysSinceLastActivity === 1) {
              // Consecutive day, increment streak
              newStreak += 1
            } else {
              // Streak broken
              newStreak = 1
              
              // Emit streak broken event
              eventEmitter.emit({
                type: 'streak.updated',
                timestamp: date,
                payload: {
                  type,
                  streak: 0,
                  broken: true,
                  previousBest: Math.max(streak.bestCount, streak.currentCount),
                },
              })
            }
          }
          
          const newBest = Math.max(streak.bestCount, newStreak)
          
          // Calculate multiplier based on streak
          let multiplier = 1
          if (newStreak >= 30) multiplier = 2.0
          else if (newStreak >= 14) multiplier = 1.5
          else if (newStreak >= 7) multiplier = 1.25
          
          set(state => ({
            streaks: {
              ...state.streaks,
              [type]: {
                ...streak,
                currentCount: newStreak,
                bestCount: newBest,
                lastActivityAt: date,
                multiplier,
              },
            },
          }))
          
          eventEmitter.emit({
            type: 'streak.updated',
            timestamp: date,
            payload: {
              type,
              streak: newStreak,
              bestStreak: newBest,
              multiplier,
              broken: false,
            },
          })
          
          // Check streak-based achievements
          get().checkAchievementProgress(`streak.${type}`, newStreak)
        },
        
        // ========================================================================
        // EVENT HANDLERS - The Core of Event-Driven Gamification
        // ========================================================================
        
        handleCompanionEvent: (event: CompanionEvent) => {
          const { type, payload } = event
          
          switch (type) {
            case 'companion.created':
              get().checkAchievementProgress('companion.created', 1)
              get().updateStreak('daily_care', event.timestamp)
              break
              
            case 'companion.cared':
              get().addXP(10 + (payload.xpGained as number || 0), 'companion_care')
              get().updateQuestProgress('companion.cared')
              get().updateStreak('daily_care', event.timestamp)
              
              // Track activity types for "all activities" achievement
              if (payload.activityType) {
                get().checkAchievementProgress('companion.activity_type.unique', 1)
              }
              break
              
            case 'companion.leveled':
              get().addXP(50, 'companion_level_up')
              get().checkAchievementProgress(`companion.level`, payload.newLevel as number)
              break
              
            case 'companion.evolved':
              get().addXP(200, 'companion_evolution')
              get().unlockAchievement('first_evolution')
              get().checkAchievementProgress(`companion.stage.${payload.toStage}`, 1)
              break
              
            case 'companion.ability_unlocked':
              get().addXP(100, 'ability_unlocked')
              get().checkAchievementProgress('companion.ability.unlocked', 1)
              break
              
            default:
              console.log(`[Gamification] Unhandled companion event: ${type}`)
          }
        },
        
        handleProductEvent: (eventType: string, payload: Record<string, unknown>) => {
          switch (eventType) {
            // Execution events
            case 'document.created':
              get().addXP(25, 'document_created')
              get().unlockAchievement('first_document')
              get().updateQuestProgress('document.created')
              break
              
            case 'interview.completed':
              get().addXP(40, 'interview_practice')
              get().checkAchievementProgress('interview.completed', 1)
              get().unlockAchievement('first_interview')
              break
              
            case 'application.submitted':
              get().addXP(100, 'application_submitted')
              get().unlockAchievement('first_application')
              break
              
            case 'route.selected':
              get().addXP(20, 'route_selected')
              get().unlockAchievement('route_chosen')
              break
              
            case 'route.milestone.completed':
              get().addXP(75, 'milestone_completed')
              get().unlockAchievement('milestone_reached')
              break
              
            // Marketplace events
            case 'marketplace.booking.created':
              get().addXP(50, 'service_booked')
              get().unlockAchievement('first_booking')
              break
              
            case 'marketplace.review.submitted':
              get().addXP(20, 'review_submitted')
              get().unlockAchievement('first_review')
              break
              
            // Social events
            case 'guild.joined':
              get().addXP(30, 'guild_joined')
              get().unlockAchievement('guild_joined')
              break
              
            case 'battle.participated':
              get().addXP(40, 'battle_participated')
              get().unlockAchievement('first_battle')
              break
              
            case 'battle.won':
              get().addXP(75, 'battle_won')
              get().unlockAchievement('battle_winner')
              break
              
            // Engagement events
            case 'user.active_day':
              get().updateStreak('weekly_engagement')
              get().checkAchievementProgress('user.day_active', 1)
              break
              
            default:
              console.log(`[Gamification] Unhandled product event: ${eventType}`)
          }
        },
        
        // ========================================================================
        // SUBSCRIPTION
        // ========================================================================
        
        onGamificationEvent: (callback: (event: GamificationEvent) => void) => {
          return eventEmitter.subscribe(callback)
        },
        
        // ========================================================================
        // UI
        // ========================================================================
        
        clearError: () => {
          set({ error: null })
        },
      }),
      {
        name: 'event-driven-gamification-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          userProgress: state.userProgress,
          achievements: state.achievements,
          quests: state.quests.filter(q => q.type !== 'daily' || q.status !== 'active'),
          streaks: state.streaks,
          lastDailyQuestReset: state.lastDailyQuestReset,
        }),
      }
    ),
    { name: 'GamificationStore' }
  )
)

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useUserProgress = () => useGamificationStore((state) => state.userProgress)

export const useAchievements = () => useGamificationStore((state) => state.achievements)

export const useUnlockedAchievements = () =>
  useGamificationStore((state) => state.achievements.filter(a => a.isUnlocked))

export const useAvailableQuests = () =>
  useGamificationStore((state) => state.getAvailableQuests())

export const useCurrentStreakMultiplier = () =>
  useGamificationStore((state) => state.getCurrentStreakMultiplier())

// ============================================================================
// INTEGRATION HELPER - Subscribe companion events
// ============================================================================

/**
 * Hook to wire companion events to gamification
 * Usage: Call this once in your app root or companion page
 */
export function useCompanionGamificationIntegration() {
  const handleCompanionEvent = useGamificationStore((state) => state.handleCompanionEvent)
  
  // This would be imported from canonicalCompanionStore
  // and subscribed to events
  return { handleCompanionEvent }
}
