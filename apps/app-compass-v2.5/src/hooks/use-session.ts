"use client";

import { useParams } from "next/navigation";
import { useInterviewStore, type InterviewSession } from "@/stores/interviews";

/**
 * Hook for interview session pages — resolves session from route params,
 * provides derived stats and common store actions.
 * Eliminates repeated useParams + getSessionById + stat computation across 4+ pages.
 */
export function useSession(explicitId?: string) {
  const params = useParams();
  const sessionId = explicitId || (params.id as string);

  const {
    getSessionById,
    getActiveSession,
    getStats,
    submitAnswer,
    completeSession,
  } = useInterviewStore();

  const session = getSessionById(sessionId);

  const stats = session
    ? {
        questionCount: session.answers.length,
        avgScore: session.answers.length > 0
          ? Math.round(session.answers.reduce((s, a) => s + a.score, 0) / session.answers.length)
          : 0,
        avgTime: session.answers.length > 0
          ? Math.round(session.answers.reduce((s, a) => s + a.timeSpent, 0) / session.answers.length)
          : 0,
        durationMin: session.completedAt
          ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
          : 0,
        strongAnswers: session.answers.filter((a) => a.score >= 75).length,
        weakAnswers: session.answers.filter((a) => a.score < 50).length,
      }
    : null;

  return {
    sessionId,
    session,
    stats,
    activeSession: getActiveSession(),
    globalStats: getStats(),
    submitAnswer,
    completeSession,
    found: !!session,
  };
}

export type UseSessionReturn = ReturnType<typeof useSession>;
export type { InterviewSession };
