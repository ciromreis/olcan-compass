/**
 * Task Management Zustand Store
 */

import { create } from 'zustand'
import { taskApi } from '@/lib/taskApi'
import { taskToast, handleTaskComplete } from '@/components/tasks/TaskToast'
import type {
  Task,
  UserProgress,
  Achievement,
  UserAchievement,
  TaskStatistics,
  TaskCompleteResponse,
  TaskFilters,
  TaskCreateRequest,
  TaskUpdateRequest,
} from '@/lib/taskTypes'
import type { AxiosError } from 'axios'

function extractErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<{ detail?: string }>
  return axiosErr?.response?.data?.detail || (error as Error)?.message || 'Unknown error'
}

interface TaskState {
  // Data
  tasks: Task[]
  tasksTotal: number
  progress: UserProgress | null
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  statistics: TaskStatistics | null
  
  // UI State
  selectedTask: Task | null
  showLevelUp: boolean
  levelUpData: { level: number; title: string } | null
  isLoading: boolean
  isCompleting: boolean
  error: string | null
  
  // Filters
  filters: TaskFilters
  
  // Actions - Data Fetching
  fetchTasks: () => Promise<void>
  fetchProgress: () => Promise<void>
  fetchAchievements: () => Promise<void>
  fetchStatistics: () => Promise<void>
  fetchAll: () => Promise<void>
  
  // Actions - Task Operations
  completeTask: (taskId: string) => Promise<TaskCompleteResponse>
  startTask: (taskId: string) => Promise<void>
  createTask: (data: TaskCreateRequest) => Promise<void>
  updateTask: (taskId: string, data: TaskUpdateRequest) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  
  // Actions - UI
  selectTask: (task: Task | null) => void
  showLevelUpModal: (level: number, title: string) => void
  hideLevelUpModal: () => void
  updateFilters: (filters: Partial<TaskFilters>) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial State
  tasks: [],
  tasksTotal: 0,
  progress: null,
  achievements: [],
  userAchievements: [],
  statistics: null,
  selectedTask: null,
  showLevelUp: false,
  levelUpData: null,
  isLoading: false,
  isCompleting: false,
  error: null,
  filters: {
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 50,
    offset: 0,
  },

  // ============================================================
  // Data Fetching
  // ============================================================

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const response = await taskApi.getTasks(filters)
      set({ 
        tasks: response.tasks, 
        tasksTotal: response.total,
        isLoading: false 
      })
    } catch (error: unknown) {
      set({ 
        error: extractErrorMessage(error), 
        isLoading: false 
      })
    }
  },

  fetchProgress: async () => {
    try {
      const progress = await taskApi.getUserProgress()
      set({ progress })
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  },

  fetchAchievements: async () => {
    try {
      const [allResponse, userResponse] = await Promise.all([
        taskApi.getAchievements(),
        taskApi.getUserAchievements(),
      ])
      set({ 
        achievements: allResponse.achievements,
        userAchievements: userResponse.unlocked,
      })
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
  },

  fetchStatistics: async () => {
    try {
      const statistics = await taskApi.getTaskStatistics()
      set({ statistics })
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchTasks(),
      get().fetchProgress(),
      get().fetchAchievements(),
      get().fetchStatistics(),
    ])
  },

  // ============================================================
  // Task Operations
  // ============================================================

  completeTask: async (taskId: string) => {
    set({ isCompleting: true, error: null })
    try {
      const result = await taskApi.completeTask(taskId)
      
      // NEW: Update aura XP if companion exists
      try {
        const { useAuraStore } = await import('./auraStore')
        const auraStore = useAuraStore.getState()
        if (auraStore.selectedAuraId) {
          // Refresh aura to get updated XP from backend
          await auraStore.fetchAura()
        }
      } catch (auraError) {
        console.warn('Failed to update aura after task completion:', auraError)
      }
      
      // NEW: Show achievement unlock toasts
      if (result.achievements_unlocked && result.achievements_unlocked.length > 0) {
        result.achievements_unlocked.forEach((achievement: UserAchievement) => {
          console.log(`🏆 Achievement Unlocked: ${achievement.achievement?.name || 'New Achievement'}`, achievement.achievement?.description)
        })
      }
      
      // NEW: Show quest progress/completion toasts
      if (result.quests_updated && result.quests_updated.length > 0) {
        result.quests_updated.forEach((quest: { name?: string; completed?: boolean; xp_reward?: number; progress?: number; target?: number; progress_percentage?: number }) => {
          if (quest.completed) {
            console.log(`✨ Quest Completed: ${quest.name}`, `Earned ${quest.xp_reward} XP! Claim your reward.`)
          } else if ((quest.progress_percentage ?? 0) >= 50) {
            console.log(`📋 Quest Progress: ${quest.name}`, `${quest.progress}/${quest.target} (${quest.progress_percentage}%)`)
          }
        })
      }
      
      // Refresh all data to get updated progress
      await get().fetchAll()
      
      set({ isCompleting: false })
      
      // Show toast notifications
      handleTaskComplete(result)
      
      return result
    } catch (error: unknown) {
      const msg = extractErrorMessage(error)
      set({ 
        error: msg,
        isCompleting: false 
      })
      taskToast.error('Failed to Complete Task', msg)
      throw error
    }
  },

  startTask: async (taskId: string) => {
    set({ isLoading: true, error: null })
    try {
      await taskApi.startTask(taskId)
      await get().fetchTasks()
    } catch (error: unknown) {
      set({ 
        error: extractErrorMessage(error),
        isLoading: false 
      })
      throw error
    }
  },

  createTask: async (data: TaskCreateRequest) => {
    set({ isLoading: true, error: null })
    try {
      await taskApi.createTask(data)
      await get().fetchTasks()
    } catch (error: unknown) {
      set({ 
        error: extractErrorMessage(error),
        isLoading: false 
      })
      throw error
    }
  },

  updateTask: async (taskId: string, data: TaskUpdateRequest) => {
    set({ isLoading: true, error: null })
    try {
      await taskApi.updateTask(taskId, data)
      await get().fetchTasks()
      
      // Update selected task if it's the one being updated
      const { selectedTask } = get()
      if (selectedTask?.id === taskId) {
        const updatedTask = await taskApi.getTask(taskId)
        set({ selectedTask: updatedTask })
      }
    } catch (error: unknown) {
      set({ 
        error: extractErrorMessage(error),
        isLoading: false 
      })
      throw error
    }
  },

  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null })
    try {
      await taskApi.deleteTask(taskId)
      await get().fetchTasks()
      
      // Clear selected task if it's the one being deleted
      const { selectedTask } = get()
      if (selectedTask?.id === taskId) {
        set({ selectedTask: null })
      }
    } catch (error: unknown) {
      set({ 
        error: extractErrorMessage(error),
        isLoading: false 
      })
      throw error
    }
  },

  // ============================================================
  // UI Actions
  // ============================================================

  selectTask: (task: Task | null) => {
    set({ selectedTask: task })
  },

  showLevelUpModal: (level: number, title: string) => {
    set({ showLevelUp: true, levelUpData: { level, title } })
  },

  hideLevelUpModal: () => {
    set({ showLevelUp: false, levelUpData: null })
  },

  updateFilters: (filters: Partial<TaskFilters>) => {
    set({ 
      filters: { ...get().filters, ...filters },
      error: null
    })
    // Refetch tasks with new filters
    get().fetchTasks()
  },

  clearError: () => {
    set({ error: null })
  },
}))
