import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types based on backend schemas
interface TemporalPreference {
  temporal_preference: number;
  category: string;
  description: string;
  updated_at: string;
}

interface MatchedRoute {
  route_template_id: string;
  route_type: string;
  name_pt: string;
  description_pt: string;
  estimated_duration_months: number;
  match_score: number;
  match_reason: string;
  recommended_temporal_range: [number, number];
}

interface MatchedRoutesResponse {
  matched_routes: MatchedRoute[];
  user_temporal_preference: number;
  total_routes: number;
}

/**
 * Hook para gerenciar preferências temporais e recomendações de rotas
 * 
 * Fornece funcionalidades para:
 * - Buscar preferência temporal do usuário
 * - Buscar rotas recomendadas baseadas na preferência temporal
 * 
 * Requirements: 2.3, 2.5
 */
export const useTemporalMatching = (limit = 10) => {
  // Fetch user's temporal preference
  const preferenceQuery = useQuery({
    queryKey: ['temporal-matching', 'preference'],
    queryFn: async () => {
      const response = await api.get<TemporalPreference>(
        '/temporal-matching/preference'
      );
      return response.data;
    },
  });

  // Fetch matched routes
  const routesQuery = useQuery({
    queryKey: ['temporal-matching', 'routes', limit],
    queryFn: async () => {
      const response = await api.get<MatchedRoutesResponse>(
        `/temporal-matching/routes?limit=${limit}`
      );
      return response.data;
    },
  });

  return {
    // Temporal preference data
    temporalPreference: preferenceQuery.data?.temporal_preference,
    preferenceCategory: preferenceQuery.data?.category,
    preferenceDescription: preferenceQuery.data?.description,
    preferenceUpdatedAt: preferenceQuery.data?.updated_at,

    // Matched routes data
    matchedRoutes: routesQuery.data?.matched_routes || [],
    totalRoutes: routesQuery.data?.total_routes || 0,

    // Loading states
    isLoadingPreference: preferenceQuery.isLoading,
    isLoadingRoutes: routesQuery.isLoading,
    isLoading: preferenceQuery.isLoading || routesQuery.isLoading,

    // Error states
    preferenceError: preferenceQuery.error,
    routesError: routesQuery.error,
    error: preferenceQuery.error || routesQuery.error,

    // Refetch functions
    refetchPreference: preferenceQuery.refetch,
    refetchRoutes: routesQuery.refetch,
    refetchAll: () => {
      preferenceQuery.refetch();
      routesQuery.refetch();
    },
  };
};
