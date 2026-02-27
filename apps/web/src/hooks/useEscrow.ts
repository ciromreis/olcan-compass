import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types based on backend schemas
interface EscrowTransaction {
  id: string;
  booking_id: string;
  amount_held: number;
  currency: string;
  status: 'pending' | 'released' | 'refunded' | 'disputed';
  release_condition: {
    type: string;
    min_improvement?: number;
    [key: string]: any;
  };
  readiness_before: number | null;
  readiness_after: number | null;
  improvement_achieved: number | null;
  created_at: string;
  resolved_at: string | null;
}

interface BookingEscrowStatusResponse {
  booking_id: string;
  has_escrow: boolean;
  escrow: EscrowTransaction | null;
}

interface CreateEscrowRequest {
  booking_id: string;
  amount_held: number;
  currency?: string;
  release_condition: {
    type: string;
    min_improvement?: number;
    [key: string]: any;
  };
}

/**
 * Hook para gerenciar transações de escrow (garantia de resultado)
 * 
 * Fornece funcionalidades para:
 * - Buscar status de escrow por booking ID
 * - Criar nova transação de escrow
 * 
 * Requirements: 4.1, 4.6
 */
export const useEscrow = (bookingId?: string) => {
  const queryClient = useQueryClient();

  // Fetch escrow status for a booking
  const escrowStatusQuery = useQuery({
    queryKey: ['escrow', 'booking', bookingId],
    queryFn: async () => {
      if (!bookingId) {
        throw new Error('Booking ID é obrigatório');
      }
      const response = await api.get<BookingEscrowStatusResponse>(
        `/escrow/booking/${bookingId}`
      );
      return response.data;
    },
    enabled: !!bookingId,
  });

  // Create escrow transaction
  const createEscrow = useMutation({
    mutationFn: async (data: CreateEscrowRequest) => {
      const response = await api.post<EscrowTransaction>('/escrow/create', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the booking's escrow status
      queryClient.invalidateQueries({
        queryKey: ['escrow', 'booking', data.booking_id],
      });
      // Also invalidate any general escrow queries
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });

  return {
    // Escrow status data
    hasEscrow: escrowStatusQuery.data?.has_escrow ?? false,
    escrow: escrowStatusQuery.data?.escrow,
    escrowStatus: escrowStatusQuery.data?.escrow?.status,
    amountHeld: escrowStatusQuery.data?.escrow?.amount_held,
    releaseCondition: escrowStatusQuery.data?.escrow?.release_condition,
    readinessBefore: escrowStatusQuery.data?.escrow?.readiness_before,
    readinessAfter: escrowStatusQuery.data?.escrow?.readiness_after,
    improvementAchieved: escrowStatusQuery.data?.escrow?.improvement_achieved,

    // Loading state
    isLoading: escrowStatusQuery.isLoading,
    error: escrowStatusQuery.error,

    // Create escrow mutation
    createEscrow: createEscrow.mutate,
    createEscrowAsync: createEscrow.mutateAsync,
    isCreating: createEscrow.isPending,
    createError: createEscrow.error,

    // Refetch
    refetch: escrowStatusQuery.refetch,
  };
};
