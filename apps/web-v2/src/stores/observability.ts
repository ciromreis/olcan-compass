import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FrontendErrorInput, WebVitalMetric } from "@/lib/observability";
import type { IncidentStatusState } from "@/lib/observability-incidents";
import {
  normalizeFrontendError,
  normalizeWebVital,
  OBSERVABILITY_RETENTION_LIMIT,
  prependWithLimit,
} from "@/lib/observability";

interface ObservabilityState {
  frontendErrors: ReturnType<typeof normalizeFrontendError>[];
  webVitals: ReturnType<typeof normalizeWebVital>[];
  incidentStates: Record<string, IncidentStatusState>;
  recordFrontendError: (error: FrontendErrorInput) => void;
  recordWebVital: (metric: WebVitalMetric, route?: string) => void;
  setIncidentStatus: (
    incidentId: string,
    status: IncidentStatusState["status"],
    actor?: string
  ) => void;
  clearIncidentStates: () => void;
  clearFrontendErrors: () => void;
  clearWebVitals: () => void;
}

export const useObservabilityStore = create<ObservabilityState>()(
  persist(
    (set) => ({
      frontendErrors: [],
      webVitals: [],
      incidentStates: {},
      recordFrontendError: (error) =>
        set((state) => ({
          frontendErrors: prependWithLimit(
            state.frontendErrors,
            normalizeFrontendError(error),
            OBSERVABILITY_RETENTION_LIMIT
          ),
        })),
      recordWebVital: (metric, route) =>
        set((state) => ({
          webVitals: prependWithLimit(
            state.webVitals,
            normalizeWebVital(metric, route),
            OBSERVABILITY_RETENTION_LIMIT
          ),
        })),
      setIncidentStatus: (incidentId, status, actor) =>
        set((state) => ({
          incidentStates: {
            ...state.incidentStates,
            [incidentId]: {
              status,
              actor,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      clearIncidentStates: () => set({ incidentStates: {} }),
      clearFrontendErrors: () => set({ frontendErrors: [] }),
      clearWebVitals: () => set({ webVitals: [] }),
    }),
    {
      name: "olcan-observability",
      partialize: (state) => ({
        frontendErrors: state.frontendErrors,
        webVitals: state.webVitals,
        incidentStates: state.incidentStates,
      }),
    }
  )
);
