/**
 * MECE Task Generator — EC-1
 *
 * Pure function that generates a default task checklist grouped into the four
 * ReadinessDomain buckets (academic / financial / logistical / risk) when a
 * dossier is created from an opportunity.
 *
 * Mirrors: apps/api-core-v2.5/app/services/dossier_task_generator.py
 *
 * Spec reference: SPEC_Dossier_System_v2_5.md §3
 */

import type {
  Task,
  ReadinessDomain,
  OpportunityContext,
  ProfileSnapshot,
} from "@/types/dossier-system";

// ─── Seed templates per domain ──────────────────────────────────────────────

interface TaskSeed {
  title: string;
  description: string;
  readinessDomain: ReadinessDomain;
  type: Task["type"];
  priority: Task["priority"];
}

const ACADEMIC_SEEDS_EDUCATION: TaskSeed[] = [
  {
    title: "Reunir históricos acadêmicos oficiais",
    description:
      "Solicitar históricos (transcripts) de cada instituição de ensino superior anterior. Garantir apostila/tradução juramentada se necessário.",
    readinessDomain: "academic",
    type: "admin",
    priority: "high",
  },
  {
    title: "Preparar resultados de testes padronizados",
    description:
      "Verificar quais exames são exigidos (GRE, GMAT, IELTS, TOEFL, etc.) e agendar ou enviar scores.",
    readinessDomain: "academic",
    type: "research",
    priority: "high",
  },
  {
    title: "Obter cartas de recomendação",
    description:
      "Identificar recomendadores, solicitar cartas com antecedência mínima de 4 semanas e acompanhar envio.",
    readinessDomain: "academic",
    type: "contact",
    priority: "high",
  },
  {
    title: "Mapear learning outcomes do programa",
    description:
      "Estudar o currículo e objetivos do programa-alvo e conectar com sua experiência e motivação.",
    readinessDomain: "academic",
    type: "research",
    priority: "medium",
  },
];

const ACADEMIC_SEEDS_EMPLOYMENT: TaskSeed[] = [
  {
    title: "Preparar portfólio / amostras de trabalho",
    description:
      "Reunir projetos, código, publicações ou cases que demonstrem competência para a vaga.",
    readinessDomain: "academic",
    type: "document",
    priority: "high",
  },
  {
    title: "Mapear competências vs. requisitos da vaga",
    description:
      "Analisar a descrição da vaga e identificar gaps de skills para endereçar no CV e cover letter.",
    readinessDomain: "academic",
    type: "research",
    priority: "high",
  },
  {
    title: "Obter referências profissionais",
    description:
      "Confirmar 2–3 referências profissionais disponíveis para contato pelo recrutador.",
    readinessDomain: "academic",
    type: "contact",
    priority: "high",
  },
  {
    title: "Pesquisar cultura e valores da empresa",
    description:
      "Entender missão, valores e stack tecnológico para alinhar narrativa da candidatura.",
    readinessDomain: "academic",
    type: "research",
    priority: "medium",
  },
];

const FINANCIAL_SEEDS: TaskSeed[] = [
  {
    title: "Estimar custos totais (tuição + moradia + vida)",
    description:
      "Calcular custo total para a duração do programa/posição, incluindo seguro saúde e imprevistos.",
    readinessDomain: "financial",
    type: "research",
    priority: "high",
  },
  {
    title: "Pesquisar e aplicar para bolsas/funding",
    description:
      "Listar editais de bolsa, assistantships, fellowships ou financiamento externo compatíveis.",
    readinessDomain: "financial",
    type: "research",
    priority: "high",
  },
  {
    title: "Reunir documentação de comprovação financeira",
    description:
      "Preparar extratos bancários, declaração de renda ou carta de patrocínio conforme exigido.",
    readinessDomain: "financial",
    type: "admin",
    priority: "medium",
  },
  {
    title: "Planejar reserva de contingência (mín. 15%)",
    description:
      "Garantir buffer financeiro de pelo menos 15% acima do custo estimado para imprevistos.",
    readinessDomain: "financial",
    type: "admin",
    priority: "medium",
  },
];

const LOGISTICAL_SEEDS: TaskSeed[] = [
  {
    title: "Confirmar deadline e requisitos do portal",
    description:
      "Verificar data-limite oficial, formato de submissão e documentos exigidos no portal de inscrição.",
    readinessDomain: "logistical",
    type: "admin",
    priority: "critical",
  },
  {
    title: "Planejar timeline de visto / autorização de trabalho",
    description:
      "Pesquisar tipo de visto necessário, prazos de processamento e documentos exigidos pelo consulado.",
    readinessDomain: "logistical",
    type: "research",
    priority: "high",
  },
  {
    title: "Iniciar busca por moradia",
    description:
      "Definir janela de busca por acomodação no destino, considerando proximidade e custo.",
    readinessDomain: "logistical",
    type: "research",
    priority: "medium",
  },
  {
    title: "Autenticar / apostilar documentos",
    description:
      "Verificar exigências de apostila de Haia ou consularização para o país de destino.",
    readinessDomain: "logistical",
    type: "admin",
    priority: "high",
  },
];

const RISK_SEEDS: TaskSeed[] = [
  {
    title: "Identificar 2 oportunidades backup (plano B)",
    description:
      "Selecionar pelo menos 2 programas/vagas alternativos caso a candidatura principal não avance.",
    readinessDomain: "risk",
    type: "research",
    priority: "high",
  },
  {
    title: "Definir checkpoints internos (7d antes do deadline)",
    description:
      "Criar deadlines internas com 7 dias de antecedência para revisão final antes da submissão oficial.",
    readinessDomain: "risk",
    type: "admin",
    priority: "high",
  },
  {
    title: "Planejar resposta a rejeição / waitlist",
    description:
      "Definir estratégia de pivot: qual alternativa ativar, como solicitar feedback, e próximos passos.",
    readinessDomain: "risk",
    type: "research",
    priority: "medium",
  },
  {
    title: "Reservar folga no cronograma para imprevistos",
    description:
      "Adicionar buffer de pelo menos 1 semana no cronograma para lidar com atrasos documentais inesperados.",
    readinessDomain: "risk",
    type: "admin",
    priority: "medium",
  },
];

// ─── Generator ──────────────────────────────────────────────────────────────

export interface GenerateTasksInput {
  opportunity: Partial<OpportunityContext> | null;
  profileSnapshot: Partial<ProfileSnapshot> | null;
  dossierId: string;
  deadline?: Date | null;
}

/**
 * Generate MECE default tasks for a dossier based on opportunity type.
 *
 * Pure function — no side effects, no API calls.
 * Returns at least one task per readiness domain.
 */
export function generateDefaultTasks(input: GenerateTasksInput): Task[] {
  const { opportunity, dossierId, deadline } = input;

  const oppType = opportunity?.type || "education";
  const isEmployment = oppType === "employment" || oppType === "entrepreneurship";

  // Pick academic seeds based on opportunity type
  const academicSeeds = isEmployment
    ? ACADEMIC_SEEDS_EMPLOYMENT
    : ACADEMIC_SEEDS_EDUCATION;

  const allSeeds: TaskSeed[] = [
    ...academicSeeds,
    ...FINANCIAL_SEEDS,
    ...LOGISTICAL_SEEDS,
    ...RISK_SEEDS,
  ];

  // Compute due dates: distribute tasks before the deadline
  const now = new Date();
  const effectiveDeadline = deadline ? new Date(deadline) : null;

  return allSeeds.map((seed, index): Task => {
    // Stagger due dates: logistical/risk first, academic/financial later
    const dueDate = effectiveDeadline
      ? computeDueDate(effectiveDeadline, seed.readinessDomain, now)
      : undefined;

    return {
      id: `gen-${dossierId}-${index}-${Date.now()}`,
      dossierId,
      title: seed.title,
      description: seed.description,
      type: seed.type,
      category: mapTypeToCategory(seed.type),
      status: "todo",
      priority: seed.priority,
      readinessDomain: seed.readinessDomain,
      createdAt: now,
      dueDate,
    };
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeDueDate(
  deadline: Date,
  domain: ReadinessDomain,
  now: Date,
): Date {
  const totalMs = deadline.getTime() - now.getTime();
  if (totalMs <= 0) return deadline;

  // Domain-based scheduling: risk & logistical tasks due earlier
  const fractionByDomain: Record<ReadinessDomain, number> = {
    risk: 0.3,       // Due at 30% of remaining time
    logistical: 0.5, // Due at 50%
    financial: 0.6,  // Due at 60%
    academic: 0.7,   // Due at 70%
  };

  const fraction = fractionByDomain[domain];
  return new Date(now.getTime() + totalMs * fraction);
}

function mapTypeToCategory(type: Task["type"]): Task["category"] {
  switch (type) {
    case "document":
      return "content_creation";
    case "research":
      return "research";
    case "contact":
      return "networking";
    case "admin":
      return "administrative";
    case "review":
      return "review";
    default:
      return "other";
  }
}
