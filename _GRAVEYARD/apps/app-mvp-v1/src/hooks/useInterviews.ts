import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type RawInterviewQuestion = {
  id: string;
  question_text_pt?: string;
  question_text_en?: string;
  question_type?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
};

type RawInterviewSession = {
  id: string;
  current_question?: RawInterviewQuestion;
  status?: string;
  current_question_index?: number;
  total_questions?: number;
} & Record<string, unknown>;

const normalizeQuestion = (question: RawInterviewQuestion) => ({
  id: String(question.id),
  question: question.question_text_pt || question.question_text_en || '',
  text: question.question_text_pt || question.question_text_en || '',
  category: question.question_type,
  difficulty:
    question.difficulty === 'easy' ||
    question.difficulty === 'medium' ||
    question.difficulty === 'hard'
      ? question.difficulty
      : undefined,
});

const normalizeSession = (session: RawInterviewSession) => ({
  ...session,
  id: String(session.id),
  questions: session.current_question ? [normalizeQuestion(session.current_question)] : [],
});

export const useInterviewQuestions = (filters?: {
  category?: string;
  difficulty?: string;
}) => {
  return useQuery({
    queryKey: ['interviews', 'questions', filters],
    queryFn: async () => {
      const response = await api.get('/interviews/questions', { params: filters });
      return (response.data?.items ?? []).map(normalizeQuestion);
    },
  });
};

export const useInterviewSessions = () => {
  return useQuery({
    queryKey: ['interviews', 'sessions'],
    queryFn: async () => {
      const response = await api.get('/interviews/sessions');
      return (response.data?.items ?? []).map(normalizeSession);
    },
  });
};

export const useInterviewSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['interviews', 'sessions', sessionId],
    queryFn: async () => {
      const response = await api.get(`/interviews/sessions/${sessionId}`);
      return normalizeSession(response.data);
    },
    enabled: !!sessionId,
  });
};

export const useStartInterviewSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: {
      sessionId?: string;
      session_type?: string;
      target_institution?: string;
      estimated_duration_minutes?: number;
      question_count?: number;
      focus_types?: string[];
    }) => {
      let sessionId = data?.sessionId;

      if (!sessionId) {
        const createResponse = await api.post('/interviews/sessions', {
          session_type: data?.session_type ?? 'mock',
          target_institution: data?.target_institution,
          estimated_duration_minutes: data?.estimated_duration_minutes ?? 30,
        });
        sessionId = createResponse.data?.id;
      }

      const response = await api.post(`/interviews/sessions/${sessionId}/start`, {
        question_count: data?.question_count ?? 5,
        focus_types: data?.focus_types,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', 'sessions'] });
    },
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      questionId: string;
      answer: string;
    }) => {
      const response = await api.post(
        `/interviews/sessions/${data.sessionId}/answers`,
        {
          transcript: data.answer,
        }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['interviews', 'sessions', variables.sessionId],
      });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/complete`);
      return response.data;
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', 'sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['interviews', 'sessions'] });
    },
  });
};

// Aggregate hook for convenience
export const useInterviews = (filters?: { category?: string; difficulty?: string }) => {
  const questionsQuery = useInterviewQuestions(filters);
  const sessionsQuery = useInterviewSessions();
  const startSession = useStartInterviewSession();
  const submitAnswer = useSubmitAnswer();
  const completeSession = useCompleteSession();

  return {
    questions: questionsQuery.data,
    sessions: sessionsQuery.data,
    isLoading: questionsQuery.isLoading || sessionsQuery.isLoading,
    error: questionsQuery.error || sessionsQuery.error,
    startSession: startSession.mutate,
    startSessionAsync: startSession.mutateAsync,
    submitAnswer: submitAnswer.mutate,
    submitAnswerAsync: submitAnswer.mutateAsync,
    completeSession: completeSession.mutate,
    completeSessionAsync: completeSession.mutateAsync,
    getSession: useInterviewSession,
  };
};
