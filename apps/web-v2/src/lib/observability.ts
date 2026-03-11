export type VitalRating = "good" | "needs-improvement" | "poor";

export interface FrontendErrorInput {
  message: string;
  name?: string;
  digest?: string;
  route?: string;
  stack?: string;
}

export interface FrontendErrorEvent extends FrontendErrorInput {
  id: string;
  createdAt: string;
  name: string;
  stackPreview?: string;
}

export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: VitalRating;
  delta: number;
  navigationType?: string;
}

export interface WebVitalEvent extends WebVitalMetric {
  createdAt: string;
  route?: string;
}

export interface FrontendHealthSummary {
  totalErrors: number;
  errorsLast24h: number;
  poorVitalsCount: number;
  vitalsLast24h: number;
}

const STACK_PREVIEW_LINES = 4;
export const OBSERVABILITY_RETENTION_LIMIT = 300;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function createEventId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

function buildStackPreview(stack?: string): string | undefined {
  if (!stack) return undefined;
  return stack
    .split("\n")
    .slice(0, STACK_PREVIEW_LINES)
    .join("\n");
}

export function normalizeFrontendError(input: FrontendErrorInput): FrontendErrorEvent {
  return {
    id: createEventId("fe"),
    createdAt: new Date().toISOString(),
    name: input.name || "Error",
    message: input.message,
    digest: input.digest,
    route: input.route,
    stack: input.stack,
    stackPreview: buildStackPreview(input.stack),
  };
}

export function normalizeWebVital(input: WebVitalMetric, route?: string): WebVitalEvent {
  return {
    ...input,
    createdAt: new Date().toISOString(),
    route,
  };
}

export function prependWithLimit<T>(items: T[], item: T, limit: number): T[] {
  return [item, ...items].slice(0, Math.max(1, limit));
}

export function summarizeFrontendHealth(
  errors: Array<Pick<FrontendErrorEvent, "createdAt">>,
  vitals: Array<Pick<WebVitalEvent, "createdAt" | "rating">>,
  now: number = Date.now()
): FrontendHealthSummary {
  const cutoff = now - DAY_IN_MS;

  const errorsLast24h = errors.filter((event) => new Date(event.createdAt).getTime() >= cutoff).length;
  const recentVitals = vitals.filter((event) => new Date(event.createdAt).getTime() >= cutoff);

  return {
    totalErrors: errors.length,
    errorsLast24h,
    poorVitalsCount: recentVitals.filter((event) => event.rating === "poor").length,
    vitalsLast24h: recentVitals.length,
  };
}
