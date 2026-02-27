import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { usePsychStore, PsychProfile } from '@/store/psych';

interface AssessmentAnswer {
  question_id: string;
  answer_value: string;
}

interface RawPsychProfile {
  id: string;
  user_id: string;
  cultural_adaptability_score?: number;
  discipline_score?: number;
  confidence_index?: number;
  narrative_maturity_score?: number;
  anxiety_score?: number;
  last_assessment_at?: string;
  created_at: string;
  updated_at: string;
}

interface RawPsychHistoryItem {
  id: string;
  created_at: string;
  discipline_score?: number;
  confidence_index?: number;
  anxiety_score?: number;
}

const normalizeProfile = (profile: RawPsychProfile): PsychProfile => ({
  id: String(profile.id),
  user_id: String(profile.user_id),
  openness: Math.round(profile.cultural_adaptability_score ?? 50),
  conscientiousness: Math.round(profile.discipline_score ?? 50),
  extraversion: Math.round(profile.confidence_index ?? 50),
  agreeableness: Math.round(profile.narrative_maturity_score ?? 50),
  neuroticism: Math.round(profile.anxiety_score ?? 50),
  anxiety_score: profile.anxiety_score,
  agency_score: profile.confidence_index,
  last_assessment_date: profile.last_assessment_at,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});

const normalizeHistory = (historyItem: RawPsychHistoryItem) => ({
  id: String(historyItem.id),
  date: historyItem.created_at,
  completed_at: historyItem.created_at,
  openness: Math.round(historyItem.discipline_score ?? 50),
  conscientiousness: Math.round(historyItem.discipline_score ?? 50),
  extraversion: Math.round(historyItem.confidence_index ?? 50),
  agreeableness: Math.round(historyItem.confidence_index ?? 50),
  neuroticism: Math.round(historyItem.anxiety_score ?? 50),
});

export const usePsychProfile = () => {
  const { setProfile } = usePsychStore();

  const query = useQuery({
    queryKey: ['psych', 'profile'],
    queryFn: async () => {
      const response = await api.get('/psych/profile');
      return normalizeProfile(response.data);
    },
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
};

export const usePsychScoreHistory = () => {
  const { setScoreHistory } = usePsychStore();

  const query = useQuery({
    queryKey: ['psych', 'history'],
    queryFn: async () => {
      const response = await api.get('/psych/history');
      return (response.data?.history ?? []).map(normalizeHistory);
    },
  });

  useEffect(() => {
    if (query.data) {
      setScoreHistory(query.data);
    }
  }, [query.data, setScoreHistory]);

  return query;
};

export const useAssessmentQuestions = () => {
  return useQuery<unknown[]>({
    queryKey: ['psych', 'questions'],
    queryFn: async () => [],
  });
};

export const useStartAssessment = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/psych/assessment/start', {
        assessment_type: 'onboarding',
      });
      return response.data;
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      session_id: string;
      answers: AssessmentAnswer[];
    }) => {
      if (!data.session_id) {
        throw new Error('Sessão de avaliação não iniciada.');
      }

      let lastResponse: unknown = null;
      for (const answer of data.answers) {
        const response = await api.post('/psych/assessment/answer', {
          session_id: data.session_id,
          question_id: answer.question_id,
          answer_value: answer.answer_value,
        });
        lastResponse = response.data;
      }

      return lastResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psych', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['psych', 'history'] });
    },
  });
};

// Aggregate hook for convenience
export const usePsych = () => {
  const profileQuery = usePsychProfile();
  const historyQuery = usePsychScoreHistory();
  const questionsQuery = useAssessmentQuestions();
  const startAssessment = useStartAssessment();
  const submitAssessment = useSubmitAssessment();

  return {
    profile: profileQuery.data,
    assessmentHistory: historyQuery.data,
    questions: questionsQuery.data,
    isLoading: profileQuery.isLoading || historyQuery.isLoading || questionsQuery.isLoading,
    error: profileQuery.error || historyQuery.error || questionsQuery.error,
    startAssessment: startAssessment.mutate,
    submitAssessment: submitAssessment.mutate,
  };
};
