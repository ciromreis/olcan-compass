import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types based on backend schemas
interface VerificationCredential {
  id: string;
  credential_type: string;
  credential_name: string;
  score_value: number;
  issued_at: string;
  expires_at: string | null;
  verification_url: string;
  verification_hash: string;
  is_active: boolean;
  verification_clicks: number;
}

interface CredentialListResponse {
  credentials: VerificationCredential[];
  total: number;
  active_count: number;
}

interface GenerateCredentialRequest {
  credential_type: string;
  score_value: number;
  credential_name?: string;
}

interface TrackUsageRequest {
  application_id: string;
  usage_type?: string;
  shared_with?: string;
}

/**
 * Hook para gerenciar credenciais de verificação do usuário
 * 
 * Fornece funcionalidades para:
 * - Buscar credenciais do usuário
 * - Gerar novas credenciais
 * - Revogar credenciais existentes
 * - Copiar link de verificação
 * 
 * Requirements: 1.1, 1.3, 1.7
 */
export const useCredentials = (includeExpired = false) => {
  const queryClient = useQueryClient();

  // Fetch user credentials
  const credentialsQuery = useQuery({
    queryKey: ['credentials', 'me', includeExpired],
    queryFn: async () => {
      const response = await api.get<CredentialListResponse>(
        `/credentials/me?include_expired=${includeExpired}`
      );
      return response.data;
    },
  });

  // Generate new credential
  const generateCredential = useMutation({
    mutationFn: async (data: GenerateCredentialRequest) => {
      const response = await api.post<VerificationCredential>(
        '/credentials/generate',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', 'me'] });
    },
  });

  // Revoke credential
  const revokeCredential = useMutation({
    mutationFn: async (credentialId: string) => {
      const response = await api.post(`/credentials/${credentialId}/revoke`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', 'me'] });
    },
  });

  // Track credential usage
  const trackUsage = useMutation({
    mutationFn: async ({
      credentialId,
      data,
    }: {
      credentialId: string;
      data: TrackUsageRequest;
    }) => {
      const response = await api.post(
        `/credentials/${credentialId}/track-usage`,
        data
      );
      return response.data;
    },
  });

  // Helper function to copy verification link to clipboard
  const copyVerificationLink = async (verificationUrl: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      return true;
    } catch (error) {
      console.error('Erro ao copiar link de verificação:', error);
      return false;
    }
  };

  // Computed values
  const hasActiveCredential =
    credentialsQuery.data?.active_count && credentialsQuery.data.active_count > 0;

  return {
    // Query data
    credentials: credentialsQuery.data?.credentials || [],
    totalCredentials: credentialsQuery.data?.total || 0,
    activeCount: credentialsQuery.data?.active_count || 0,
    hasActiveCredential,

    // Query state
    isLoading: credentialsQuery.isLoading,
    error: credentialsQuery.error,

    // Mutations
    generateCredential: generateCredential.mutate,
    generateCredentialAsync: generateCredential.mutateAsync,
    isGenerating: generateCredential.isPending,
    generateError: generateCredential.error,

    revokeCredential: revokeCredential.mutate,
    revokeCredentialAsync: revokeCredential.mutateAsync,
    isRevoking: revokeCredential.isPending,
    revokeError: revokeCredential.error,

    trackUsage: trackUsage.mutate,
    trackUsageAsync: trackUsage.mutateAsync,

    // Helper functions
    copyVerificationLink,

    // Refetch
    refetch: credentialsQuery.refetch,
  };
};
