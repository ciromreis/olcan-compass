/**
 * Canonical Companion Store (v2.5)
 *
 * This is the single source of truth for companion/aura state.
 * Legacy stores like `companionStore.ts` and `realCompanionStore.ts` are deprecated.
 */

export {
  useAuraStore,
  useAura,
  useCareStreak,
  useEvolutionProgress,
  useCanPerformCare,
  useCanonicalCompanionStore,
  useCompanionStore,
} from "./auraStore";

export type {
  Aura,
  AuraEvent,
  AuraEventType,
  CareActivityType,
  EvolutionStage,
  ArchetypeType,
} from "./auraStore";

