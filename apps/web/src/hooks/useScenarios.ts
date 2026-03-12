import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: () => api.get('/scenarios').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRunScenarioOptimization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { route_id?: string; budget?: number; time_available?: number }) =>
      api.post('/scenarios/optimize', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
