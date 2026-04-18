import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type RawReadinessAssessment = {
  id: string;
  user_id: string;
  route_id?: string | null;
  overall_readiness: number;
  dimension_scores?: Record<string, number>;
  notes?: string | null;
  created_at: string;
};

type RawUrgentTask = {
  id: string;
  sprint_id: string;
  title: string;
  status?: string;
  due_date?: string | null;
  estimated_minutes?: number | null;
};

type RawReadinessOverview = {
  latest_assessment?: RawReadinessAssessment | null;
  open_gaps?: number;
  critical_gaps?: number;
  resolved_gaps?: number;
  active_sprints?: number;
  sprints_completed_this_month?: number;
  recommended_next_sprints?: unknown[];
  urgent_tasks?: RawUrgentTask[];
};

type RawSprintTemplate = {
  id: string;
  name: string;
  description?: string;
  target_gap_category?: string;
  duration_days?: number;
  default_tasks?: unknown[];
};

type RawSprintTask = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  display_order?: number;
  prerequisite_task_ids?: string[];
  user_notes?: string;
  completion_notes?: string;
  estimated_minutes?: number;
};

type RawSprint = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  total_tasks?: number;
  completed_tasks?: number;
  completion_percentage?: number;
  tasks?: RawSprintTask[];
};

const normalizeSprintTemplate = (template: RawSprintTemplate) => ({
  id: String(template.id),
  name: template.name,
  description: template.description,
  gap_category: template.target_gap_category,
  duration_days: template.duration_days,
  duration_weeks: Math.max(1, Math.round((template.duration_days || 7) / 7)),
  task_count: Array.isArray(template.default_tasks) ? template.default_tasks.length : 0,
});

const normalizeSprint = (sprint: RawSprint) => ({
  id: String(sprint.id),
  name: sprint.name,
  description: sprint.description,
  status: sprint.status,
  total_tasks: sprint.total_tasks || 0,
  completed_tasks: sprint.completed_tasks || 0,
  completion_percentage: sprint.completion_percentage || 0,
  tasks: (sprint.tasks || []).map((task: RawSprintTask) => ({
    id: String(task.id),
    name: task.title,
    description: task.description,
    completed: task.status === 'completed',
    order: task.display_order || 0,
    dependencies: (task.prerequisite_task_ids || []).map((id: string) => String(id)),
    notes: task.user_notes || task.completion_notes,
    estimated_duration: task.estimated_minutes,
  })),
});

const normalizeReadinessOverview = (raw: RawReadinessOverview) => ({
  latest_assessment: raw.latest_assessment
    ? {
        ...raw.latest_assessment,
        id: String(raw.latest_assessment.id),
        user_id: String(raw.latest_assessment.user_id),
        route_id: raw.latest_assessment.route_id ? String(raw.latest_assessment.route_id) : null,
      }
    : null,
  open_gaps: raw.open_gaps ?? 0,
  critical_gaps: raw.critical_gaps ?? 0,
  resolved_gaps: raw.resolved_gaps ?? 0,
  active_sprints: raw.active_sprints ?? 0,
  sprints_completed_this_month: raw.sprints_completed_this_month ?? 0,
  recommended_next_sprints: raw.recommended_next_sprints ?? [],
  urgent_tasks: (raw.urgent_tasks ?? []).map((t) => ({
    id: String(t.id),
    sprint_id: String(t.sprint_id),
    title: t.title,
    status: t.status,
    due_date: t.due_date ?? null,
    estimated_minutes: t.estimated_minutes ?? null,
  })),
});

export const useSprintTemplates = () => {
  return useQuery({
    queryKey: ['sprints', 'templates'],
    queryFn: async () => {
      const response = await api.get('/sprints/templates');
      return (response.data?.items ?? []).map(normalizeSprintTemplate);
    },
  });
};

export const useUserSprints = () => {
  return useQuery({
    queryKey: ['sprints', 'user'],
    queryFn: async () => {
      const response = await api.get('/sprints');
      return (response.data?.items ?? []).map(normalizeSprint);
    },
  });
};

export const useSprint = (sprintId: string) => {
  return useQuery({
    queryKey: ['sprints', sprintId],
    queryFn: async () => {
      const response = await api.get(`/sprints/${sprintId}`);
      return normalizeSprint(response.data);
    },
    enabled: !!sprintId,
  });
};

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { template_id: string }) => {
      const templateResponse = await api.get(`/sprints/templates/${data.template_id}`);
      const template = templateResponse.data;

      const response = await api.post('/sprints', {
        template_id: data.template_id,
        name: template.name || 'Sprint',
        gap_category: template.target_gap_category || 'general',
        description: template.description,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', 'user'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sprintId: string;
      taskId: string;
      completed?: boolean;
      notes?: string;
    }) => {
      const response = await api.patch(
        `/sprints/${data.sprintId}/tasks/${data.taskId}`,
        {
          status: data.completed ? 'completed' : 'in_progress',
          completion_notes: data.notes,
        }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', variables.sprintId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', 'user'] });
    },
  });
};

export const useGapAnalysis = () => {
  return useQuery({
    queryKey: ['sprints', 'gap-analysis'],
    queryFn: async () => {
      const response = await api.get('/sprints/readiness/gaps');
      const items = response.data?.items ?? [];

      const recommendations = items
        .slice(0, 5)
        .map((gap: { gap_category?: string; gap_description?: string; severity?: string }) => {
          const category = gap.gap_category ?? 'geral';
          const description = gap.gap_description ?? 'Gap identificado';
          const severity = gap.severity ?? 'medium';
          return `[${severity.toUpperCase()}] ${category}: ${description}`;
        });

      return {
        items,
        summary:
          items.length > 0
            ? `Foram identificados ${items.length} gaps de prontidão.`
            : 'Nenhum gap crítico identificado no momento.',
        recommendations,
      };
    },
  });
};

export const useReadinessOverview = () => {
  return useQuery({
    queryKey: ['sprints', 'readiness', 'overview'],
    queryFn: async () => {
      const response = await api.get('/sprints/readiness/overview');
      return normalizeReadinessOverview(response.data);
    },
  });
};

// Aggregate hook for convenience
export const useSprints = () => {
  const templatesQuery = useSprintTemplates();
  const sprintsQuery = useUserSprints();
  const gapAnalysisQuery = useGapAnalysis();
  const readinessOverviewQuery = useReadinessOverview();
  const createSprint = useCreateSprint();
  const updateTask = useUpdateTask();

  return {
    templates: templatesQuery.data,
    sprints: sprintsQuery.data,
    gapAnalysis: gapAnalysisQuery.data,
    readinessOverview: readinessOverviewQuery.data,
    isLoading:
      templatesQuery.isLoading ||
      sprintsQuery.isLoading ||
      gapAnalysisQuery.isLoading ||
      readinessOverviewQuery.isLoading,
    error:
      templatesQuery.error ||
      sprintsQuery.error ||
      gapAnalysisQuery.error ||
      readinessOverviewQuery.error,
    createSprint: createSprint.mutate,
    updateTask: (args: { sprintId: string; taskId: string; completed?: boolean; notes?: string }) =>
      updateTask.mutate(args),
    completeTask: (sprintId: string, taskId: string) =>
      updateTask.mutate({ sprintId, taskId, completed: true }),
    getSprint: useSprint,
  };
};
