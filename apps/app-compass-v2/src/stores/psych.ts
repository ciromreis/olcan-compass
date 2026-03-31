import { create } from "zustand";
import { persist } from "zustand/middleware";

type Dimension =
  | "calibration"
  | "confidence"
  | "risk"
  | "discipline"
  | "decisions"
  | "anxiety"
  | "goals"
  | "financial";

interface PsychState {
  answers: Record<string, Record<string, string>>;
  completedDimensions: Dimension[];
  startedAt: string | null;
  completedAt: string | null;

  setAnswer: (dimension: Dimension, questionId: string, value: string) => void;
  markDimensionComplete: (dimension: Dimension) => void;
  getDimensionAnswers: (dimension: Dimension) => Record<string, string>;
  getDimensionScore: (dimension: Dimension) => number;
  getOverallScore: () => number;
  isComplete: () => boolean;
  reset: () => void;
  startAssessment: () => void;
  finishAssessment: () => void;
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
        }),

      startAssessment: () =>
        set({ startedAt: new Date().toISOString() }),

      finishAssessment: () =>
        set({ completedAt: new Date().toISOString() }),
    }),
    {
      name: "olcan-psych",
    }
  )
);

export { ALL_DIMENSIONS, LIKERT_SCORES, type Dimension };
