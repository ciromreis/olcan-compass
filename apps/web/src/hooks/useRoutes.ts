import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouteStore, Route } from '@/store/route';

type RawRouteTemplate = {
  id: string;
  name_pt?: string;
  name_en?: string;
  description_pt?: string;
  description_en?: string;
  route_type?: string;
  estimated_duration_months?: number;
  competitiveness_level?: 'low' | 'medium' | 'high' | string;
};

type RawMilestone = {
  id: string;
  route_id: string;
  user_notes?: string;
  completion_notes?: string;
  due_date?: string;
  status?: string;
  completed_at?: string;
  name_pt?: string;
  name_en?: string;
  description_pt?: string;
  description_en?: string;
  category?: string;
  display_order?: number;
  estimated_days?: number;
  required_evidence?: string[];
  is_required?: boolean;
};

type RawRoute = {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  notes?: string;
  status?: string;
  completion_percentage?: number;
  created_at: string;
  updated_at: string;
};

const normalizeTemplate = (template: RawRouteTemplate) => ({
  id: String(template.id),
  name: template.name_pt || template.name_en || 'Template',
  description: template.description_pt || template.description_en || '',
  destination_country: template.route_type || 'global',
  milestone_count: template.estimated_duration_months || 0,
  estimated_duration_months: template.estimated_duration_months || 0,
  difficulty: template.competitiveness_level === 'high'
    ? 'advanced'
    : template.competitiveness_level === 'medium'
      ? 'intermediate'
      : 'beginner',
});

const normalizeRoute = (route: RawRoute, milestones: RawMilestone[] = []): Route => ({
  id: String(route.id),
  user_id: String(route.user_id),
  template_id: route.template_id ? String(route.template_id) : undefined,
  name: route.name,
  description: route.notes || undefined,
  status: route.status === 'completed' ? 'completed' : route.status === 'paused' ? 'paused' : 'active',
  progress_percentage: route.completion_percentage || 0,
  milestones: milestones.map((milestone: RawMilestone, index: number) => ({
    id: String(milestone.id),
    route_id: String(milestone.route_id),
    title: milestone.name_pt || milestone.name_en || `Marco ${index + 1}`,
    description: milestone.description_pt || milestone.description_en || milestone.user_notes || milestone.completion_notes || undefined,
    target_date: milestone.due_date || undefined,
    completed: milestone.status === 'completed',
    completed_at: milestone.completed_at || undefined,
    order_index: milestone.display_order ?? index,
    category: milestone.category,
    estimated_days: milestone.estimated_days,
    required_evidence: milestone.required_evidence,
    is_required: milestone.is_required,
    user_notes: milestone.user_notes,
    status: milestone.status,
  })),
  created_at: route.created_at,
  updated_at: route.updated_at,
});

export const useRouteTemplates = () => {
  return useQuery({
    queryKey: ['routes', 'templates'],
    queryFn: async () => {
      const response = await api.get('/routes/templates');
      const templates = response.data?.templates ?? [];
      return templates.map(normalizeTemplate);
    },
  });
};

export const useRouteTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['routes', 'templates', templateId],
    queryFn: async () => {
      const response = await api.get('/routes/templates');
      const templates = (response.data?.templates ?? []).map(normalizeTemplate);
      return templates.find((template: { id: string }) => template.id === templateId) ?? null;
    },
    enabled: !!templateId,
  });
};

export const useUserRoutes = () => {
  const { setRoutes } = useRouteStore();

  const query = useQuery({
    queryKey: ['routes', 'user'],
    queryFn: async () => {
      const response = await api.get('/routes');
      const routes = response.data?.routes ?? [];
      const detailResponses = await Promise.all(
        routes.map(async (route: RawRoute) => {
          const detail = await api.get(`/routes/${route.id}`);
          return normalizeRoute(detail.data?.route || route, detail.data?.milestones || []);
        })
      );
      return detailResponses;
    },
  });

  useEffect(() => {
    if (query.data) {
      setRoutes(query.data);
    }
  }, [query.data, setRoutes]);

  return query;
};

export const useRoute = (routeId: string) => {
  const { setCurrentRoute } = useRouteStore();

  const query = useQuery({
    queryKey: ['routes', routeId],
    queryFn: async () => {
      const response = await api.get(`/routes/${routeId}`);
      return normalizeRoute(response.data?.route, response.data?.milestones || []);
    },
    enabled: !!routeId,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentRoute(query.data);
    }
  }, [query.data, setCurrentRoute]);

  return query;
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { template_id: string; name?: string }) => {
      const response = await api.post('/routes', {
        ...data,
        name: data.name || 'Minha Rota',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', 'user'] });
    },
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  const { updateMilestone } = useRouteStore();

  return useMutation({
    mutationFn: async (data: {
      routeId: string;
      milestoneId: string;
      updates: { completed?: boolean; target_date?: string };
    }) => {
      const payload: { status?: string; due_date?: string } = {};
      if (data.updates.completed !== undefined) {
        payload.status = data.updates.completed ? 'completed' : 'in_progress';
      }
      if (data.updates.target_date) {
        payload.due_date = data.updates.target_date;
      }

      const response = await api.patch(
        `/routes/milestones/${data.milestoneId}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      updateMilestone(variables.milestoneId, variables.updates);
      queryClient.invalidateQueries({ queryKey: ['routes', variables.routeId] });
    },
  });
};

// Aggregate hook for convenience
export const useRoutes = () => {
  const templatesQuery = useRouteTemplates();
  const routesQuery = useUserRoutes();
  const createRoute = useCreateRoute();
  const updateMilestone = useUpdateMilestone();

  return {
    templates: templatesQuery.data,
    routes: routesQuery.data,
    isLoading: templatesQuery.isLoading || routesQuery.isLoading,
    error: templatesQuery.error || routesQuery.error,
    createRoute: createRoute.mutate,
    createRouteAsync: createRoute.mutateAsync,
    updateMilestone: updateMilestone.mutate,
    createRouteFromTemplate: createRoute.mutate,
    createRouteFromTemplateAsync: createRoute.mutateAsync,
  };
};
