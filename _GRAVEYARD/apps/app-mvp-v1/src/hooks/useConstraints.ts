import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ConstraintProfile {
  id: string;
  user_id: string;
  budget_max?: number;
  time_available_months?: number;
  weekly_bandwidth_hours?: number;
  languages: Array<{ code: string; level: string; name?: string }>;
  target_countries: string[];
  excluded_countries: string[];
  education_level?: string;
  years_experience?: number;
  visa_status?: string;
  citizenship_countries: string[];
  commitment_level: string;
  risk_tolerance: string;
  is_active: boolean;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PruningExplanation {
  title: string;
  detail: string;
  violations: Array<{
    type: string;
    reason: string;
    details: Record<string, any>;
    severity: string;
  }>;
  is_pruned: boolean;
}

export interface PrunedOpportunity {
  id: string;
  title: string;
  organization_name?: string;
  location_country?: string;
  opportunity_type: string;
  is_pruned: boolean;
  overall_score: number;
  constraint_score: number;
  explanation: PruningExplanation;
}

export interface PruningResponse {
  opportunities: PrunedOpportunity[];
  total_opportunities: number;
  shown_opportunities: number;
  hidden_opportunities: number;
  pruning_version: string;
}

// Constraint profile hooks
export const useConstraintProfile = () => {
  return useQuery({
    queryKey: ['constraints', 'profile'],
    queryFn: async () => {
      const response = await api.get('/constraints/profile');
      return response.data as ConstraintProfile;
    },
  });
};

export const useUpdateConstraintProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<ConstraintProfile>) => {
      const response = await api.put('/constraints/profile', profile);
      return response.data as ConstraintProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constraints', 'profile'] });
    },
  });
};

// Pruning hooks
export const usePrunedOpportunities = () => {
  return useQuery({
    queryKey: ['constraints', 'pruned-opportunities'],
    queryFn: async () => {
      const response = await api.post('/constraints/prune-opportunities');
      return response.data as PruningResponse;
    },
  });
};

export const usePruningHistory = (limit: number = 50) => {
  return useQuery({
    queryKey: ['constraints', 'pruning-history', limit],
    queryFn: async () => {
      const response = await api.get(`/constraints/pruning-history?limit=${limit}`);
      return response.data;
    },
  });
};

export const usePruningFeedback = () => {
  return useMutation({
    mutationFn: async ({
      pruning_log_id,
      feedback_type,
      feedback_detail
    }: {
      pruning_log_id: string;
      feedback_type: string;
      feedback_detail?: string;
    }) => {
      const response = await api.post('/constraints/feedback', {
        pruning_log_id,
        feedback_type,
        feedback_detail,
      });
      return response.data;
    },
  });
};
