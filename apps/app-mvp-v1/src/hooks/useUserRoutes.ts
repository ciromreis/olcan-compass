import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Route, RouteMilestone } from '@/store/route';

export function useUserRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: () => api.get<{ routes: Route[]; total: number }>('/routes').then((res) => res.data.routes),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      api.post<Route>('/routes', { template_id: templateId }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Route> }) =>
      api.patch<Route>(`/routes/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.id] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, milestoneId, status }: { routeId: string; milestoneId: string; status: string }) =>
      api.patch(`/routes/${routeId}/milestones/${milestoneId}`, { status }).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
