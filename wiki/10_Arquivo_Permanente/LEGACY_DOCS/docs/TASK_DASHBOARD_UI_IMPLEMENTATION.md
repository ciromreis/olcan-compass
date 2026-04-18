# Task Dashboard UI - Implementation Summary

## Status: Ready for Implementation

This document provides the complete implementation plan for the Task Dashboard UI components. All specifications, code examples, and component trees are ready for your frontend team to implement.

---

## Architecture Overview

The task dashboard follows a **3-panel layout**:
```
┌─────────────┬──────────────────────────┬─────────────────┐
│   Sidebar   │    Main Task Area        │  Gamification   │
│   (264px)   │      (flex-1)            │    Panel        │
│             │                          │    (320px)      │
│ Categories  │  Task List / Detail      │  XP & Level     │
│ Filters     │  Task Cards              │  Streaks        │
│ Search      │  Subtask Checklists      │  Achievements   │
│             │  Create/Edit Forms       │  Leaderboard    │
└─────────────┴──────────────────────────┴─────────────────┘
```

---

## File Structure

```
apps/app-compass-v2.5/src/
├── app/(app)/tasks/
│   ├── page.tsx                      # Main task dashboard page
│   └── loading.tsx                   # Loading skeleton
│
├── components/tasks/
│   ├── TaskDashboard.tsx             # Main dashboard container
│   ├── TaskSidebar.tsx               # Left sidebar with filters
│   ├── TaskList.tsx                  # Task list view
│   ├── TaskCard.tsx                  # Individual task card
│   ├── TaskDetail.tsx                # Task detail modal/view
│   ├── TaskCreateForm.tsx            # Create new task form
│   ├── SubTaskList.tsx               # Subtask checklist
│   ├── TaskFilters.tsx               # Advanced filters
│   └── index.ts                      # Barrel exports
│
├── components/gamification/
│   ├── GamificationPanel.tsx         # Right panel container
│   ├── LevelDisplay.tsx              # Current level & XP
│   ├── ProgressBar.tsx               # Level progress bar
│   ├── StreakCalendar.tsx            # Visual streak calendar
│   ├── AchievementGallery.tsx        # Unlocked/locked achievements
│   ├── AchievementBadge.tsx          # Individual achievement
│   └── index.ts
│
├── stores/
│   ├── taskStore.ts                  # Zustand store for tasks
│   └── gamificationStore.ts          # Zustand store for XP/levels
│
├── lib/
│   ├── api.ts                        # API client with task endpoints
│   └── taskTypes.ts                  # TypeScript type definitions
│
└── hooks/
    ├── useTasks.ts                   # Task data fetching hook
    ├── useGamification.ts            # Gamification data hook
    └── useAchievements.ts            # Achievement tracking hook
```

---

## Implementation Priority

### Phase 1: Core Components (Week 1) - HIGH PRIORITY
1. ✅ **TypeScript Types** (`lib/taskTypes.ts`)
2. ✅ **API Client** (`lib/api.ts`)
3. ✅ **Zustand Store** (`stores/taskStore.ts`)
4. ✅ **Task Dashboard Page** (`app/(app)/tasks/page.tsx`)
5. ✅ **Task Card Component** (`components/tasks/TaskCard.tsx`)
6. ✅ **Task List Component** (`components/tasks/TaskList.tsx`)
7. ✅ **Gamification Panel** (`components/gamification/GamificationPanel.tsx`)

### Phase 2: Enhanced Features (Week 2)
8. Task Sidebar with filters
9. Task Detail view
10. Task Create/Edit forms
11. Subtask checklist
12. Achievement gallery

### Phase 3: Polish & Optimization (Week 3)
13. Loading skeletons
14. Error boundaries
15. Optimistic updates
16. Infinite scroll/pagination
17. Mobile responsive design

---

## Code Specifications

### 1. TypeScript Types (`lib/taskTypes.ts`)

```typescript
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED'
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TaskCategory = 
  | 'DOCUMENTATION' 
  | 'LANGUAGE' 
  | 'FINANCE' 
  | 'HOUSING' 
  | 'NETWORKING' 
  | 'INTERVIEW' 
  | 'VISA' 
  | 'CULTURAL_PREP' 
  | 'HEALTH' 
  | 'EDUCATION' 
  | 'EMPLOYMENT' 
  | 'CUSTOM'

export interface Task {
  id: string
  user_id: string
  route_id?: string
  title: string
  description?: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  estimated_hours?: number
  xp_reward: number
  level_requirement?: number
  streak_count: number
  completion_count: number
  started_at?: string
  completed_at?: string
  notes?: string
  task_metadata?: Record<string, any>
  subtask_count?: number
  completed_subtasks?: number
  created_at: string
  updated_at: string
}

export interface SubTask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  position: number
  created_at: string
}

export interface UserProgress {
  user_id: string
  total_xp: number
  current_level: number
  level_title: string
  streak_current: number
  streak_best: number
  tasks_completed_today: number
  tasks_completed_total: number
  tasks_completed_this_week: number
  tasks_completed_this_month: number
  time_spent_minutes: number
  xp_to_next_level: number
  level_progress_percent: number
  last_activity_date?: string
}

export interface Achievement {
  id: string
  name: string
  name_en?: string
  description: string
  icon: string
  xp_bonus: number
  category: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface UserAchievement {
  id: string
  achievement_id: string
  achievement: Achievement
  unlocked_at: string
  progress: number
  claimed: boolean
}

export interface TaskCompleteResponse {
  task: Task
  xp_earned: number
  total_xp: number
  level_up: boolean
  new_level?: number
  streak_updated: boolean
  new_streak: number
  achievements_unlocked: UserAchievement[]
}

export interface TaskStatistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  completion_rate: number
  tasks_by_category: Record<string, number>
  tasks_by_priority: Record<string, number>
  tasks_completed_today: number
  tasks_completed_this_week: number
  tasks_completed_this_month: number
  current_streak: number
  best_streak: number
}
```

### 2. API Client (`lib/api.ts`)

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Task API endpoints
export const taskApi = {
  // CRUD
  getTasks: (params?: {
    status?: string
    category?: string
    priority?: string
    search?: string
    limit?: number
    offset?: number
    sort_by?: string
    sort_order?: string
  }) => api.get('/api/tasks', { params }),
  
  getTask: (taskId: string) => api.get(`/api/tasks/${taskId}`),
  
  createTask: (data: {
    title: string
    description?: string
    category: string
    priority: string
    due_date?: string
    estimated_hours?: number
    route_id?: string
    subtasks?: string[]
  }) => api.post('/api/tasks', data),
  
  updateTask: (taskId: string, data: Partial<Task>) => 
    api.patch(`/api/tasks/${taskId}`, data),
  
  deleteTask: (taskId: string) => api.delete(`/api/tasks/${taskId}`),
  
  // Actions
  completeTask: (taskId: string) => 
    api.post(`/api/tasks/${taskId}/complete`),
  
  startTask: (taskId: string) => 
    api.post(`/api/tasks/${taskId}/start`),
  
  // Progress & Stats
  getUserProgress: () => api.get('/api/tasks/progress'),
  
  getTaskStatistics: () => api.get('/api/tasks/stats'),
  
  // Achievements
  getAchievements: (category?: string) => 
    api.get('/api/tasks/achievements', { params: { category } }),
  
  getUserAchievements: () => 
    api.get('/api/tasks/achievements/user'),
  
  // Categories
  getCategories: () => api.get('/api/tasks/categories'),
}

export { api }
export default api
```

### 3. Zustand Store (`stores/taskStore.ts`)

```typescript
import { create } from 'zustand'
import { taskApi } from '@/lib/api'
import type { Task, UserProgress, Achievement, TaskStatistics, TaskCompleteResponse } from '@/lib/taskTypes'

interface TaskState {
  // Data
  tasks: Task[]
  progress: UserProgress | null
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  statistics: TaskStatistics | null
  
  // UI State
  selectedTask: Task | null
  isLoading: boolean
  error: string | null
  
  // Filters
  filters: {
    status?: string
    category?: string
    priority?: string
    search?: string
    sort_by: string
    sort_order: 'asc' | 'desc'
  }
  
  // Actions
  fetchTasks: () => Promise<void>
  fetchProgress: () => Promise<void>
  fetchAchievements: () => Promise<void>
  fetchStatistics: () => Promise<void>
  
  completeTask: (taskId: string) => Promise<TaskCompleteResponse>
  startTask: (taskId: string) => Promise<void>
  createTask: (data: any) => Promise<void>
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  
  selectTask: (task: Task | null) => void
  updateFilters: (filters: Partial<TaskState['filters']>) => void
  
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  progress: null,
  achievements: [],
  userAchievements: [],
  statistics: null,
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    sort_by: 'created_at',
    sort_order: 'desc'
  },
  
  // Fetch tasks with current filters
  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const response = await taskApi.getTasks(filters)
      set({ tasks: response.data.tasks, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  fetchProgress: async () => {
    try {
      const response = await taskApi.getUserProgress()
      set({ progress: response.data })
    } catch (error: any) {
      console.error('Failed to fetch progress:', error)
    }
  },
  
  fetchAchievements: async () => {
    try {
      const [allResponse, userResponse] = await Promise.all([
        taskApi.getAchievements(),
        taskApi.getUserAchievements()
      ])
      set({ 
        achievements: allResponse.data.achievements,
        userAchievements: userResponse.data.unlocked
      })
    } catch (error: any) {
      console.error('Failed to fetch achievements:', error)
    }
  },
  
  fetchStatistics: async () => {
    try {
      const response = await taskApi.getTaskStatistics()
      set({ statistics: response.data })
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error)
    }
  },
  
  // Task actions
  completeTask: async (taskId: string) => {
    try {
      const response = await taskApi.completeTask(taskId)
      
      // Refresh all data
      await Promise.all([
        get().fetchTasks(),
        get().fetchProgress(),
        get().fetchAchievements(),
        get().fetchStatistics()
      ])
      
      // Show notifications for level up or achievements
      if (response.data.level_up) {
        // TODO: Show level up toast
        console.log('Level up!', response.data.new_level)
      }
      
      if (response.data.achievements_unlocked?.length > 0) {
        // TODO: Show achievement toast
        console.log('Achievements unlocked:', response.data.achievements_unlocked)
      }
      
      return response.data
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },
  
  startTask: async (taskId: string) => {
    try {
      await taskApi.startTask(taskId)
      await get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },
  
  createTask: async (data: any) => {
    try {
      await taskApi.createTask(data)
      await get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },
  
  updateTask: async (taskId: string, data: Partial<Task>) => {
    try {
      await taskApi.updateTask(taskId, data)
      await get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },
  
  deleteTask: async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId)
      await get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },
  
  // UI actions
  selectTask: (task: Task | null) => {
    set({ selectedTask: task })
  },
  
  updateFilters: (filters: Partial<TaskState['filters']>) => {
    set({ filters: { ...get().filters, ...filters } })
    get().fetchTasks()
  },
  
  clearError: () => {
    set({ error: null })
  }
}))
```

### 4. Task Dashboard Page (`app/(app)/tasks/page.tsx`)

```typescript
'use client'

import { useEffect } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { TaskSidebar } from '@/components/tasks/TaskSidebar'
import { TaskList } from '@/components/tasks/TaskList'
import { GamificationPanel } from '@/components/gamification/GamificationPanel'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function TasksPage() {
  const { fetchTasks, fetchProgress, fetchAchievements, isLoading } = useTaskStore()
  
  useEffect(() => {
    // Initial data fetch
    fetchTasks()
    fetchProgress()
    fetchAchievements()
  }, [fetchTasks, fetchProgress, fetchAchievements])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Sidebar - Filters & Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <TaskSidebar />
      </aside>
      
      {/* Main Content - Task List */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your professional journey tasks</p>
          </div>
          
          <TaskList />
        </div>
      </main>
      
      {/* Right Panel - Gamification */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <GamificationPanel />
      </aside>
      
      {/* Task Detail Modal */}
      <TaskDetail />
    </div>
  )
}
```

### 5. Task Card Component (`components/tasks/TaskCard.tsx`)

```typescript
'use client'

import { format } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/lib/taskTypes'
import { 
  CalendarIcon, 
  StarIcon, 
  CheckCircleIcon,
  PlayIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  CRITICAL: 'border-l-red-500 bg-red-50',
  HIGH: 'border-l-orange-500 bg-orange-50',
  MEDIUM: 'border-l-yellow-500 bg-yellow-50',
  LOW: 'border-l-green-500 bg-green-50',
}

const categoryIcons: Record<string, string> = {
  DOCUMENTATION: '📄',
  LANGUAGE: '🌍',
  FINANCE: '💰',
  HOUSING: '🏠',
  NETWORKING: '🤝',
  INTERVIEW: '🎤',
  VISA: '🛂',
  CULTURAL_PREP: '🎭',
  HEALTH: '🏥',
  EDUCATION: '🎓',
  EMPLOYMENT: '💼',
  CUSTOM: '📝',
}

export function TaskCard({ task }: TaskCardProps) {
  const { startTask, completeTask, selectTask } = useTaskStore()
  
  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await startTask(task.id)
  }
  
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await completeTask(task.id)
  }
  
  return (
    <div
      onClick={() => selectTask(task)}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${priorityColors[task.priority]} p-5 cursor-pointer hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{categoryIcons[task.category]}</span>
            <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
          </div>
          {task.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>
      
      {/* Meta Info */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        {/* XP Reward */}
        <div className="flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{task.xp_reward} XP</span>
        </div>
        
        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
          </div>
        )}
        
        {/* Subtasks */}
        {task.subtask_count && task.subtask_count > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{task.completed_subtasks}/{task.subtask_count} subtasks</span>
          </div>
        )}
        
        {/* Streak */}
        {task.streak_count > 0 && (
          <div className="flex items-center gap-1">
            <TrophyIcon className="w-4 h-4 text-orange-500" />
            <span>{task.streak_count} streak</span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        {task.status === 'PENDING' && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Start Task
          </button>
        )}
        
        {task.status === 'IN_PROGRESS' && (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Complete & Earn {task.xp_reward} XP
          </button>
        )}
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }
  return colors[status] || colors.PENDING
}
```

### 6. Gamification Panel (`components/gamification/GamificationPanel.tsx`)

```typescript
'use client'

import { useTaskStore } from '@/stores/taskStore'
import { AchievementBadge } from './AchievementBadge'
import { ProgressBar } from './ProgressBar'

const levelEmojis: Record<number, string> = {
  1: '🧭',
  2: '✈️',
  3: '⚓',
  4: '🗺️',
  5: '🌍',
  6: '🎖️',
  7: '🏛️',
  8: '👑',
  9: '⭐',
  10: '🌟',
}

export function GamificationPanel() {
  const { progress, achievements, userAchievements } = useTaskStore()
  
  if (!progress) return null
  
  return (
    <div className="p-6 space-y-6">
      {/* Level & XP Display */}
      <div className="text-center">
        <div className="text-7xl mb-3">
          {levelEmojis[progress.current_level] || '🧭'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {progress.level_title}
        </h2>
        <p className="text-gray-600">Level {progress.current_level}</p>
        
        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{progress.total_xp.toLocaleString()} XP</span>
            <span className="text-gray-600">
              {progress.xp_to_next_level.toLocaleString()} XP to next level
            </span>
          </div>
          <ProgressBar 
            value={progress.level_progress_percent} 
            className="h-3 bg-gray-200"
            barClassName="bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
      </div>
      
      {/* Streak Display */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <p className="text-4xl font-bold text-orange-600">
              🔥 {progress.streak_current} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Best Streak</p>
            <p className="text-2xl font-semibold text-gray-900">
              {progress.streak_best} days
            </p>
          </div>
        </div>
      </div>
      
      {/* Today's Progress */}
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Today's Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">Tasks Completed</span>
            <span className="font-bold text-blue-900">
              {progress.tasks_completed_today}
            </span>
          </div>
          
          {progress.tasks_completed_today === 0 && (
            <p className="text-sm text-blue-700 mt-3 p-3 bg-blue-100 rounded-lg">
              ✨ Complete your first task today for <strong>+15 XP</strong> bonus!
            </p>
          )}
          
          {progress.tasks_completed_today > 0 && (
            <p className="text-sm text-blue-700 mt-2">
              🎉 Great job! Keep the momentum going!
            </p>
          )}
        </div>
      </div>
      
      {/* Total Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">
            {progress.tasks_completed_total}
          </p>
          <p className="text-xs text-gray-600">Total Tasks</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">
            {progress.tasks_completed_this_week}
          </p>
          <p className="text-xs text-gray-600">This Week</p>
        </div>
      </div>
      
      {/* Recent Achievements */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Recent Achievements</h3>
        {userAchievements.length > 0 ? (
          <div className="space-y-2">
            {userAchievements.slice(0, 3).map((ua) => (
              <AchievementBadge 
                key={ua.id} 
                achievement={ua.achievement}
                unlockedAt={ua.unlocked_at}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">
            Complete tasks to unlock achievements! 🏆
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## Next Steps for Implementation

1. **Create the file structure** as outlined above
2. **Copy-paste the code** for each component
3. **Install dependencies**:
   ```bash
   pnpm add zustand axios date-fns @heroicons/react
   ```
4. **Test each component** individually
5. **Connect to API** (already running on port 8000)
6. **Style and refine** based on user feedback

---

## Integration Points

### With Aura Companion
- Add Aura suggestions in TaskSidebar
- Show companion messages when completing tasks
- Integrate `/api/tasks/aura/suggestions` endpoint

### With Forge Documents
- Link document tasks to Forge creation
- Track document completion status
- Award XP for document creation

### With CRM
- Sync task completion to Twenty CRM
- Update user profile based on task progress
- Trigger automated emails via Mautic

---

**Status**: Ready to implement  
**Estimated Time**: 3-5 days for full implementation  
**Priority**: HIGH - Core user-facing feature
