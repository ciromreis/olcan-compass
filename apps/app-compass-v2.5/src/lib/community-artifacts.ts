import type { CommunityItemTopic, CommunitySourceRef } from "@/stores/community";
import type { ForgeDocument, DocType } from "@/stores/forge";
import type { UserApplication } from "@/stores/applications";
import type { UserRoute, Milestone } from "@/stores/routes";

export interface SaveArtifactDraft {
  title: string;
  description: string;
  topic: CommunityItemTopic;
  source: string;
  href: string;
  tags: string[];
  sourceRef: CommunitySourceRef;
}

function getForgeTopic(type: DocType): CommunityItemTopic {
  if (type === "cv") return "career";
  if (type === "research_proposal") return "readiness";
  return "narrative";
}

function getApplicationTopic(type: string): CommunityItemTopic {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("bolsa")) return "scholarship";
  if (normalizedType.includes("emprego")) return "career";
  return "narrative";
}

function getRouteTopic(type: string, country: string): CommunityItemTopic {
  const normalizedType = type.toLowerCase();
  const normalizedCountry = country.toLowerCase();
  if (normalizedType.includes("bolsa")) return "scholarship";
  if (normalizedType.includes("emprego")) return "career";
  if (normalizedCountry.includes("alemanha")) return "visa";
  return "readiness";
}

export function buildForgeArtifactDraft(params: {
  doc: ForgeDocument;
  content: string;
  typeLabel: string;
}): SaveArtifactDraft {
  const { doc, content, typeLabel } = params;
  const topic = getForgeTopic(doc.type);
  const description = content.trim().slice(0, 220) || `Artefato salvo a partir de ${typeLabel.toLowerCase()}.`;

  return {
    title: doc.title,
    description,
    topic,
    source: "Forge",
    href: `/forge/${doc.id}`,
    tags: [typeLabel, topic, doc.targetProgram || "forge"],
    sourceRef: {
      engine: "forge",
      entityId: doc.id,
      entityLabel: doc.title,
    },
  };
}

export function buildApplicationArtifactDraft(app: UserApplication): SaveArtifactDraft {
  const pendingDocs = app.documents.filter((doc) => doc.status !== "ready").length;
  const description = pendingDocs > 0
    ? `${app.type} em ${app.country} com ${pendingDocs} documento${pendingDocs !== 1 ? "s" : ""} pendente${pendingDocs !== 1 ? "s" : ""} e match de ${app.match}%.`
    : `${app.type} em ${app.country} pronta para submissão, com match de ${app.match}%.`;
  const topic = getApplicationTopic(app.type);

  return {
    title: app.program,
    description,
    topic,
    source: "Applications",
    href: `/applications/${app.id}`,
    tags: [app.country, app.type, `match-${app.match}`],
    sourceRef: {
      engine: "applications",
      entityId: app.id,
      entityLabel: app.program,
    },
  };
}

export function buildRouteArtifactDraft(params: {
  route: UserRoute;
  progress: number;
  riskCount: number;
  nextMilestone: Milestone | null;
}): SaveArtifactDraft {
  const { route, progress, riskCount, nextMilestone } = params;
  const focusLabel = nextMilestone ? `Foco atual: ${nextMilestone.name}.` : "Rota em andamento.";
  const description = `${route.type} para ${route.country} com progresso de ${progress}% e ${riskCount} risco${riskCount !== 1 ? "s" : ""} ativo${riskCount !== 1 ? "s" : ""}. ${focusLabel}`;
  const topic = getRouteTopic(route.type, route.country);

  return {
    title: route.name,
    description,
    topic,
    source: "Routes",
    href: `/routes/${route.id}`,
    tags: [route.country, route.type, `${progress}%`],
    sourceRef: {
      engine: "routes",
      entityId: route.id,
      entityLabel: route.name,
    },
  };
}
