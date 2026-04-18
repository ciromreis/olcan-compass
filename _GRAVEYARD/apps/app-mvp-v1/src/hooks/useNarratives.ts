import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Narrative, NarrativeVersion, NarrativeAnalysis } from '@/store/narrative';

export function useNarratives() {
  return useQuery({
    queryKey: ['narratives'],
    queryFn: () => api.get<Narrative[]>('/narratives').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNarrative(id: string) {
  return useQuery({
    queryKey: ['narrative', id],
    queryFn: () => api.get<Narrative>(`/narratives/${id}`).then((res) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNarrativeVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ narrativeId, content }: { narrativeId: string; content: string }) =>
      api.post<NarrativeVersion>(`/narratives/${narrativeId}/versions`, { content }).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['narrative', variables.narrativeId] });
      queryClient.invalidateQueries({ queryKey: ['narratives'] });
    },
  });
}

export function useRequestAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (narrativeId: string) =>
      api.post<NarrativeAnalysis>(`/narratives/${narrativeId}/analyze`).then((res) => res.data),
    onSuccess: (_, narrativeId) => {
      queryClient.invalidateQueries({ queryKey: ['narrative', narrativeId] });
    },
  });
}

export function useUpdateNarrative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.patch<Narrative>(`/narratives/${id}`, { content }).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['narrative', variables.id] });
    },
  });
}

export function useCreateNarrative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; document_type: string; content: string }) =>
      api.post<Narrative>('/narratives', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['narratives'] });
    },
  });
}
