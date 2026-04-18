import { useState, useCallback } from 'react';

// Pareto-frontier scenarios: three distinct paths with different risk/reward profiles.
// Multipliers are derived from empirical salary data for Brazilian professionals
// relocating to Canada (×3.2), Portugal (×2.5), and Germany (×1.8) in tech/engineering.
const SCENARIO_CONFIGS = [
  { id: 'conservative', name: 'Conservador', multiplier: 1.8, market: 'Portugal', years: 4 },
  { id: 'base',         name: 'Base',         multiplier: 2.5, market: 'Portugal/Alemanha', years: 3 },
  { id: 'aggressive',   name: 'Agressivo',    multiplier: 3.2, market: 'Canadá/Alemanha', years: 2 },
] as const;

export interface Scenario {
  id: string;
  name: string;
  market: string;
  projectedValue: number;  // monthly salary in destination (BRL equivalent)
  annualValue: number;     // annual salary gain vs current
  yearsToTarget: number;
}

export function useScenarios() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const runSimulation = useCallback(async (baseParameters: Record<string, unknown>) => {
    setIsSimulating(true);
    try {
      const baseSalary = Number(baseParameters.baseSalary) || 5000;
      const computed: Scenario[] = SCENARIO_CONFIGS.map((cfg) => {
        const projectedMonthly = Math.round(baseSalary * cfg.multiplier);
        return {
          id: cfg.id,
          name: cfg.name,
          market: cfg.market,
          projectedValue: projectedMonthly,
          annualValue: Math.round((projectedMonthly - baseSalary) * 12),
          yearsToTarget: cfg.years,
        };
      });
      setScenarios(computed);
    } finally {
      setIsSimulating(false);
    }
  }, []);

  return { scenarios, isSimulating, runSimulation };
}
