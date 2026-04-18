/**
 * Task Management API Client
 * Uses the shared apiClient from api-client.ts (same auth, same base URL).
 */

import { apiClient } from '@/lib/api-client'
import type {
  Task,
  TaskListResponse,
  TaskCompleteResponse,
  TaskStartResponse,
  TaskStatistics,
  UserProgress,
  AchievementListResponse,
  UserAchievementListResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskFilters,
} from '@/lib/taskTypes'

export const taskApi = {
  getTasks: (params?: TaskFilters) =>
    apiClient.fetchJson<TaskListResponse>('GET', '/tasks', undefined, params as Record<string, unknown>),

  getTask: (taskId: string) =>
    apiClient.fetchJson<Task>('GET', `/tasks/${taskId}`),

  createTask: (data: TaskCreateRequest) =>
    apiClient.fetchJson<Task>('POST', '/tasks', data),

  updateTask: (taskId: string, data: TaskUpdateRequest) =>
    apiClient.fetchJson<Task>('PATCH', `/tasks/${taskId}`, data),

  deleteTask: (taskId: string) =>
    apiClient.fetchJson<void>('DELETE', `/tasks/${taskId}`),

  completeTask: (taskId: string) =>
    apiClient.fetchJson<TaskCompleteResponse>('POST', `/tasks/${taskId}/complete`),

  startTask: (taskId: string) =>
    apiClient.fetchJson<TaskStartResponse>('POST', `/tasks/${taskId}/start`),

  getUserProgress: () =>
    apiClient.fetchJson<UserProgress>('GET', '/tasks/progress'),

  getTaskStatistics: () =>
    apiClient.fetchJson<TaskStatistics>('GET', '/tasks/stats'),

  getAchievements: (category?: string) =>
    apiClient.fetchJson<AchievementListResponse>('GET', '/tasks/achievements', undefined, category ? { category } : undefined),

  getUserAchievements: () =>
    apiClient.fetchJson<UserAchievementListResponse>('GET', '/tasks/achievements/user'),

  claimAchievement: (achievementId: string) =>
    apiClient.fetchJson<{ message: string }>('POST', `/tasks/achievements/${achievementId}/claim`),

  getCategories: () =>
    apiClient.fetchJson<Array<{ value: string; label: string; description: string }>>('GET', '/tasks/categories'),
}
