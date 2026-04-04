/**
 * Gamification Components Index
 * 
 * Central export point for all gamification-related components.
 * This makes imports cleaner and provides a single source of truth.
 * 
 * Usage:
 * ```tsx
 * import { 
 *   GamificationIntegration, 
 *   AchievementShowcase,
 *   QuestDashboard 
 * } from '@/components/gamification'
 * ```
 */

// Integration & System
export { GamificationIntegration, useProductGamification, useGamificationEvents, GamificationDebugger } from './GamificationIntegration'
export { CelebrationToastContainer, LevelUpModal, AchievementModal } from './CelebrationSystem'

// Showcase Components
export { AchievementShowcase } from './AchievementShowcase'
export { QuestDashboard } from './QuestDashboard'
export { StreakVisualizer, StreakBadge, StreakCalendar } from './StreakVisualizer'
export { Leaderboard, LeaderboardPreview } from './Leaderboard'

// Types (re-exported for convenience)
export type { GamificationEvent, GamificationEventType } from '@/stores/eventDrivenGamificationStore'
export type { Toast, ToastType } from './CelebrationSystem'
