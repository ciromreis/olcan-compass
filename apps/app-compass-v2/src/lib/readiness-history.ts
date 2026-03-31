import type { GateAttempt } from "@/stores/submission-gate";

export interface ReadinessHistoryEntry {
  id: string;
  date: string;
  overall: number;
  source: "snapshot" | "gate_attempt";
  status: "approved" | "blocked";
  metCount?: number;
  criteriaCount?: number;
  appLabel?: string;
  missingCriteria?: string[];
}

export function mapGateAttemptsToHistory(attempts: GateAttempt[]): ReadinessHistoryEntry[] {
  return attempts.map((attempt) => ({
    id: attempt.id,
    date: attempt.createdAt,
    overall: attempt.totalScore,
    source: "gate_attempt",
    status: attempt.canSubmit ? "approved" : "blocked",
    metCount: attempt.metCount,
    criteriaCount: attempt.criteriaCount,
    appLabel: attempt.appLabel,
    missingCriteria: attempt.missingCriteria,
  }));
}

