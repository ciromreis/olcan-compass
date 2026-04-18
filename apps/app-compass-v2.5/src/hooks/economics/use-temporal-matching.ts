import { useState, useCallback } from 'react';

// Simplified hook for Temporal Matching
export function useTemporalMatching() {
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<unknown[]>([]);

  const calculateMatches = useCallback(async (_profileData: Record<string, unknown>) => {
    setIsMatching(true);
    try {
      // Mock calculate
      await new Promise(r => setTimeout(r, 600));
      setMatches([]);
    } finally {
      setIsMatching(false);
    }
  }, []);

  return { matches, isMatching, calculateMatches };
}
