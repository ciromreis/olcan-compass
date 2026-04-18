import type { Aura } from "@/stores/auraStore";
import type { ForgeDocument } from "@/stores/forge";
import type { InterviewSession } from "@/stores/interviews";
import type { UserApplication } from "@/stores/applications";
import type { RoutePresenceSignal } from "@/lib/presence-phenotype";
import type { Sprint } from "@/stores/sprints";
import type { UserRoute } from "@/stores/routes";
import type { UserProfile } from "@/lib/api";

export interface LifecycleStage {
  label: string;
  description: string;
  progressLabel: string;
  href: string;
  cta: string;
}

export interface GuidanceCard {
  title: string;
  description: string;
  meta: string;
  href: string;
  cta: string;
  tone: "moss" | "clay" | "sage";
}

export interface JourneyMetrics {
  hasRoutes: boolean;
  avgSprintProgress: number;
  pendingTasks: number;
  docProgress: number;
  interviewProgress: number;
  submittedApplications: number;
  urgentApplications: number;
}

export interface CommerceProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category?: string;
  tags?: string[];
  product_type?: string;
  price?: number;
  price_display?: string;
  rating?: number;
  is_featured?: boolean;
  is_olcan_official?: boolean;
  checkout_mode?: "external" | "catalog_only" | "internal";
  checkout_url?: string | null;
  catalog_url?: string | null;
}

export interface ContextContentCard {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  category?: string;
  tags?: string[];
}

export interface ActionItem {
  id: string;
  kind:
    | "route_milestone"
    | "sprint_task"
    | "application_deadline"
    | "document_work"
    | "interview_followup"
    | "commerce_recommendation"
    | "content_recommendation";
  title: string;
  description: string;
  href: string;
  cta: string;
  priority: "critical" | "high" | "medium" | "low";
  urgencyScore: number;
  dueDate?: string;
  meta?: string;
}

export interface JourneySnapshot {
  metrics: JourneyMetrics & {
    routeReadiness: number;
    routeRiskLabel: string;
    routeRiskScore: number;
  };
  lifecycle: LifecycleStage;
  focusCards: GuidanceCard[];
  actionItems: ActionItem[];
  nextBestAction: ActionItem | null;
  commerceRecommendation: CommerceProduct | null;
  contentRecommendation: ContextContentCard | null;
  primaryRouteSignal: RoutePresenceSignal | null;
  // Omega Telemetry
  economics?: UserProfile["economics"];
  momentum?: UserProfile["momentum"];
  psychology?: UserProfile["psychology"];
}

export interface AuraRailState {
  mood: string;
  auraName: string;
  auraLevel: number;
  streakCount: number;
  openQuestCount: number;
  nextBestAction: ActionItem | null;
  routeReadiness: number;
  routeRiskLabel: string;
  commerceRecommendation: CommerceProduct | null;
  contentRecommendation: ContextContentCard | null;
}

interface JourneySnapshotParams {
  user: UserProfile | null;
  aura: Aura | null;
  routes: UserRoute[];
  sprints: Sprint[];
  applications: UserApplication[];
  sessions: InterviewSession[];
  documents: ForgeDocument[];
  products: CommerceProduct[];
  contentCards: ContextContentCard[];
  routeSignals: RoutePresenceSignal[];
  /** True after OIOS quiz completes or when persisted snapshot includes a dominant archetype. */
  hasOiosArchetype: boolean;
  /** True when all Likert dimensions are complete in the psych store (`isComplete()`). */
  psychLikertComplete: boolean;
  /** True once the user opened the Likert flow (startedAt, any answers, or any dimension marked). */
  psychLikertStarted: boolean;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toDateValue(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function toDaysUntil(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.ceil((toDateValue(value) - Date.now()) / 86400000);
}

function formatDueDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function priorityFromDays(days: number): ActionItem["priority"] {
  if (days <= 2) return "critical";
  if (days <= 7) return "high";
  if (days <= 21) return "medium";
  return "low";
}

function urgencyFromDays(days: number, fallback = 35) {
  if (!Number.isFinite(days)) return fallback;
  if (days <= 0) return 100;
  if (days <= 2) return 92;
  if (days <= 7) return 80;
  if (days <= 14) return 64;
  if (days <= 30) return 48;
  return 28;
}

function computeSprintProgress(sprint: Sprint) {
  if (sprint.tasks.length === 0) return sprint.status === "completed" ? 100 : 0;
  const completed = sprint.tasks.filter((task) => task.done).length;
  return Math.round((completed / sprint.tasks.length) * 100);
}

function computeDocumentProgress(documents: ForgeDocument[], applications: UserApplication[]) {
  const applicationDocs = applications.flatMap((application) => application.documents);
  const applicationReadiness =
    applicationDocs.length > 0
      ? (applicationDocs.filter((document) => document.status === "ready").length / applicationDocs.length) * 100
      : 0;

  const forgeAverage =
    documents.length > 0
      ? documents.reduce((sum, document) => sum + (document.competitivenessScore || 42), 0) / documents.length
      : 0;

  if (applicationDocs.length === 0 && documents.length === 0) return 0;
  if (applicationDocs.length === 0) return Math.round(forgeAverage);
  if (documents.length === 0) return Math.round(applicationReadiness);
  return Math.round(applicationReadiness * 0.5 + forgeAverage * 0.5);
}

function computeInterviewProgress(sessions: InterviewSession[]) {
  const completed = sessions.filter((session) => session.status === "completed");
  if (completed.length === 0) return 0;
  const averageScore =
    completed.reduce((sum, session) => sum + (session.overallScore || 60), 0) / completed.length;
  return clamp(Math.round(averageScore * 0.65 + Math.min(completed.length, 5) * 7));
}

function computeMetrics(
  routes: UserRoute[],
  sprints: Sprint[],
  applications: UserApplication[],
  sessions: InterviewSession[],
  documents: ForgeDocument[],
  routeSignals: RoutePresenceSignal[]
) {
  const pendingTasks = sprints.reduce(
    (sum, sprint) => sum + sprint.tasks.filter((task) => !task.done).length,
    0
  );
  const avgSprintProgress =
    sprints.length > 0
      ? Math.round(
          sprints.reduce((sum, sprint) => sum + computeSprintProgress(sprint), 0) / sprints.length
        )
      : 0;
  const docProgress = computeDocumentProgress(documents, applications);
  const interviewProgress = computeInterviewProgress(sessions);
  const submittedApplications = applications.filter((application) => application.status === "submitted").length;
  const urgentApplications = applications.filter((application) => {
    if (["submitted", "accepted", "rejected"].includes(application.status)) return false;
    return toDaysUntil(application.deadline) <= 14;
  }).length;
  const primaryRouteSignal = routeSignals[0] || null;
  const routeReadiness = primaryRouteSignal?.adaptationLevel || 0;
  const routeRiskScore = primaryRouteSignal ? Math.round(primaryRouteSignal.urgencyLevel * 100) : 24;
  const routeRiskLabel =
    routeRiskScore >= 80
      ? "Risco alto"
      : routeRiskScore >= 55
      ? "Risco controlado"
      : "Ritmo saudável";

  return {
    metrics: {
      hasRoutes: routes.length > 0,
      avgSprintProgress,
      pendingTasks,
      docProgress,
      interviewProgress,
      submittedApplications,
      urgentApplications,
      routeReadiness,
      routeRiskLabel,
      routeRiskScore,
    },
    primaryRouteSignal,
  };
}

export function deriveLifecycleStage(metrics: JourneyMetrics): LifecycleStage {
  if (!metrics.hasRoutes) {
    return {
      label: "Definir direção",
      description: "Você ainda está estruturando sua rota principal de mobilidade.",
      progressLabel: "Escolha uma rota para destravar os próximos módulos com mais clareza.",
      href: "/routes",
      cta: "Criar rota",
    };
  }

  if (metrics.avgSprintProgress < 45 || metrics.pendingTasks > 0) {
    return {
      label: "Construir prontidão",
      description: "Seu foco agora é fechar lacunas operacionais e manter consistência na execução.",
      progressLabel: `${metrics.pendingTasks} tarefa${metrics.pendingTasks !== 1 ? "s" : ""} ainda exigem atenção.`,
      href: "/sprints",
      cta: "Ver sprints",
    };
  }

  if (metrics.docProgress < 60) {
    return {
      label: "Fortalecer narrativa",
      description: "Sua base documental ainda pode ganhar qualidade antes de aumentar o ritmo das candidaturas.",
      progressLabel: `Documentação consolidada em ${metrics.docProgress}%.`,
      href: "/forge",
      cta: "Refinar documentos",
    };
  }

  if (metrics.interviewProgress < 40) {
    return {
      label: "Treinar performance",
      description: "Este é o momento de transformar preparação em confiança para entrevistas e decisões críticas.",
      progressLabel: `Histórico de entrevistas em ${metrics.interviewProgress}%.`,
      href: "/interviews",
      cta: "Praticar entrevistas",
    };
  }

  return {
    label: "Executar candidaturas",
    description: "Sua jornada já tem base suficiente para avançar com mais intensidade nas submissões.",
    progressLabel: `${metrics.submittedApplications} candidatura${metrics.submittedApplications !== 1 ? "s" : ""} enviada${metrics.submittedApplications !== 1 ? "s" : ""}.`,
    href: "/applications",
    cta: "Gerir candidaturas",
  };
}

export function deriveGuidanceCards(metrics: JourneyMetrics, lifecycle: LifecycleStage): GuidanceCard[] {
  return [
    {
      title: "Risco operacional",
      description: metrics.pendingTasks > 0
        ? "Sua execução perde força enquanto tarefas com prazo próximo seguem abertas."
        : metrics.urgentApplications > 0
          ? "Há candidaturas com prazo sensível pedindo revisão imediata."
          : "Seu principal risco agora é dispersar foco e perder consistência.",
      meta: metrics.pendingTasks > 0
        ? `${metrics.pendingTasks} entrega${metrics.pendingTasks !== 1 ? "s" : ""} aberta${metrics.pendingTasks !== 1 ? "s" : ""}.`
        : metrics.urgentApplications > 0
          ? `${metrics.urgentApplications} deadline${metrics.urgentApplications !== 1 ? "s" : ""} urgente${metrics.urgentApplications !== 1 ? "s" : ""}.`
          : "Sem alertas críticos neste momento.",
      href: metrics.pendingTasks > 0 ? "/sprints" : "/applications",
      cta: metrics.pendingTasks > 0 ? "Fechar pendências" : "Revisar prazos",
      tone: "clay",
    },
    {
      title: "Apoio que mais agrega",
      description: metrics.docProgress < 60
        ? "Uma revisão documental tende a gerar mais retorno do que abrir novas frentes agora."
        : metrics.interviewProgress < 40
          ? "Treino guiado pode melhorar sua presença antes dos próximos marcos decisivos."
          : "Se quiser encurtar o caminho entre preparo e submissão, apoio especializado tende a destravar mais resultado.",
      meta: metrics.docProgress < 60
        ? "Sugestão: revisão de CV, essays ou tradução especializada."
        : metrics.interviewProgress < 40
          ? "Sugestão: coaching de entrevistas e simulações orientadas."
          : `Sugestão alinhada à etapa atual: ${lifecycle.label.toLowerCase()}.`,
      href: metrics.docProgress < 60 || metrics.interviewProgress < 40 ? "/marketplace" : "/marketplace/bookings",
      cta: "Ver especialistas",
      tone: "sage",
    },
  ];
}

function pickCommerceRecommendation(
  products: CommerceProduct[],
  metrics: JourneySnapshot["metrics"],
  lifecycle: LifecycleStage
) {
  if (products.length === 0) return null;

  const intentKeywords =
    metrics.docProgress < 60
      ? ["cv", "curriculo", "document", "essay", "traducao", "translation", "review"]
      : metrics.interviewProgress < 50
      ? ["interview", "entrevista", "coaching", "mock", "pitch"]
      : metrics.routeRiskScore >= 55
      ? ["visa", "application", "roadmap", "consult", "strategy"]
      : [normalizeText(lifecycle.label)];

  const ranked = products
    .map((product) => {
      const haystack = normalizeText(
        `${product.name} ${product.description} ${product.category} ${(product.tags || []).join(" ")}`
      );
      const score =
        intentKeywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 4 : 0), 0) +
        (product.is_olcan_official ? 2 : 0) +
        (product.is_featured ? 1 : 0);
      return { product, score };
    })
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.product || null;
}

function pickContentRecommendation(
  cards: ContextContentCard[],
  metrics: JourneySnapshot["metrics"],
  lifecycle: LifecycleStage
) {
  if (cards.length === 0) return null;

  const intentKeywords =
    metrics.docProgress < 60
      ? ["document", "essay", "cv", "application"]
      : metrics.interviewProgress < 50
      ? ["entrevista", "pitch", "comunicacao", "storytelling"]
      : metrics.routeRiskScore >= 55
      ? ["visa", "deadline", "planejamento", "rota"]
      : [normalizeText(lifecycle.label)];

  const ranked = cards
    .map((card) => {
      const haystack = normalizeText(
        `${card.title} ${card.excerpt} ${card.category} ${(card.tags || []).join(" ")}`
      );
      const score = intentKeywords.reduce(
        (sum, keyword) => sum + (haystack.includes(keyword) ? 4 : 0),
        0
      );
      return { card, score };
    })
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.card || null;
}

export function buildJourneySnapshot({
  user,
  aura: _aura,
  routes,
  sprints,
  applications,
  sessions,
  documents,
  products,
  contentCards,
  routeSignals,
  hasOiosArchetype,
  psychLikertComplete,
  psychLikertStarted,
}: JourneySnapshotParams): JourneySnapshot {
  const { metrics, primaryRouteSignal } = computeMetrics(
    routes,
    sprints,
    applications,
    sessions,
    documents,
    routeSignals
  );
  const lifecycle = deriveLifecycleStage(metrics);
  const focusCards = deriveGuidanceCards(metrics, lifecycle);
  const actionItems: ActionItem[] = [];

  if (!hasOiosArchetype && routes.length === 0) {
    actionItems.push({
      id: "oios-assessment",
      kind: "document_work",
      title: "Diagnóstico de mobilidade",
      description:
        "Descubra seu arquétipo de mobilidade e alinhe rota, documentos e presença ao seu perfil.",
      href: "/onboarding/quiz",
      cta: "Iniciar avaliação",
      priority: "high",
      urgencyScore: 92,
      meta: "Diagnóstico · Camada 1",
    });
  }

  if (hasOiosArchetype && !psychLikertComplete) {
    const resumed = psychLikertStarted;
    actionItems.push({
      id: "psych-likert-diagnostic",
      kind: "document_work",
      title: resumed
        ? "Diagnóstico psicológico (8 blocos)"
        : "Complementar: diagnóstico Likert",
      description: resumed
        ? "Continue o mapeamento (confiança, risco, disciplina, decisões, ansiedade, objetivos, finanças) para o Score de Certeza e leituras de prontidão."
        : "Depois do diagnóstico inicial, o mapeamento Likert de oito dimensões alimenta o Score de Certeza e as telas de prontidão.",
      href: "/profile/psych",
      cta: resumed ? "Continuar diagnóstico" : "Iniciar diagnóstico",
      priority: resumed ? "high" : "medium",
      urgencyScore: resumed ? 85 : 66,
      meta: "Diagnóstico · Camada 1",
    });
  }

  routes
    .flatMap((route) =>
      route.milestones
        .filter((milestone) => milestone.status !== "completed")
        .map((milestone) => ({ route, milestone }))
    )
    .sort((left, right) => {
      if (left.milestone.status === "blocked" && right.milestone.status !== "blocked") return -1;
      if (right.milestone.status === "blocked" && left.milestone.status !== "blocked") return 1;
      return toDateValue(left.milestone.dueDate) - toDateValue(right.milestone.dueDate);
    })
    .slice(0, 3)
    .forEach(({ route, milestone }) => {
      const days = toDaysUntil(milestone.dueDate);
      actionItems.push({
        id: `route-${route.id}-${milestone.id}`,
        kind: "route_milestone",
        title: `${route.name}: ${milestone.name}`,
        description:
          milestone.status === "blocked"
            ? `Este marco está bloqueado na frente ${milestone.group}.`
            : `Avance o próximo marco da sua rota em ${milestone.group}.`,
        href: `/routes/${route.id}`,
        cta: "Abrir rota",
        priority: milestone.status === "blocked" ? "critical" : priorityFromDays(days),
        urgencyScore: milestone.status === "blocked" ? 97 : urgencyFromDays(days, 42),
        dueDate: milestone.dueDate,
        meta: milestone.dueDate ? `Prazo ${formatDueDate(milestone.dueDate)}` : milestone.group,
      });
    });

  sprints
    .filter((sprint) => sprint.status !== "completed")
    .flatMap((sprint) =>
      sprint.tasks.filter((task) => !task.done).map((task) => ({ sprint, task }))
    )
    .sort((left, right) => toDateValue(left.task.dueDate) - toDateValue(right.task.dueDate))
    .slice(0, 4)
    .forEach(({ sprint, task }) => {
      const days = toDaysUntil(task.dueDate);
      actionItems.push({
        id: `sprint-${sprint.id}-${task.id}`,
        kind: "sprint_task",
        title: task.name,
        description: `Sprint ${sprint.name} na dimensão ${sprint.dimension}.`,
        href: `/sprints/${sprint.id}`,
        cta: "Executar sprint",
        priority: priorityFromDays(days),
        urgencyScore: urgencyFromDays(days, 58),
        dueDate: task.dueDate,
        meta: task.dueDate ? `Vence ${formatDueDate(task.dueDate)}` : sprint.dimension,
      });
    });

  applications
    .filter((application) => !["submitted", "accepted", "rejected"].includes(application.status))
    .sort((left, right) => toDateValue(left.deadline) - toDateValue(right.deadline))
    .slice(0, 3)
    .forEach((application) => {
      const days = toDaysUntil(application.deadline);
      actionItems.push({
        id: `application-${application.id}`,
        kind: "application_deadline",
        title: application.program,
        description: "Há uma candidatura em aberto pedindo fechamento operacional.",
        href: `/applications/${application.id}`,
        cta: "Revisar candidatura",
        priority: priorityFromDays(days),
        urgencyScore: urgencyFromDays(days, 60),
        dueDate: application.deadline,
        meta: application.deadline ? `Deadline ${formatDueDate(application.deadline)}` : application.country,
      });
    });

  if (documents.length === 0) {
    actionItems.push({
      id: "document-bootstrap",
      kind: "document_work",
      title: "Criar narrativa-base",
      description: "Você ainda não iniciou seus documentos centrais para a jornada.",
      href: "/forge",
      cta: "Abrir documentos",
      priority: "high",
      urgencyScore: 76,
      meta: "CV ou carta de motivação",
    });
  } else {
    documents
      .filter((document) => (document.competitivenessScore || 0) < 68)
      .sort((left, right) => (left.competitivenessScore || 0) - (right.competitivenessScore || 0))
      .slice(0, 2)
      .forEach((document) => {
        actionItems.push({
          id: `document-${document.id}`,
          kind: "document_work",
          title: document.title,
          description: "Documento com competitividade abaixo do ideal para a etapa atual.",
          href: `/forge/${document.id}`,
          cta: "Refinar documento",
          priority: "medium",
          urgencyScore: 57,
          meta: `Score ${document.competitivenessScore || 0}`,
        });
      });
  }

  const latestSession = [...sessions].sort(
    (left, right) =>
      toDateValue(right.completedAt || right.startedAt) - toDateValue(left.completedAt || left.startedAt)
  )[0];

  if (!latestSession) {
    actionItems.push({
      id: "interview-bootstrap",
      kind: "interview_followup",
      title: "Abrir primeira simulação",
      description: "Sua prontidão de comunicação ainda não foi testada em ambiente guiado.",
      href: "/interviews/new",
      cta: "Simular entrevista",
      priority: "medium",
      urgencyScore: 52,
      meta: "Treino inicial",
    });
  } else if ((latestSession.overallScore || 0) < 75) {
    actionItems.push({
      id: `interview-${latestSession.id}`,
      kind: "interview_followup",
      title: `Refazer ${latestSession.typeLabel}`,
      description: "A última sessão ainda indica espaço material para ganho de confiança e clareza.",
      href: `/interviews/${latestSession.id}`,
      cta: "Revisar feedback",
      priority: "medium",
      urgencyScore: 54,
      meta: `Score ${latestSession.overallScore || 0}`,
    });
  }

  const commerceRecommendation = pickCommerceRecommendation(products, metrics, lifecycle);
  const contentRecommendation = pickContentRecommendation(contentCards, metrics, lifecycle);

  if (commerceRecommendation) {
    actionItems.push({
      id: `commerce-${commerceRecommendation.id}`,
      kind: "commerce_recommendation",
      title: commerceRecommendation.name,
      description: "Recomendação comercial alinhada ao seu gargalo atual de execução.",
      href: `/marketplace/products/${commerceRecommendation.slug}`,
      cta: "Ver oferta",
      priority: "low",
      urgencyScore: 26,
      meta: commerceRecommendation.price_display || commerceRecommendation.category,
    });
  }

  if (contentRecommendation) {
    actionItems.push({
      id: `content-${contentRecommendation.id}`,
      kind: "content_recommendation",
      title: contentRecommendation.title,
      description: "Conteúdo editorial para orientar a próxima decisão da sua rota.",
      href: contentRecommendation.href,
      cta: "Ler contexto",
      priority: "low",
      urgencyScore: 22,
      meta: contentRecommendation.category,
    });
  }

  const orderedActionItems = actionItems
    .sort((left, right) => right.urgencyScore - left.urgencyScore)
    .slice(0, 8);

  const nextBestAction =
    orderedActionItems.find(
      (item) => item.kind !== "commerce_recommendation" && item.kind !== "content_recommendation"
    ) || orderedActionItems[0] || null;

  return {
    metrics,
    lifecycle,
    focusCards,
    actionItems: orderedActionItems,
    nextBestAction,
    commerceRecommendation,
    contentRecommendation,
    primaryRouteSignal,
    economics: user?.economics,
    momentum: user?.momentum,
    psychology: user?.psychology,
  };
}

export function buildAuraRailState(
  snapshot: JourneySnapshot,
  aura: Aura | null,
  options: { streakCount: number; openQuestCount: number }
): AuraRailState {
  const routeReadiness = snapshot.metrics.routeReadiness;
  const mood =
    routeReadiness >= 72
      ? "Em cadência"
      : snapshot.metrics.routeRiskScore >= 80
      ? "Em alerta"
      : "Em adaptação";

  return {
    mood,
    auraName: aura?.name || "Aura",
    auraLevel: aura?.level || 1,
    streakCount: options.streakCount,
    openQuestCount: options.openQuestCount,
    nextBestAction: snapshot.nextBestAction,
    routeReadiness,
    routeRiskLabel: snapshot.metrics.routeRiskLabel,
    commerceRecommendation: snapshot.commerceRecommendation,
    contentRecommendation: snapshot.contentRecommendation,
  };
}
