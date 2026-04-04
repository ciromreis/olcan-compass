/**
 * Stores Index - v2.5
 * 
 * This file provides a single import point for all canonical stores.
 * Use this instead of importing directly from individual store files.
 * 
 * Usage:
 * ```tsx
 * import { 
 *   useAuraStore,
 *   useGamificationStore,
 *   useAura,
 *   useUserProgress 
 * } from '@/stores'
 * ```
 */

// Aura Store (Metamodern v2.5)
export {
  useAuraStore,
  useAura,
  useCareStreak,
  useEvolutionProgress,
  useCanPerformCare,
  type Aura,
  type AuraEvent,
  type AuraEventType,
  type CareActivityType,
  type EvolutionStage,
  type ArchetypeType,
} from './auraStore'

// Event-Driven Gamification Store
export {
  useGamificationStore,
  useUserProgress,
  useAchievements,
  useUnlockedAchievements,
  useAvailableQuests,
  useCurrentStreakMultiplier,
  type Achievement,
  type Quest,
  type QuestType,
  type AchievementCategory,
  type AchievementRarity,
  type GamificationEvent,
  type GamificationEventType,
  CANONICAL_ACHIEVEMENTS,
} from './eventDrivenGamificationStore'

// Deprecation Aliases for Branding Migration
/**
 * @deprecated Use useAuraStore instead.
 */
export { useAuraStore as useCanonicalCompanionStore } from './auraStore'
export { useAuraStore as useCompanionStore } from './auraStore'
export { useAura as useCompanion } from './auraStore'
