import { useState, useCallback } from 'react';

// Simplified hook for Economics Scenarios
export function useScenarios() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const runSimulation = useCallback(async (baseParameters: any) => {
    setIsSimulating(true);
    try {
      // Mock simulation
      await new Promise(r => setTimeout(r, 600));
      setScenarios([
        { id: '1', name: 'Conservador', projectedValue: 10000 },
        { id: '2', name: 'Agressivo', projectedValue: 20000 },
      ]);
    } finally {
      setIsSimulating(false);
    }
  }, []);

  return { scenarios, isSimulating, runSimulation };
}
