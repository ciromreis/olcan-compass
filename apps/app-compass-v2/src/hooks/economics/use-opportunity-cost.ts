import { useState, useCallback } from 'react';

// Simplified hook for Opportunity Cost
export function useOpportunityCost() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [opportunityCost, setOpportunityCost] = useState<number | null>(null);

  const calculateCost = useCallback(async (scenarioData: any) => {
    setIsCalculating(true);
    try {
      // Mock calculate
      await new Promise(r => setTimeout(r, 400));
      setOpportunityCost(15000); // Mock value
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return { opportunityCost, isCalculating, calculateCost };
}
