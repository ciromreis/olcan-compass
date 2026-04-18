/**
 * Task Management System - TypeScript Type Definitions
 */

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

export type AchievementCategory = 
  | 'FIRST_STEPS' 
  | 'CONSISTENCY' 
  | 'MASTERY' 
  | 'SOCIAL' 
  | 'SPEED' 
  | 'SPECIAL'

// ============================================================
// Core Task Types
// ============================================================

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
  task_metadata?: Record<string, unknown>
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

// ============================================================
// Gamification Types
// ============================================================

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
  unlock_condition: Record<string, unknown>
  category: AchievementCategory
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

// ============================================================
// API Response Types
// ============================================================

export interface TaskListResponse {
  tasks: Task[]
  total: number
  filters_applied: Record<string, unknown>
}

export interface TaskCompleteResponse {
  task: Task
  xp_earned: number
  total_xp: number
  level_up: boolean
  new_level?: number
  level_title?: string
  streak_updated: boolean
  new_streak: number
  achievements_unlocked: UserAchievement[]
  quests_updated?: { name?: string; completed?: boolean; xp_reward?: number; progress?: number; target?: number; progress_percentage?: number }[]
}

export interface TaskStartResponse {
  task: Task
  message: string
}

export interface TaskStatistics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  completion_rate: number
  avg_completion_time_hours?: number
  tasks_by_category: Record<string, number>
  tasks_by_priority: Record<string, number>
  tasks_completed_today: number
  tasks_completed_this_week: number
  tasks_completed_this_month: number
  current_streak: number
  best_streak: number
}

export interface AchievementListResponse {
  achievements: Achievement[]
  total: number
}

export interface UserAchievementListResponse {
  unlocked: UserAchievement[]
  locked: Achievement[]
  total_unlocked: number
  total_locked: number
}

// ============================================================
// Request Types
// ============================================================

export interface TaskCreateRequest {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  due_date?: string
  estimated_hours?: number
  route_id?: string
  notes?: string
  task_metadata?: Record<string, unknown>
  subtasks?: string[]
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string
  estimated_hours?: number
  notes?: string
  task_metadata?: Record<string, unknown>
}

export interface TaskFilters {
  status?: TaskStatus
  category?: TaskCategory
  priority?: TaskPriority
  search?: string
  due_date_from?: string
  due_date_to?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// ============================================================
// UI Types
// ============================================================

export interface TaskCardProps {
  task: Task
  onComplete?: (taskId: string) => void
  onStart?: (taskId: string) => void
  onSelect?: (task: Task) => void
}

export interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onSelectTask: (task: Task) => void
}

export interface GamificationPanelProps {
  progress: UserProgress
  achievements: UserAchievement[]
  statistics?: TaskStatistics
}

// ============================================================
// Constants
// ============================================================

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  DOCUMENTATION: 'Documentação',
  LANGUAGE: 'Idiomas',
  FINANCE: 'Finanças',
  HOUSING: 'Moradia',
  NETWORKING: 'Networking',
  INTERVIEW: 'Entrevistas',
  VISA: 'Vistos e Imigração',
  CULTURAL_PREP: 'Preparação Cultural',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  EMPLOYMENT: 'Emprego',
  CUSTOM: 'Personalizado',
}

export const TASK_CATEGORY_ICON_NAMES: Record<TaskCategory, string> = {
  DOCUMENTATION: 'FileText',
  LANGUAGE: 'Globe',
  FINANCE: 'DollarSign',
  HOUSING: 'Home',
  NETWORKING: 'Users',
  INTERVIEW: 'Mic',
  VISA: 'Stamp',
  CULTURAL_PREP: 'Palette',
  HEALTH: 'Heart',
  EDUCATION: 'GraduationCap',
  EMPLOYMENT: 'Briefcase',
  CUSTOM: 'PenLine',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  CRITICAL: 'Crítico',
  HIGH: 'Alto',
  MEDIUM: 'Médio',
  LOW: 'Baixo',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  CRITICAL: 'border-l-rose-500 bg-rose-50',
  HIGH: 'border-l-slate-500 bg-slate-50',
  MEDIUM: 'border-l-brand-500 bg-brand-50',
  LOW: 'border-l-emerald-500 bg-emerald-50',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  BLOCKED: 'Bloqueada',
  CANCELLED: 'Cancelada',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-brand-100 text-brand-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  BLOCKED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

