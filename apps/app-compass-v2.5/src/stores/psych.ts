import { create } from "zustand";
import { persist } from "zustand/middleware";
import { psychApi } from "@/lib/api";

type Dimension =
  | "calibration"
  | "confidence"
  | "risk"
  | "discipline"
  | "decisions"
  | "anxiety"
  | "goals"
  | "financial";

/** Last OIOS archetype quiz outcome from `/onboarding/quiz` (API result snapshot). */
export interface OiosAssessmentSnapshot {
  dominant_archetype: string | null;
  primary_fear_cluster: string | null;
  mobility_state: string | null;
  completedAt: string;
}

/** Partial credit for readiness radar when OIOS is done but Likert is not yet complete. */
export const OIOS_PARTIAL_READINESS_SCORE = 40;

export function hasOiosArchetypeEstablished(state: {
  oiosAssessmentComplete: boolean;
  oiosSnapshot: OiosAssessmentSnapshot | null;
}): boolean {
  return state.oiosAssessmentComplete || Boolean(state.oiosSnapshot?.dominant_archetype);
}

/**
 * Prontidão na dimensão psicológica: Score de Certeza (Likert) quando completo;
 * caso contrário, crédito parcial se o arquétipo OIOS existir.
 */
export function psychologicalReadinessScore(
  likertComplete: boolean,
  likertOverallScore: number,
  psych: { oiosAssessmentComplete: boolean; oiosSnapshot: OiosAssessmentSnapshot | null }
): number {
  if (likertComplete) return likertOverallScore;
  if (hasOiosArchetypeEstablished(psych)) return OIOS_PARTIAL_READINESS_SCORE;
  return 0;
}

interface PsychState {
  answers: Record<string, Record<string, string>>;
  completedDimensions: Dimension[];
  startedAt: string | null;
  completedAt: string | null;
  /** Set when the user finishes the OIOS archetype flow at `/onboarding/quiz`. */
  oiosAssessmentComplete: boolean;
  /** Persisted API result so profile/aura flows can read archetype without a round-trip. */
  oiosSnapshot: OiosAssessmentSnapshot | null;

  setAnswer: (dimension: Dimension, questionId: string, value: string) => void;
  markDimensionComplete: (dimension: Dimension) => void;
  getDimensionAnswers: (dimension: Dimension) => Record<string, string>;
  getDimensionScore: (dimension: Dimension) => number;
  getOverallScore: () => number;
  isComplete: () => boolean;
  reset: () => void;
  startAssessment: () => void;
  finishAssessment: () => void;
  setOiosAssessmentComplete: (value: boolean) => void;
  setOiosSnapshot: (snapshot: OiosAssessmentSnapshot | null) => void;
  /** Restore OIOS snapshot from backend if localStorage is empty (e.g. after cache clear). */
  syncFromApi: () => Promise<void>;
}

const LIKERT_SCORES: Record<string, number> = {
  "Discordo totalmente": 1,
  "Discordo": 2,
  "Neutro": 3,
  "Concordo": 4,
  "Concordo totalmente": 5,
};

const ALL_DIMENSIONS: Dimension[] = [
  "calibration",
  "confidence",
  "risk",
  "discipline",
  "decisions",
  "anxiety",
  "goals",
  "financial",
];

function scoreLikert(answers: Record<string, string>): number {
  const values = Object.values(answers)
    .map((a) => LIKERT_SCORES[a])
    .filter((v) => v !== undefined);
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round((avg / 5) * 100);
}

export const usePsychStore = create<PsychState>()(
  persist(
    (set, get) => ({
      answers: {},
      completedDimensions: [],
      startedAt: null,
      completedAt: null,
      oiosAssessmentComplete: false,
      oiosSnapshot: null,

      setAnswer: (dimension, questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [dimension]: {
              ...(state.answers[dimension] || {}),
              [questionId]: value,
            },
          },
        })),

      markDimensionComplete: (dimension) =>
        set((state) => ({
          completedDimensions: state.completedDimensions.includes(dimension)
            ? state.completedDimensions
            : [...state.completedDimensions, dimension],
        })),

      getDimensionAnswers: (dimension) => get().answers[dimension] || {},

      getDimensionScore: (dimension) => {
        const dimAnswers = get().answers[dimension] || {};
        return scoreLikert(dimAnswers);
      },

      getOverallScore: () => {
        const state = get();
        const scores = ALL_DIMENSIONS.map((d) => {
          const dimAnswers = state.answers[d] || {};
          return scoreLikert(dimAnswers);
        }).filter((s) => s > 0);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
      },

      isComplete: () => get().completedDimensions.length >= ALL_DIMENSIONS.length,

      reset: () =>
        set({
          answers: {},
          completedDimensions: [],
          startedAt: null,
          completedAt: null,
          oiosAssessmentComplete: false,
          oiosSnapshot: null,
        }),

      startAssessment: () =>
        set({ startedAt: new Date().toISOString() }),

      finishAssessment: () =>
        set({ completedAt: new Date().toISOString() }),

      setOiosAssessmentComplete: (value) => set({ oiosAssessmentComplete: value }),

      setOiosSnapshot: (snapshot) => set({ oiosSnapshot: snapshot }),

      syncFromApi: async () => {
        // Only fetch if localStorage snapshot is missing — avoids unnecessary round-trips
        if (get().oiosSnapshot?.dominant_archetype) return;
        try {
          const { data } = await psychApi.getProfile() as {
            data: {
              dominant_archetype?: string | null;
              primary_fear_cluster?: string | null;
              mobility_state?: string;
              last_assessment_at?: string | null;
            };
          };
          if (data?.dominant_archetype) {
            set({
              oiosSnapshot: {
                dominant_archetype: data.dominant_archetype,
                primary_fear_cluster: data.primary_fear_cluster ?? null,
                mobility_state: data.mobility_state ?? null,
                completedAt: data.last_assessment_at ?? new Date().toISOString(),
              },
              oiosAssessmentComplete: true,
            });
          }
        } catch {
          // No psych profile yet — user hasn't completed the diagnostic. Silent.
        }
      },
    }),
    {
      name: "olcan-psych",
    }
  )
);

export { ALL_DIMENSIONS, LIKERT_SCORES, type Dimension };
