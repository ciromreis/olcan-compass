/**
 * Gamification API Client
 * 
 * Handles all backend communication for gamification features:
 * - User progress (XP, level, coins)
 * - Achievements (unlock, progress)
 * - Quests (fetch, complete, claim)
 * - Streaks (update, fetch)
 * - Leaderboards
 */

import { api } from '../api'

// ============================================================================
// TYPES
// ============================================================================

export interface APIUserProgress {
  user_id: string
  total_xp: number
  level: number
  total_coins: number
  title: string
  join_date: string
  days_active: number
}

export interface APIAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string | null
  progress: number
}

export interface APIQuest {
  id: string
  user_id: string
  quest_id: string
  status: 'active' | 'completed' | 'claimed' | 'expired'
  progress: number
  completed_at: string | null
  claimed_at: string | null
}

export interface APIStreak {
  user_id: string
  streak_type: string
  current_count: number
  best_count: number
  last_activity_at: string | null
}

export interface APILeaderboardEntry {
  user_id: string
  username: string
  level: number
  total_xp: number
  rank: number
}

// ============================================================================
// API CLIENT
// ============================================================================

export const gamificationApi = {
  // ========================================================================
  // USER PROGRESS
  // ========================================================================
  
  /**
   * Get user's gamification progress
   */
  async getProgress(): Promise<{ data: APIUserProgress }> {
    return api.get('/gamification/progress')
  },
  
  /**
   * Add XP to user's progress
   */
  async addXP(amount: number, source: string): Promise<{ data: APIUserProgress }> {
    return api.post('/gamification/xp', {
      amount,
      source,
    })
  },
  
  /**
   * Add coins to user's progress
   */
  async addCoins(amount: number, source: string): Promise<{ data: APIUserProgress }> {
    return api.post('/gamification/coins', {
      amount,
      source,
    })
  },
  
  // ========================================================================
  // ACHIEVEMENTS
  // ========================================================================
  
  /**
   * Get all user achievements
   */
  async getAchievements(): Promise<{ data: APIAchievement[] }> {
    return api.get('/gamification/achievements')
  },
  
  /**
   * Unlock an achievement
   */
  async unlockAchievement(achievementId: string): Promise<{ data: APIAchievement }> {
    return api.post(`/gamification/achievements/${achievementId}/unlock`, {})
  },
  
  /**
   * Update achievement progress
   */
  async updateAchievementProgress(
    achievementId: string,
    progress: number
  ): Promise<{ data: APIAchievement }> {
    return api.patch(`/gamification/achievements/${achievementId}/progress`, {
      progress,
    })
  },
  
  // ========================================================================
  // QUESTS
  // ========================================================================
  
  /**
   * Get all user quests
   */
  async getQuests(): Promise<{ data: APIQuest[] }> {
    return api.get('/gamification/quests')
  },
  
  /**
   * Update quest progress
   */
  async updateQuestProgress(
    questId: string,
    progress: number
  ): Promise<{ data: APIQuest }> {
    return api.patch(`/gamification/quests/${questId}/progress`, {
      progress,
    })
  },
  
  /**
   * Complete a quest
   */
  async completeQuest(questId: string): Promise<{ data: APIQuest }> {
    return api.post(`/gamification/quests/${questId}/complete`, {})
  },
  
  /**
   * Claim quest rewards
   */
  async claimQuestReward(questId: string): Promise<{ data: APIQuest }> {
    return api.post(`/gamification/quests/${questId}/claim`, {})
  },
  
  // ========================================================================
  // STREAKS
  // ========================================================================
  
  /**
   * Get all user streaks
   */
  async getStreaks(): Promise<{ data: APIStreak[] }> {
    return api.get('/gamification/streaks')
  },
  
  /**
   * Update a streak
   */
  async updateStreak(
    streakType: string,
    activityDate?: string
  ): Promise<{ data: APIStreak }> {
    return api.post(`/gamification/streaks/${streakType}`, {
      activity_date: activityDate || new Date().toISOString(),
    })
  },
  
  // ========================================================================
  // LEADERBOARD
  // ========================================================================
  
  /**
   * Get leaderboard
   */
  async getLeaderboard(
    limit: number = 100,
    offset: number = 0
  ): Promise<{ data: APILeaderboardEntry[] }> {
    return api.get('/gamification/leaderboard', {
      params: { limit, offset },
    })
  },
  
  /**
   * Get user's leaderboard rank
   */
  async getUserRank(): Promise<{ data: { rank: number; total_users: number } }> {
    return api.get('/gamification/leaderboard/rank')
  },
}

// ============================================================================
// SYNC HELPERS
// ============================================================================

/**
 * Sync local progress to backend
 * Used for optimistic updates and offline support
 */
export async function syncProgressToBackend(localProgress: {
  totalXP: number
  level: number
  totalCoins: number
  daysActive: number
}): Promise<APIUserProgress | null> {
  try {
    const response = await api.patch('/gamification/progress', {
      total_xp: localProgress.totalXP,
      level: localProgress.level,
      total_coins: localProgress.totalCoins,
      days_active: localProgress.daysActive,
    })
    return response.data
  } catch (error) {
    console.error('[Gamification API] Failed to sync progress:', error)
    return null
  }
}

/**
 * Sync local achievements to backend
 */
export async function syncAchievementsToBackend(
  localAchievements: Array<{
    id: string
    isUnlocked: boolean
    progress: number
    unlockedAt: string | null
  }>
): Promise<APIAchievement[] | null> {
  try {
    const response = await api.post('/gamification/achievements/sync', {
      achievements: localAchievements.map(a => ({
        achievement_id: a.id,
        unlocked: a.isUnlocked,
        progress: a.progress,
        unlocked_at: a.unlockedAt,
      })),
    })
    return response.data
  } catch (error) {
    console.error('[Gamification API] Failed to sync achievements:', error)
    return null
  }
}

/**
 * Sync local quests to backend
 */
export async function syncQuestsToBackend(
  localQuests: Array<{
    id: string
    status: string
    progress: number
    completedAt: string | null
    claimedAt: string | null
  }>
): Promise<APIQuest[] | null> {
  try {
    const response = await api.post('/gamification/quests/sync', {
      quests: localQuests.map(q => ({
        quest_id: q.id,
        status: q.status,
        progress: q.progress,
        completed_at: q.completedAt,
        claimed_at: q.claimedAt,
      })),
    })
    return response.data
  } catch (error) {
    console.error('[Gamification API] Failed to sync quests:', error)
    return null
  }
}

/**
 * Sync local streaks to backend
 */
export async function syncStreaksToBackend(
  localStreaks: Record<
    string,
    {
      type: string
      currentCount: number
      bestCount: number
      lastActivityAt: string | null
    }
  >
): Promise<APIStreak[] | null> {
  try {
    const response = await api.post('/gamification/streaks/sync', {
      streaks: Object.values(localStreaks).map(s => ({
        streak_type: s.type,
        current_count: s.currentCount,
        best_count: s.bestCount,
        last_activity_at: s.lastActivityAt,
      })),
    })
    return response.data
  } catch (error) {
    console.error('[Gamification API] Failed to sync streaks:', error)
    return null
  }
}
