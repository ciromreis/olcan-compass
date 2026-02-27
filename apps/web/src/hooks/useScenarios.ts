import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

// Types based on backend schemas
interface ScenarioConstraints {
  budget_max: number;
  time_available_months: number;
  skill_level: number;
  target_locations: string[];
  preferred_industries: string[];
}

interface OpportunityScore {
  opportunity_id: string;
  title: string;
  competitiveness_score: number;
  resource_requirements_score: number;
  is_pareto_optimal: boolean;
}

interface FeasibleFrontierResponse {
  simulation_id: string;
  pareto_optimal_opportunities: OpportunityScore[];
  total_opportunities_analyzed: number;
  pareto_count: number;
  calculated_at: string;
}

interface SimulationSummary {
  id: string;
  simulation_name: string | null;
  constraints: ScenarioConstraints;
  pareto_count: number;
  created_at: string;
}

interface SimulationsListResponse {
  simulations: SimulationSummary[];
  total: number;
}

interface TrackDecisionRequest {
  application_id: string;
  opportunity_id: string;
  was_pareto_optimal: boolean;
}

interface TrackDecisionResponse {
  tracked: boolean;
  decision_quality_score: number;
}

// Default constraints
const DEFAULT_CONSTRAINTS: ScenarioConstraints = {
  budget_max: 50000,
  time_available_months: 12,
  skill_level: 70,
  target_locations: [],
  preferred_industries: [],
};

/**
 * Hook para gerenciar simulações de cenários e otimização de oportunidades
 * 
 * Fornece funcionalidades para:
 * - Gerenciar constraints de simulação (budget, tempo, skills, etc.)
 * - Calcular fronteira viável (Pareto-optimal opportunities)
 * - Buscar simulações salvas
 * - Rastrear qualidade de decisões
 * 
 * Requirements: 5.1, 5.3, 5.8
 */
export const useScenarios = () => {
  const [constraints, setConstraints] = useState<ScenarioConstraints>(DEFAULT_CONSTRAINTS);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<number | null>(null);
  const [debouncedConstraints, setDebouncedConstraints] = useState<ScenarioConstraints>(constraints);

  // Debounce constraints changes (500ms delay)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedConstraints(constraints);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [constraints]);

  // Calculate feasible frontier (debounced)
  const frontierQuery = useQuery({
    queryKey: ['scenarios', 'frontier', debouncedConstraints],
    queryFn: async () => {
      const response = await api.post<FeasibleFrontierResponse>(
        '/scenarios/calculate-frontier',
        { constraints: debouncedConstraints }
      );
      return response.data;
    },
    // Only fetch if constraints are valid
    enabled: debouncedConstraints.budget_max > 0 && debouncedConstraints.time_available_months > 0,
  });

  // Fetch user's saved simulations
  const simulationsQuery = useQuery({
    queryKey: ['scenarios', 'simulations'],
    queryFn: async () => {
      const response = await api.get<SimulationsListResponse>('/scenarios/simulations');
      return response.data;
    },
  });

  // Track decision quality
  const trackDecision = useMutation({
    mutationFn: async (data: TrackDecisionRequest) => {
      const response = await api.post<TrackDecisionResponse>(
        '/scenarios/track-decision',
        data
      );
      return response.data;
    },
  });

  // Helper to update individual constraint fields
  const updateConstraint = useCallback(
    <K extends keyof ScenarioConstraints>(key: K, value: ScenarioConstraints[K]) => {
      setConstraints((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Helper to reset constraints to defaults
  const resetConstraints = useCallback(() => {
    setConstraints(DEFAULT_CONSTRAINTS);
  }, []);

  // Pareto-optimal opportunities
  const paretoOptimal = frontierQuery.data?.pareto_optimal_opportunities || [];

  return {
    // Constraints management
    constraints,
    setConstraints,
    updateConstraint,
    resetConstraints,

    // Frontier calculation data
    frontier: frontierQuery.data,
    paretoOptimal,
    paretoCount: frontierQuery.data?.pareto_count || 0,
    totalOpportunitiesAnalyzed: frontierQuery.data?.total_opportunities_analyzed || 0,
    simulationId: frontierQuery.data?.simulation_id,

    // Frontier calculation state
    isCalculating: frontierQuery.isLoading || frontierQuery.isFetching,
    calculationError: frontierQuery.error,

    // Saved simulations data
    simulations: simulationsQuery.data?.simulations || [],
    totalSimulations: simulationsQuery.data?.total || 0,

    // Simulations loading state
    isLoadingSimulations: simulationsQuery.isLoading,
    simulationsError: simulationsQuery.error,

    // Track decision mutation
    trackDecision: trackDecision.mutate,
    trackDecisionAsync: trackDecision.mutateAsync,
    isTrackingDecision: trackDecision.isPending,
    trackDecisionError: trackDecision.error,

    // Refetch functions
    refetchFrontier: frontierQuery.refetch,
    refetchSimulations: simulationsQuery.refetch,
  };
};
