import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuraArchetype =
  | "Pioneer"
  | "Strategist"
  | "Architect"
  | "Alchemist"
  | "Guardian"
  | "Diplomat"
  | "Scholar"
  | "Maverick"
  | "Catalyst"
  | "Sage"
  | "Visionary"
  | "Executor";

export type FearCluster =
  | "Fear_of_Failure"
  | "Fear_of_Insignificance"
  | "Fear_of_Loss_of_Control"
  | "Fear_of_Rejection";

export interface ArchetypeMetadata {
  id: AuraArchetype;
  name: string;
  description: string;
  motivators: string[];
  strengths: string[];
  color: string;
}

export const ARCHETYPES_DB: Record<AuraArchetype, ArchetypeMetadata> = {
  Pioneer: { id: "Pioneer", name: "O Pioneiro", description: "Desbrava o desconhecido com coragem e iniciativa.", motivators: ["Inovação", "Primeiro a agir"], strengths: ["Ousadia", "Visão de fronteira"], color: "text-brand-500" },
  Strategist: { id: "Strategist", name: "O Estrategista", description: "Analisa cenários complexos e otimiza rotas.", motivators: ["Eficiência", "Vantagem competitiva"], strengths: ["Visão sistêmica", "Planejamento longo prazo"], color: "text-sage-500" },
  Architect: { id: "Architect", name: "O Arquiteto", description: "Constrói sistemas duradouros e estruturados.", motivators: ["Estabilidade", "Fundamentos sólidos"], strengths: ["Organização", "Implementação metodológica"], color: "text-slate-500" },
  Alchemist: { id: "Alchemist", name: "O Alquimista", description: "Transforma recursos comuns em valor extraordinário.", motivators: ["Transformação", "Sinergia"], strengths: ["Adaptabilidade", "Otimização de valor"], color: "text-amber-500" },
  Guardian: { id: "Guardian", name: "O Guardião", description: "Protege o valor criado e mitiga riscos.", motivators: ["Segurança", "Gestão de risco"], strengths: ["Atenção ao detalhe", "Consistência"], color: "text-moss-500" },
  Diplomat: { id: "Diplomat", name: "O Diplomata", description: "Navega redes de relacionamento com maestria.", motivators: ["Conexão", "Influência indireta"], strengths: ["Empatia tática", "Negociação colaborativa"], color: "text-sky-500" },
  Scholar: { id: "Scholar", name: "O Estudioso", description: "Acumula conhecimento profundo e expertise técnica.", motivators: ["Maestria", "Especialização"], strengths: ["Rigor acadêmico", "Análise profunda"], color: "text-indigo-500" },
  Maverick: { id: "Maverick", name: "O Maverick", description: "Desafia o status quo e encontra atalhos não convencionais.", motivators: ["Liberdade", "Ruptura"], strengths: ["Pensamento lateral", "Velocidade"], color: "text-red-500" },
  Catalyst: { id: "Catalyst", name: "O Catalisador", description: "Acelera reações e alavanca o potencial alheio.", motivators: ["Impacto", "Velocidade"], strengths: ["Energia inspiracional", "Empurrão inicial"], color: "text-orange-500" },
  Sage: { id: "Sage", name: "O Sábio", description: "Fornece perspectiva ampla e sabedoria destilada.", motivators: ["Significado", "Legado"], strengths: ["Julgamento calibrado", "Paciência estratégica"], color: "text-purple-500" },
  Visionary: { id: "Visionary", name: "O Visionário", description: "Vê o futuro antes dos outros e direciona a bússola.", motivators: ["O Amanhã", "Inspiração"], strengths: ["Imaginação", "Direção abstrata"], color: "text-violet-500" },
  Executor: { id: "Executor", name: "O Executor", description: "Garante que a visão se torne realidade tática.", motivators: ["Conclusão", "Métricas alcançadas"], strengths: ["Foco cirúrgico", "Disciplina operacional"], color: "text-emerald-500" },
};

export const FEAR_CLUSTER_DB: Record<FearCluster, string> = {
  Fear_of_Failure: "Medo de Falhar (Ruptura Tática)",
  Fear_of_Insignificance: "Medo da Insignificância (Ausência de Legado)",
  Fear_of_Loss_of_Control: "Medo da Perda de Controle (Caos Estrutural)",
  Fear_of_Rejection: "Medo da Rejeição (Exclusão da Tribo)",
};

interface Momentum {
  currentStreak: number;
  longestStreak: number;
  inactiveDays: number;
  lastActivity: string;
}

interface NudgeStore {
  // Gamification State
  archetype: AuraArchetype | null;
  fearCluster: FearCluster | null;
  evolutionStage: number; // 1-3
  kineticEnergy: number; // 0-100
  momentum: Momentum;

  // Actions
  setGamificationState: (state: Partial<Pick<NudgeStore, "archetype" | "fearCluster" | "evolutionStage" | "kineticEnergy">>) => void;
  updateActivity: () => void;
  reset: () => void;

  // Computed
  getArchetypeData: () => ArchetypeMetadata | null;
  getFearClusterName: () => string | null;
}

const DEFAULT_MOMENTUM: Momentum = {
  currentStreak: 0,
  longestStreak: 0,
  inactiveDays: 0,
  lastActivity: new Date().toISOString(),
};

export const useNudgeStore = create<NudgeStore>()(
  persist(
    (set, get) => ({
      archetype: null,
      fearCluster: null,
      evolutionStage: 1,
      kineticEnergy: 0,
      momentum: DEFAULT_MOMENTUM,

      setGamificationState: (newState) => {
        set((state) => ({ ...state, ...newState }));
      },

      updateActivity: () => {
        const state = get();
        const now = new Date();
        const lastActivity = new Date(state.momentum.lastActivity);
        const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        const newMomentum: Momentum = {
          ...state.momentum,
          lastActivity: now.toISOString(),
          inactiveDays: daysSinceLastActivity,
          currentStreak: daysSinceLastActivity === 0 ? state.momentum.currentStreak + 1 : 1,
          longestStreak: Math.max(state.momentum.longestStreak, daysSinceLastActivity === 0 ? state.momentum.currentStreak + 1 : 1)
        };

        set({ momentum: newMomentum });
      },

      reset: () => {
        set({
          archetype: null,
          fearCluster: null,
          evolutionStage: 1,
          kineticEnergy: 0,
          momentum: DEFAULT_MOMENTUM,
        });
      },

      getArchetypeData: () => {
        const { archetype } = get();
        return archetype ? ARCHETYPES_DB[archetype] : null;
      },

      getFearClusterName: () => {
        const { fearCluster } = get();
        return fearCluster ? FEAR_CLUSTER_DB[fearCluster] : null;
      }
    }),
    {
      name: 'nudge-store-v2', // v2 to avoid conflicts with old storage
      partialize: (state) => ({
        archetype: state.archetype,
        fearCluster: state.fearCluster,
        evolutionStage: state.evolutionStage,
        kineticEnergy: state.kineticEnergy,
        momentum: state.momentum,
      })
    }
  )
);
