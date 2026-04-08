/**
 * @deprecated Compatibilidade legada.
 * Use `@/stores/auraStore` como fonte canônica.
 *
 * O antigo "realCompanionStore" foi substituído pela store de Aura.
 */

export {
  useAuraStore as useRealCompanionStore,
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
