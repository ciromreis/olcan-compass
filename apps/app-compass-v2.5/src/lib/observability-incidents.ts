import type { FrontendErrorEvent, VitalRating, WebVitalEvent } from "@/lib/observability";

type IncidentStatus = "open" | "acknowledged" | "resolved";
type IncidentSeverity = "low" | "medium" | "high";
type IncidentType = "error_spike" | "vital_regression";

export interface DerivedIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  route: string;
  evidenceCount: number;
  openedAt: string;
  lastSeenAt: string;
  rating?: VitalRating;
}

export interface IncidentStatusState {
  status: IncidentStatus;
  updatedAt: string;
  actor?: string;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

function severityFromCount(count: number): IncidentSeverity {
  if (count >= 10) return "high";
  if (count >= 5) return "medium";
  return "low";
}

export function deriveObservabilityIncidents(
  errors: FrontendErrorEvent[],
  vitals: WebVitalEvent[],
  statusMap: Record<string, IncidentStatusState>,
  now: number = Date.now()
): DerivedIncident[] {
  const cutoff = now - WINDOW_MS;
  const recentErrors = errors.filter((event) => new Date(event.createdAt).getTime() >= cutoff);
  const recentPoorVitals = vitals.filter(
    (event) => event.rating === "poor" && new Date(event.createdAt).getTime() >= cutoff
  );

  const incidents: DerivedIncident[] = [];

  const errorGroup = new Map<string, FrontendErrorEvent[]>();
  for (const event of recentErrors) {
    const route = event.route || "rota desconhecida";
    const key = `${route}::${event.name}`;
    const bucket = errorGroup.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      errorGroup.set(key, [event]);
    }
  }

  for (const [groupKey, groupEvents] of Array.from(errorGroup.entries())) {
    if (groupEvents.length < 3) continue;
    const [route, errorName] = groupKey.split("::");
    const id = `error_spike:${route}:${errorName}`;
    const sorted = [...groupEvents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const state = statusMap[id];
    incidents.push({
      id,
      type: "error_spike",
      severity: severityFromCount(groupEvents.length),
      status: state?.status || "open",
      title: `Spike de erros em ${route}`,
      description: `${groupEvents.length} ocorrências de ${errorName} nas últimas 24h.`,
      route,
      evidenceCount: groupEvents.length,
      openedAt: sorted[0]?.createdAt || new Date().toISOString(),
      lastSeenAt: sorted[sorted.length - 1]?.createdAt || new Date().toISOString(),
    });
  }

  const vitalGroup = new Map<string, WebVitalEvent[]>();
  for (const event of recentPoorVitals) {
    const route = event.route || "rota desconhecida";
    const key = `${route}::${event.name}`;
    const bucket = vitalGroup.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      vitalGroup.set(key, [event]);
    }
  }

  for (const [groupKey, groupEvents] of Array.from(vitalGroup.entries())) {
    if (groupEvents.length < 3) continue;
    const [route, metricName] = groupKey.split("::");
    const id = `vital_regression:${route}:${metricName}`;
    const sorted = [...groupEvents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const state = statusMap[id];
    incidents.push({
      id,
      type: "vital_regression",
      severity: groupEvents.length >= 6 ? "high" : "medium",
      status: state?.status || "open",
      title: `Regressão de ${metricName}`,
      description: `${groupEvents.length} medições poor de ${metricName} em ${route} nas últimas 24h.`,
      route,
      evidenceCount: groupEvents.length,
      openedAt: sorted[0]?.createdAt || new Date().toISOString(),
      lastSeenAt: sorted[sorted.length - 1]?.createdAt || new Date().toISOString(),
      rating: "poor",
    });
  }

  return incidents.sort((a, b) => {
    const severityRank = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityRank[b.severity] - severityRank[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  });
}
