import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useEditorStore } from '@/store/editor';

export type NarrativeType =
  | 'motivation_letter'
  | 'personal_statement'
  | 'cover_letter'
  | 'research_proposal'
  | 'cv_summary'
  | 'scholarship_essay'
  | 'other';

export type NarrativeStatus = 'draft' | 'in_review' | 'ready' | 'submitted' | 'archived';

export interface NarrativeListItem {
  id: string;
  title: string;
  narrative_type: NarrativeType;
  status: NarrativeStatus;
  target_country?: string | null;
  target_institution?: string | null;
  latest_overall_score?: number | null;
  version_count: number;
  created_at: string;
  updated_at: string;
  last_analyzed_at?: string | null;
}

export interface NarrativeVersionResponse {
  id: string;
  narrative_id: string;
  version_number: number;
  content: string;
  content_plain?: string | null;
  word_count: number;
  change_summary?: string | null;
  clarity_score?: number | null;
  coherence_score?: number | null;
  authenticity_score?: number | null;
  overall_score?: number | null;
  created_at: string;
}

export interface NarrativeAnalysisResponse {
  id: string;
  narrative_id: string;
  version_id?: string | null;
  clarity_score: number;
  coherence_score: number;
  alignment_score: number;
  authenticity_score: number;
  cultural_fit_score?: number | null;
  overall_score: number;
  cliche_density_score: number;
  authenticity_risk: string;
  key_strengths: string[];
  improvement_actions: string[];
  suggested_edits: Array<Record<string, unknown>>;
  ai_model?: string | null;
  prompt_version?: string | null;
  token_usage?: number | null;
  created_at: string;
}

export interface NarrativeDetailResponse {
  id: string;
  user_id: string;
  route_id?: string | null;
  title: string;
  narrative_type: NarrativeType;
  status: NarrativeStatus;
  target_country?: string | null;
  target_institution?: string | null;
  target_program?: string | null;
  version_count: number;
  current_version_id?: string | null;
  latest_overall_score?: number | null;
  created_at: string;
  updated_at: string;
  last_analyzed_at?: string | null;
  current_version?: NarrativeVersionResponse | null;
  analyses?: NarrativeAnalysisResponse[];
  versions?: NarrativeVersionResponse[];
}

export const useNarratives = () => {
  return useQuery({
    queryKey: ['narratives'],
    queryFn: async () => {
      const response = await api.get('/narratives');
      return (response.data.items || []) as NarrativeListItem[];
    },
  });
};

export const useNarrative = (narrativeId: string) => {
  const { hydrateFromServer } = useEditorStore();

  const query = useQuery({
    queryKey: ['narratives', narrativeId],
    queryFn: async () => {
      const response = await api.get(`/narratives/${narrativeId}`, {
        params: { include_versions: true, include_analyses: true },
      });
      return response.data as NarrativeDetailResponse;
    },
    enabled: !!narrativeId,
  });

  useEffect(() => {
    if (query.data) {
      hydrateFromServer({
        narrativeId: query.data.id,
        content: query.data.current_version?.content || '',
        currentVersion: query.data.current_version || null,
        versions: query.data.versions || [],
        analysis: query.data.analyses?.[0] || null,
      });
    }
  }, [query.data, hydrateFromServer]);

  return query;
};

export const useNarrativeVersions = (narrativeId: string) => {
  const { setVersions } = useEditorStore();

  const query = useQuery({
    queryKey: ['narratives', narrativeId, 'versions'],
    queryFn: async () => {
      const response = await api.get(`/narratives/${narrativeId}/versions`);
      return response.data as NarrativeVersionResponse[];
    },
    enabled: !!narrativeId,
  });

  useEffect(() => {
    if (query.data) {
      setVersions(query.data);
    }
  }, [query.data, setVersions]);

  return query;
};

export const useCreateNarrative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      narrative_type: NarrativeType;
      content: string;
      route_id?: string;
      target_country?: string;
      target_institution?: string;
      target_program?: string;
    }) => {
      const response = await api.post('/narratives', data);
      return response.data as NarrativeDetailResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['narratives'] });
    },
  });
};

export const useCreateNarrativeVersion = () => {
  const queryClient = useQueryClient();
  const { setLastSaved, setDirty, setCurrentVersion } = useEditorStore();

  return useMutation({
    mutationFn: async (data: { narrativeId: string; content: string; change_summary?: string }) => {
      const response = await api.post(`/narratives/${data.narrativeId}/versions`, {
        content: data.content,
        change_summary: data.change_summary,
      });
      return response.data as NarrativeVersionResponse;
    },
    onSuccess: (_data, variables) => {
      setCurrentVersion(_data);
      setLastSaved(new Date(_data.created_at || Date.now()));
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['narratives', variables.narrativeId] });
      queryClient.invalidateQueries({ queryKey: ['narratives', variables.narrativeId, 'versions'] });
    },
  });
};

export const useRequestAnalysis = () => {
  const queryClient = useQueryClient();
  const { setAnalysis } = useEditorStore();

  return useMutation({
    mutationFn: async (narrativeId: string) => {
      const response = await api.post(`/narratives/${narrativeId}/analyze`, {});
      return response.data as NarrativeAnalysisResponse;
    },
    onSuccess: (data, narrativeId) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['narratives', narrativeId, 'analysis'] });
    },
  });
};
