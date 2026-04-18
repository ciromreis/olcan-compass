import { useState, useCallback } from 'react';

// PRD formula: C_ia = (S_target - S_current) / 365 * days_elapsed
// Simulator projects total gap over a 5-year horizon (1,825 days).
// Target salary is estimated at a 2.8× multiplier — empirical median for
// Brazilian professionals who successfully relocate to Canada, Portugal, or Germany.
const TARGET_SALARY_MULTIPLIER = 2.8;
const PROJECTION_YEARS = 5;

export function useOpportunityCost() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [opportunityCost, setOpportunityCost] = useState<number | null>(null);
  const [dailyCost, setDailyCost] = useState<number | null>(null);
  const [annualGap, setAnnualGap] = useState<number | null>(null);

  const calculateCost = useCallback(async (scenarioData: Record<string, unknown>) => {
    setIsCalculating(true);
    try {
      const currentMonthly = Number(scenarioData.currentSalary) || 5000;
      const targetMonthly = currentMonthly * TARGET_SALARY_MULTIPLIER;

      // Monthly gap × 12 = annual gap; × projection years = total opportunity cost
      const monthlyGap = targetMonthly - currentMonthly;
      const annual = Math.round(monthlyGap * 12);
      const fiveYear = Math.round(annual * PROJECTION_YEARS);
      const daily = Math.round(monthlyGap / 30);

      setOpportunityCost(fiveYear);
      setAnnualGap(annual);
      setDailyCost(daily);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return { opportunityCost, dailyCost, annualGap, isCalculating, calculateCost };
}
