import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useEditorStore } from '@/store/editor';

export const useNarratives = () => {
  return useQuery({
    queryKey: ['narratives'],
    queryFn: async () => {
      const response = await api.get('/narratives');
      return response.data;
    },
  });
};

export const useNarrative = (narrativeId: string) => {
  const { setNarrativeId, setContent, setCurrentVersion } = useEditorStore();

  const query = useQuery({
    queryKey: ['narratives', narrativeId],
    queryFn: async () => {
      const response = await api.get(`/narratives/${narrativeId}`);
      return response.data;
    },
    enabled: !!narrativeId,
  });

  useEffect(() => {
    if (query.data) {
      setNarrativeId(query.data.id);
      setContent(query.data.content || '');
      if (query.data.current_version) {
        setCurrentVersion(query.data.current_version);
      }
    }
  }, [query.data, setNarrativeId, setContent, setCurrentVersion]);

  return query;
};

export const useNarrativeVersions = (narrativeId: string) => {
  const { setVersions } = useEditorStore();

  const query = useQuery({
    queryKey: ['narratives', narrativeId, 'versions'],
    queryFn: async () => {
      const response = await api.get(`/narratives/${narrativeId}/versions`);
      return response.data;
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
    mutationFn: async (data: { title: string; type: string; content?: string }) => {
      const response = await api.post('/narratives', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['narratives'] });
    },
  });
};

export const useUpdateNarrative = () => {
  const queryClient = useQueryClient();
  const { setLastSaved, setDirty } = useEditorStore();

  return useMutation({
    mutationFn: async (data: { narrativeId: string; content: string }) => {
      const response = await api.patch(`/narratives/${data.narrativeId}`, {
        content: data.content,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      setLastSaved(new Date());
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['narratives', variables.narrativeId] });
    },
  });
};

export const useRequestAnalysis = () => {
  const queryClient = useQueryClient();
  const { setAnalysis } = useEditorStore();

  return useMutation({
    mutationFn: async (narrativeId: string) => {
      const response = await api.post(`/narratives/${narrativeId}/analyze`);
      return response.data;
    },
    onSuccess: (data, narrativeId) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['narratives', narrativeId, 'analysis'] });
    },
  });
};
