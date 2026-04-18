import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScenarioConstraints {
  budget_max: number;
  time_available_months: number;
  skill_level: number;
  target_locations: string[];
  preferred_industries: string[];
}

export interface ScenarioSimulation {
  id: string;
  simulation_name: string | null;
  constraints: ScenarioConstraints;
  pareto_count: number;
  created_at: string;
}

interface ScenariosState {
  constraints: ScenarioConstraints;
  simulations: ScenarioSimulation[];
  currentSimulationId: string | null;
  isLoading: boolean;
  error: Error | null;
  setConstraints: (constraints: ScenarioConstraints) => void;
  updateConstraint: <K extends keyof ScenarioConstraints>(
    key: K,
    value: ScenarioConstraints[K]
  ) => void;
  resetConstraints: () => void;
  setSimulations: (simulations: ScenarioSimulation[]) => void;
  setCurrentSimulationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const DEFAULT_CONSTRAINTS: ScenarioConstraints = {
  budget_max: 50000,
  time_available_months: 12,
  skill_level: 70,
  target_locations: [],
  preferred_industries: [],
};

export const useScenariosStore = create<ScenariosState>()(
  persist(
    (set) => ({
      constraints: DEFAULT_CONSTRAINTS,
      simulations: [],
      currentSimulationId: null,
      isLoading: false,
      error: null,
      setConstraints: (constraints) => set({ constraints }),
      updateConstraint: (key, value) =>
        set((state) => ({
          constraints: { ...state.constraints, [key]: value },
        })),
      resetConstraints: () => set({ constraints: DEFAULT_CONSTRAINTS }),
      setSimulations: (simulations) => set({ simulations }),
      setCurrentSimulationId: (id) => set({ currentSimulationId: id }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          constraints: DEFAULT_CONSTRAINTS,
          simulations: [],
          currentSimulationId: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'scenarios-storage',
    }
  )
);
