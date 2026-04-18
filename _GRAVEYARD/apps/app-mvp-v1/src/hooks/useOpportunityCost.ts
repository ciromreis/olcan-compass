import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types based on backend schemas
interface MomentumResponse {
  momentum_score: number;
  category: string;
  milestones_completed_30d: number;
  should_show_widget: boolean;
  last_check: string;
}

interface TrackImpressionRequest {
  opportunity_id?: string;
  opportunity_cost_shown: number;
  session_id?: string;
}

interface TrackClickRequest {
  opportunity_id?: string;
  session_id?: string;
}

interface TrackConversionRequest {
  upgrade_tier: 'pro' | 'premium';
  conversion_value: number;
  session_id?: string;
}

interface WidgetEventResponse {
  event_id: string;
  tracked_at: string;
  conversion_attributed?: boolean;
}

/**
 * Hook para gerenciar custo de oportunidade e momentum do usuário
 * 
 * Fornece funcionalidades para:
 * - Buscar score de momentum do usuário
 * - Verificar se deve exibir widget de crescimento
 * - Rastrear impressões, cliques e conversões do widget
 * 
 * Requirements: 3.3, 3.5, 3.6, 3.7
 */
export const useOpportunityCost = () => {
  const queryClient = useQueryClient();

  // Fetch user momentum score
  const momentumQuery = useQuery({
    queryKey: ['opportunity-cost', 'momentum'],
    queryFn: async () => {
      const response = await api.get<MomentumResponse>('/opportunity-cost/momentum');
      return response.data;
    },
    // Refetch every 5 minutes to keep momentum fresh
    staleTime: 5 * 60 * 1000,
  });

  // Derived query for widget display flag
  const shouldShowWidget = momentumQuery.data?.should_show_widget ?? false;

  // Track widget impression
  const trackImpression = useMutation({
    mutationFn: async (data: TrackImpressionRequest) => {
      const response = await api.post<WidgetEventResponse>(
        '/opportunity-cost/widget/impression',
        data
      );
      return response.data;
    },
  });

  // Track widget click
  const trackClick = useMutation({
    mutationFn: async (data: TrackClickRequest) => {
      const response = await api.post<WidgetEventResponse>(
        '/opportunity-cost/widget/click',
        data
      );
      return response.data;
    },
  });

  // Track conversion (upgrade)
  const trackConversion = useMutation({
    mutationFn: async (data: TrackConversionRequest) => {
      const response = await api.post<WidgetEventResponse>(
        '/opportunity-cost/widget/conversion',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate momentum after conversion to refresh widget state
      queryClient.invalidateQueries({ queryKey: ['opportunity-cost', 'momentum'] });
    },
  });

  return {
    // Momentum data
    momentum: momentumQuery.data?.momentum_score,
    momentumCategory: momentumQuery.data?.category,
    milestonesCompleted30d: momentumQuery.data?.milestones_completed_30d,
    shouldShowWidget,
    lastCheck: momentumQuery.data?.last_check,

    // Loading state
    isLoadingMomentum: momentumQuery.isLoading,
    momentumError: momentumQuery.error,

    // Tracking mutations
    trackImpression: trackImpression.mutate,
    trackImpressionAsync: trackImpression.mutateAsync,
    isTrackingImpression: trackImpression.isPending,

    trackClick: trackClick.mutate,
    trackClickAsync: trackClick.mutateAsync,
    isTrackingClick: trackClick.isPending,

    trackConversion: trackConversion.mutate,
    trackConversionAsync: trackConversion.mutateAsync,
    isTrackingConversion: trackConversion.isPending,

    // Refetch
    refetchMomentum: momentumQuery.refetch,
  };
};
