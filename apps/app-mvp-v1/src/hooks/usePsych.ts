import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PsychProfile, AssessmentSession, ScoreHistory } from '@/store/psych';

export function usePsychProfile() {
  return useQuery({
    queryKey: ['psych-profile'],
    queryFn: () => api.get<PsychProfile>('/psych/profile').then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePsychQuestions() {
  return useQuery({
    queryKey: ['psych-questions'],
    queryFn: () => api.get('/psych/questions').then((res) => res.data),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useCreatePsychSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<AssessmentSession>('/psych/sessions').then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psych-profile'] });
    },
  });
}

export function useSubmitPsychAnswers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, answers }: { sessionId: string; answers: Record<string, number> }) =>
      api.post(`/psych/sessions/${sessionId}/answers`, { answers }).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['psych-profile'] });
      queryClient.invalidateQueries({ queryKey: ['psych-sessions'] });
    },
  });
}

export function usePsychScoreHistory() {
  return useQuery({
    queryKey: ['psych-score-history'],
    queryFn: () => api.get<ScoreHistory[]>('/psych/score-history').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}
