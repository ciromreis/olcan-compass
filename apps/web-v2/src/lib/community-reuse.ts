import type { CommunityItem, CommunityItemTopic, CommunitySourceRef } from "@/stores/community";

export interface CommunityWorkflowTarget {
  href: string;
  label: string;
}

export interface CommunityReuseTarget {
  href: string;
  label: string;
}

interface CountryHint {
  applicationLabel: string;
  routeCode: string;
  signals: string[];
}

const COUNTRY_HINTS: CountryHint[] = [
  { applicationLabel: "Alemanha", routeCode: "DE", signals: ["alemanha", "berlim", "munique", "munich", "germany", "deutschland", "daad", "tu berlin"] },
  { applicationLabel: "Canadá", routeCode: "CA", signals: ["canadá", "canada", "toronto", "ubc", "vancouver"] },
  { applicationLabel: "EUA", routeCode: "US", signals: ["estados unidos", "eua", "usa", "united states", "nyu", "mit", "stanford"] },
  { applicationLabel: "Irlanda", routeCode: "IE", signals: ["irlanda", "ireland", "dublin", "trinity"] },
  { applicationLabel: "Holanda", routeCode: "NL", signals: ["holanda", "netherlands", "amsterdam", "uva", "delft"] },
  { applicationLabel: "Portugal", routeCode: "PT", signals: ["portugal", "lisboa", "porto"] },
  { applicationLabel: "Reino Unido", routeCode: "GB", signals: ["reino unido", "united kingdom", "uk", "london", "oxford", "cambridge"] },
  { applicationLabel: "Suécia", routeCode: "CH", signals: ["suécia", "sweden", "stockholm", "klarna"] },
];

function buildQuery(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value?.trim()) return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getNormalizedMetadata(item: CommunityItem): string[] {
  return [item.title, item.description, ...(item.tags || []), item.sourceRef?.entityLabel || ""]
    .map((value) => value.toLowerCase())
    .filter(Boolean);
}

function includesAny(values: string[], candidates: string[]): boolean {
  return candidates.some((candidate) => values.some((value) => value.includes(candidate)));
}

function getCountryHint(item: CommunityItem): CountryHint | undefined {
  const values = getNormalizedMetadata(item);

  return COUNTRY_HINTS.find((country) => includesAny(values, country.signals));
}

function getForgeDraftType(item: CommunityItem): string {
  const values = getNormalizedMetadata(item);
  if (includesAny(values, ["currículo", "curriculo", "cv", "resume", "résumé"])) return "cv";
  if (includesAny(values, ["proposta de pesquisa", "research proposal", "phd", "research"])) return "research_proposal";
  if (includesAny(values, ["personal statement"])) return "personal_statement";
  if (includesAny(values, ["carta de recomendação", "carta de recomendacao", "recommendation"])) return "recommendation";
  return "motivation_letter";
}

function getApplicationDraftType(item: CommunityItem): string {
  if (item.topic === "scholarship") return "Bolsa";
  if (item.topic === "career") return "Emprego";
  const values = getNormalizedMetadata(item);
  if (includesAny(values, ["bolsa", "scholarship", "daad", "chevening", "fulbright"])) return "Bolsa";
  if (includesAny(values, ["vaga", "job", "career", "work", "emprego"])) return "Emprego";
  return "Mestrado";
}

function getRouteDraftType(item: CommunityItem): string {
  if (item.topic === "scholarship") return "scholarship";
  if (item.topic === "career") return "employment";
  if (item.topic === "visa") return "employment";
  const values = getNormalizedMetadata(item);
  if (includesAny(values, ["bolsa", "scholarship"])) return "scholarship";
  if (includesAny(values, ["emprego", "work", "job", "vaga", "relocação", "relocacao", "visa"])) return "employment";
  if (includesAny(values, ["pesquisa", "research", "phd"])) return "research";
  return "research";
}

const TOPIC_WORKFLOW_TARGETS: Partial<Record<CommunityItemTopic, CommunityWorkflowTarget>> = {
  narrative: { href: "/forge", label: "Explorar no Forge" },
  interview: { href: "/interviews", label: "Explorar entrevistas" },
  scholarship: { href: "/applications", label: "Explorar candidaturas" },
  career: { href: "/applications", label: "Explorar candidaturas" },
  visa: { href: "/routes", label: "Explorar rotas" },
  readiness: { href: "/routes", label: "Explorar rotas" },
};

export const COMMUNITY_ENGINE_ACTION_LABELS: Record<CommunitySourceRef["engine"], string> = {
  forge: "Continuar no Forge",
  applications: "Abrir candidatura",
  routes: "Voltar para rota",
};

const DEFAULT_WORKFLOW_LABELS: Record<CommunitySourceRef["engine"], string> = {
  forge: "Ver análise",
  applications: "Abrir ajustes",
  routes: "Ver milestones",
};

export function getCommunityWorkflowTarget(item: CommunityItem): CommunityWorkflowTarget | null {
  if (!item.sourceRef) {
    return TOPIC_WORKFLOW_TARGETS[item.topic] ?? null;
  }

  const entityId = item.sourceRef.entityId;
  const normalizedTags = item.tags.map((tag) => tag.toLowerCase());
  const hasTag = (value: string) => normalizedTags.some((tag) => tag.includes(value));

  if (item.sourceRef.engine === "forge") {
    if (hasTag("currículo") || hasTag("cv")) {
      return { href: `/forge/${entityId}/export`, label: "Exportar CV" };
    }
    if (hasTag("carta de motivação") || hasTag("personal statement")) {
      return { href: `/forge/${entityId}/alignment`, label: "Ver alinhamento" };
    }
    if (hasTag("proposta de pesquisa")) {
      return { href: `/forge/${entityId}/coach`, label: "Ver coach" };
    }
    if (hasTag("carta de recomendação")) {
      return { href: `/forge/${entityId}/versions`, label: "Ver versões" };
    }
    return { href: `/forge/${entityId}/analysis`, label: DEFAULT_WORKFLOW_LABELS.forge };
  }

  if (item.sourceRef.engine === "applications") {
    if (item.topic === "scholarship") {
      return { href: `/applications/${entityId}/settings`, label: "Revisar critérios" };
    }
    if (item.topic === "career") {
      return { href: `/applications/${entityId}`, label: "Ver progresso" };
    }
    return { href: `/applications/${entityId}/settings`, label: DEFAULT_WORKFLOW_LABELS.applications };
  }

  if (item.sourceRef.engine === "routes") {
    if (item.topic === "visa") {
      return { href: `/routes/${entityId}/risk`, label: "Ver riscos" };
    }
    if (item.topic === "readiness") {
      return { href: `/routes/${entityId}/timeline`, label: "Ver timeline" };
    }
    return { href: `/routes/${entityId}/milestones`, label: DEFAULT_WORKFLOW_LABELS.routes };
  }

  return null;
}

export function getCommunityDirectReuseTarget(item: CommunityItem): CommunityReuseTarget | null {
  if (item.topic === "community") return null;

  if (item.topic === "narrative") {
    return {
      href: `/forge/new${buildQuery({
        type: getForgeDraftType(item),
        title: item.title,
        targetProgram: item.sourceRef?.entityLabel,
      })}`,
      label: "Criar draft no Forge",
    };
  }

  if (item.topic === "scholarship" || item.topic === "career") {
    const countryHint = getCountryHint(item);
    return {
      href: `/applications/new${buildQuery({
        type: getApplicationDraftType(item),
        program: item.title,
        country: countryHint?.applicationLabel,
      })}`,
      label: "Criar candidatura derivada",
    };
  }

  if (item.topic === "visa" || item.topic === "readiness") {
    const countryHint = getCountryHint(item);
    return {
      href: `/routes/new${buildQuery({
        type: getRouteDraftType(item),
        country: countryHint?.routeCode,
      })}`,
      label: "Gerar rota derivada",
    };
  }

  if (item.topic === "interview") {
    return {
      href: "/interviews/new",
      label: "Iniciar mock derivado",
    };
  }

  return null;
}
