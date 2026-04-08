/**
 * @deprecated Compatibilidade legada.
 * Use `@/stores/auraStore` ou `@/stores/canonicalCompanionStore`.
 *
 * Este arquivo existe apenas para evitar imports quebrados de trilhas antigas.
 */

export {
  useAuraStore as useCompanionStore,
  useAura as useCompanion,
  useCareStreak,
  useEvolutionProgress,
  useCanPerformCare,
} from "./auraStore";

export type {
  Aura as Companion,
  AuraEvent,
  AuraEventType,
  CareActivityType,
  EvolutionStage,
  ArchetypeType as CompanionType,
} from "./auraStore";
