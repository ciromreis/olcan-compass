import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type RawOpportunity = {
  id: string;
  title: string;
  description?: string;
  opportunity_type?: string;
  organization_name?: string;
  location_country?: string;
  organization_country?: string;
  application_deadline?: string;
  competitiveness_score?: number;
  created_at: string;
  opportunity_cost_daily?: number;
};

type RawApplication = {
  id: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  opportunity?: RawOpportunity;
  match_score?: number;
  documents?: RawDocument[];
};

type RawDocument = {
  id: string;
  file_name?: string;
  document_type: string;
};

const normalizeOpportunity = (item: RawOpportunity) => ({
  id: String(item.id),
  opportunity_id: String(item.id),
  opportunity_name: item.title,
  opportunity_type: item.opportunity_type,
  institution: item.organization_name,
  location: item.location_country || item.organization_country,
  status: 'draft',
  deadline: item.application_deadline,
  match_score: item.competitiveness_score,
  created_at: item.created_at,
  updated_at: item.created_at,
  opportunity_cost_daily: item.opportunity_cost_daily,
});

const normalizeApplication = (item: RawApplication) => ({
  id: String(item.id),
  opportunity_id: String(item.opportunity_id),
  opportunity_name: item.opportunity?.title || 'Oportunidade',
  opportunity_type: item.opportunity?.opportunity_type,
  institution: item.opportunity?.organization_name,
  location: item.opportunity?.location_country || item.opportunity?.organization_country,
  status:
    item.status === 'watching' || item.status === 'planned'
      ? 'draft'
      : item.status === 'in_progress'
        ? 'under_review'
        : item.status,
  deadline: item.opportunity?.application_deadline,
  match_score: undefined,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const normalizeApplicationDetail = (item: RawApplication) => ({
  ...normalizeApplication(item),
  title: item.opportunity?.title || 'Oportunidade',
  description: item.opportunity?.description || '',
  deadline: item.opportunity?.application_deadline,
  match_score: item.match_score,
  required_documents: (item.documents || []).map((document: RawDocument) => ({
    id: String(document.id),
    name: document.file_name || document.document_type,
    type: document.document_type,
    uploaded: !!document.file_name,
  })),
});

export const useOpportunities = (filters?: {
  search?: string;
  type?: string;
  location?: string;
}) => {
  return useQuery({
    queryKey: ['applications', 'opportunities', filters],
    queryFn: async () => {
      const response = await api.get('/applications/opportunities', {
        params: {
          search: filters?.search,
          opportunity_type: filters?.type,
          country: filters?.location,
        },
      });
      return (response.data?.items ?? []).map(normalizeOpportunity);
    },
  });
};

export const useOpportunity = (opportunityId: string) => {
  return useQuery({
    queryKey: ['applications', 'opportunities', opportunityId],
    queryFn: async () => {
      const response = await api.get(`/applications/opportunities/${opportunityId}`);
      return normalizeOpportunity(response.data);
    },
    enabled: !!opportunityId,
  });
};

export const useUserApplications = () => {
  return useQuery({
    queryKey: ['applications', 'user'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return (response.data?.items ?? []).map(normalizeApplication);
    },
  });
};

export const useApplication = (applicationId: string) => {
  return useQuery({
    queryKey: ['applications', applicationId],
    queryFn: async () => {
      const response = await api.get(`/applications/${applicationId}`);
      return normalizeApplicationDetail(response.data);
    },
    enabled: !!applicationId,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { opportunity_id: string }) => {
      const response = await api.post('/applications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'user'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      status?: string;
      notes?: string;
    }) => {
      const response = await api.patch(`/applications/${data.applicationId}`, data);
      return normalizeApplication(response.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['applications', variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ['applications', 'user'] });
    },
  });
};

export const useWatchlist = () => {
  return useQuery({
    queryKey: ['applications', 'watchlist'],
    queryFn: async () => {
      const response = await api.get('/applications/watchlist');
      return (response.data?.items ?? []).map((item: RawApplication) => ({
        id: String(item.id),
        opportunity_id: String(item.opportunity_id),
        opportunity_name: item.opportunity?.title || 'Oportunidade',
      }));
    },
  });
};

export const useToggleWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await api.post('/applications/watchlist', {
        opportunity_id: opportunityId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'watchlist'] });
    },
  });
};

// Aggregate hook for convenience
export const useApplications = (filters?: {
  search?: string;
  type?: string;
  location?: string;
}) => {
  const opportunitiesQuery = useOpportunities(filters);
  const applicationsQuery = useUserApplications();
  const watchlistQuery = useWatchlist();
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const toggleWatchlist = useToggleWatchlist();

  return {
    opportunities: opportunitiesQuery.data,
    applications: applicationsQuery.data,
    watchlist: watchlistQuery.data,
    isLoading:
      opportunitiesQuery.isLoading ||
      applicationsQuery.isLoading ||
      watchlistQuery.isLoading,
    error:
      opportunitiesQuery.error || applicationsQuery.error || watchlistQuery.error,
    createApplication: createApplication.mutate,
    updateApplication: updateApplication.mutate,
    addToWatchlist: toggleWatchlist.mutate,
    getApplication: useApplication,
    uploadDocument: async (applicationId: string, file: File) => {
      const response = await api.post(`/applications/${applicationId}/documents`, {
        document_type: 'other',
        file_name: file.name,
        notes: 'Upload realizado pelo frontend',
      });
      return response.data;
    },
  };
};
