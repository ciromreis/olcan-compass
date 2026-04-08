/**
 * Alias canônico de compatibilidade para a Aura.
 *
 * A store oficial é `auraStore.ts`.
 * Este arquivo existe para preservar imports antigos durante a migração.
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
