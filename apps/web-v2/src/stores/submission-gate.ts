import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubmissionCriterion } from "@/lib/readiness-gate";

export interface GateAttempt {
  id: string;
  appId?: string;
  appLabel?: string;
  createdAt: string;
  canSubmit: boolean;
  totalScore: number;
  metCount: number;
  criteriaCount: number;
  missingCriteria: string[];
}

interface SubmissionGateState {
  attempts: GateAttempt[];
  recordAttempt: (entry: Omit<GateAttempt, "id" | "createdAt">) => void;
  clearAttempts: () => void;
  summarizeMissing: (criteria: SubmissionCriterion[]) => string[];
}

export const useSubmissionGateStore = create<SubmissionGateState>()(
  persist(
    (set) => ({
      attempts: [],
      recordAttempt: (entry) =>
        set((state) => ({
          attempts: [
            {
              id: `gate_${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...entry,
            },
            ...state.attempts,
          ].slice(0, 100),
        })),
      clearAttempts: () => set({ attempts: [] }),
      summarizeMissing: (criteria) => criteria.filter((criterion) => !criterion.met).map((criterion) => criterion.label),
    }),
    { name: "olcan-submission-gate" }
  )
);
