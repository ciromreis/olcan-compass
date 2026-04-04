import type { ForgeDocument } from "@/stores/forge";
import type { InterviewSession } from "@/stores/interviews";
import type { Milestone, UserRoute } from "@/stores/routes";
import { normalizeForComparison } from "@/lib/text-normalize";

export interface RoutePresenceSignal {
  routeId: string;
  routeLabel: string;
  routeType: string;
  progress: number;
  documentReadiness: number;
  interviewReadiness: number;
  logisticsReadiness: number;
  urgencyLevel: number;
  adaptationLevel: number;
  matchedDocumentCount: number;
  matchedInterviewCount: number;
}

export interface PresencePhenotype {
  routeLabel?: string;
  routeCount?: number;
  activeRouteProgress?: number;
  urgencyLevel?: number;
  interviewReadiness?: number;
  documentReadiness?: number;
  logisticsReadiness?: number;
  adaptationLevel?: number;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function milestoneGroupScore(milestones: Milestone[], matcher: (group: string) => boolean): number {
  const relevant = milestones.filter((milestone) => matcher(normalizeForComparison(milestone.group)));
  if (relevant.length === 0) return 0;
  const completed = relevant.filter((milestone) => milestone.status === "completed").length;
  const inProgress = relevant.filter((milestone) => milestone.status === "in_progress").length;
  return Math.round(((completed + inProgress * 0.5) / relevant.length) * 100);
}

function buildRouteTokens(route: UserRoute): string[] {
  return [
    route.name,
    route.type,
    route.country,
    route.targetOrganization,
    route.notes,
  ]
    .filter(Boolean)
    .map((value) => normalizeForComparison(value as string))
    .filter(Boolean);
}

function matchesRoute(tokens: string[], values: Array<string | null | undefined>): boolean {
  const haystack = normalizeForComparison(values.filter(Boolean).join(" "));
  return tokens.some((token) => token.length >= 4 && haystack.includes(token));
}

function deriveDocumentReadiness(route: UserRoute, documents: ForgeDocument[]): { score: number; count: number } {
  const tokens = buildRouteTokens(route);
  const matched = documents.filter((document) =>
    matchesRoute(tokens, [document.title, document.targetProgram, document.content.slice(0, 320)])
  );

  if (matched.length === 0) return { score: 0, count: 0 };

  const avgScore = matched.reduce((sum, document) => sum + (document.competitivenessScore || 45), 0) / matched.length;
  return { score: Math.round(avgScore), count: matched.length };
}

function deriveInterviewReadiness(route: UserRoute, sessions: InterviewSession[]): { score: number; count: number } {
  const tokens = buildRouteTokens(route);
  const matched = sessions.filter((session) =>
    matchesRoute(tokens, [session.target, session.sourceDocumentTitle])
  );

  if (matched.length === 0) return { score: 0, count: 0 };

  const avgScore = matched.reduce((sum, session) => sum + (session.overallScore || 58), 0) / matched.length;
  const completionBonus = matched.some((session) => session.status === "completed") ? 12 : 0;
  return { score: clamp(Math.round(avgScore + completionBonus)), count: matched.length };
}

function deriveLogisticsReadiness(route: UserRoute): number {
  return milestoneGroupScore(route.milestones, (group) =>
    group.includes("logistica") ||
    group.includes("visto") ||
    group.includes("aplic") ||
    group.includes("prepara")
  );
}

function deriveUrgencyLevel(route: UserRoute): number {
  const dated = route.milestones
    .filter((milestone) => milestone.dueDate && milestone.status !== "completed")
    .map((milestone) => new Date(milestone.dueDate as string).getTime())
    .filter((value) => !Number.isNaN(value));

  if (dated.length === 0) return 0.18;

  const nearest = Math.min(...dated);
  const days = Math.ceil((nearest - Date.now()) / 86400000);

  if (days <= 3) return 0.94;
  if (days <= 7) return 0.78;
  if (days <= 14) return 0.58;
  return 0.28;
}

export function deriveRoutePresenceSignals(
  routes: UserRoute[],
  documents: ForgeDocument[],
  sessions: InterviewSession[],
  getRouteProgress: (routeId: string) => number
): RoutePresenceSignal[] {
  return routes.map((route) => {
    const progress = clamp(getRouteProgress(route.id));
    const document = deriveDocumentReadiness(route, documents);
    const interview = deriveInterviewReadiness(route, sessions);
    const logistics = deriveLogisticsReadiness(route);
    const urgency = deriveUrgencyLevel(route);

    return {
      routeId: route.id,
      routeLabel: route.name,
      routeType: route.type,
      progress,
      documentReadiness: document.score,
      interviewReadiness: interview.score,
      logisticsReadiness: logistics,
      urgencyLevel: urgency,
      adaptationLevel: clamp(
        Math.round(progress * 0.34 + document.score * 0.26 + interview.score * 0.24 + logistics * 0.16)
      ),
      matchedDocumentCount: document.count,
      matchedInterviewCount: interview.count,
    };
  });
}

export function derivePresencePhenotype(
  signals: RoutePresenceSignal[],
  routeId?: string
): PresencePhenotype {
  if (signals.length === 0) {
    return {
      routeLabel: "Sem rota ativa",
      routeCount: 1,
      activeRouteProgress: 18,
      urgencyLevel: 0.22,
      interviewReadiness: 0.16,
      documentReadiness: 0.22,
      logisticsReadiness: 0.12,
      adaptationLevel: 0.18,
    };
  }

  const active = signals.find((signal) => signal.routeId === routeId) || signals[0];

  return {
    routeLabel: active.routeLabel,
    routeCount: signals.length,
    activeRouteProgress: active.progress,
    urgencyLevel: active.urgencyLevel,
    interviewReadiness: active.interviewReadiness / 100,
    documentReadiness: active.documentReadiness / 100,
    logisticsReadiness: active.logisticsReadiness / 100,
    adaptationLevel: active.adaptationLevel / 100,
  };
}
