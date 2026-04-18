import { type Milestone, type UserRoute } from "@/stores/routes";

export type RouteIntentType =
  | "scholarship"
  | "scholarship_chevening"
  | "scholarship_daad"
  | "scholarship_fulbright"
  | "employment"
  | "research"
  | "startup"
  | "exchange"
  | "job_relocation"
  | "postdoc"
  | "academic_visiting"
  | "professional_certification"
  | "intracompany_transfer"
  | "conference_representation"
  | "corporate_secondment"
  | "volunteer_abroad"
  | "ngo_mission"
  | "retirement_abroad"
  | "remote_work"
  | "digital_nomad"
  | "investor_visa";

export interface RoutePlannerConfig {
  type: RouteIntentType;
  country: string;
  budget: string;
  timeline: string;
}

export const COUNTRY_OPTIONS = [
  { value: "DE", label: "Alemanha" },
  { value: "AU", label: "Austrália" },
  { value: "CA", label: "Canadá" },
  { value: "US", label: "Estados Unidos" },
  { value: "FR", label: "França" },
  { value: "NL", label: "Holanda" },
  { value: "IE", label: "Irlanda" },
  { value: "JP", label: "Japão" },
  { value: "PT", label: "Portugal" },
  { value: "GB", label: "Reino Unido" },
  { value: "CH", label: "Suíça" },
  { value: "BE", label: "Bélgica" },
  { value: "IT", label: "Itália" },
  { value: "ES", label: "Espanha" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
  { value: "18m", label: "18 meses" },
  { value: "24m", label: "24 meses" },
] as const;

interface RouteTemplate {
  typeLabel: string;
  namePrefix: string;
  constraints?: {
    wordCount?: number;
    specificRequirements?: string[];
  };
  milestoneGroups: Array<{
    group: string;
    items: string[];
  }>;
}

const ROUTE_TEMPLATES: Record<RouteIntentType, RouteTemplate> = {
  scholarship: {
    typeLabel: "Bolsa de Estudos",
    namePrefix: "Bolsa",
    milestoneGroups: [
      { group: "Estratégia", items: ["Pesquisar programas e universidades-alvo", "Definir requisitos e prazos"] },
      { group: "Documentação", items: ["Redigir carta de motivação", "Adaptar CV acadêmico", "Solicitar cartas de recomendação"] },
      { group: "Aplicação", items: ["Preparar proficiência em idioma", "Submeter candidatura completa"] },
      { group: "Pós-Envio", items: ["Preparar para entrevista", "Organizar documentos de visto"] },
    ],
  },
  scholarship_chevening: {
    typeLabel: "Bolsa Chevening (UK)",
    namePrefix: "Chevening",
    constraints: {
      wordCount: 500,
      specificRequirements: ["Liderança", "Networking", "Estudar no UK", "Plano de Carreira"],
    },
    milestoneGroups: [
      { group: "Estratégia", items: ["Definir 3 cursos/universidades UK", "Mapear exemplos de Liderança (STAR)"] },
      { group: "Documentação", items: ["Escrever Draft: Leadership Essay", "Escrever Draft: Networking Essay", "Escrever Draft: Study in the UK", "Escrever Draft: Career Plan"] },
      { group: "Aplicação", items: ["Finalizar English Proficiency", "Submeter Portal Chevening"] },
      { group: "Pós-Envio", items: ["Preparar para Entrevista", "Organizar referências"] },
    ],
  },
  scholarship_daad: {
    typeLabel: "Bolsa DAAD (Alemanha)",
    namePrefix: "DAAD",
    constraints: {
      wordCount: 500,
      specificRequirements: ["Plano de Pesquisa", "Impacto no País de Origem"],
    },
    milestoneGroups: [
      { group: "Preparação", items: ["Encontrar orientador/curso na Alemanha", "Solicitar Carta de Aceite/Apoio"] },
      { group: "Documentação", items: ["Redigir Research Proposal", "Adaptar CV para Padrão Europass", "Escrever Motivation Letter (DAAD layout)"] },
      { group: "Aplicação", items: ["Traduzir Históricos (Alemão/Inglês)", "Submeter Portal DAAD"] },
    ],
  },
  scholarship_fulbright: {
    typeLabel: "Bolsa Fulbright (EUA)",
    namePrefix: "Fulbright",
    constraints: {
      wordCount: 600,
      specificRequirements: ["Personal Statement", "Study/Research Objective"],
    },
    milestoneGroups: [
      { group: "Estratégia", items: ["Definir American Universities Core", "Preparar GRE/TOEFL Prep"] },
      { group: "Documentação", items: ["Escrever Personal Statement", "Escrever Study Objective", "Conseguir 3 recomendações acadêmicas"] },
      { group: "Aplicação", items: ["Finalizar Application Portal", "Organizar portfólio (se aplicável)"] },
    ],
  },
  employment: {
    typeLabel: "Relocação por Emprego",
    namePrefix: "Relocação",
    milestoneGroups: [
      { group: "Preparação", items: ["Ajustar posicionamento profissional", "Atualizar CV e LinkedIn"] },
      { group: "Aplicação", items: ["Criar meta de candidaturas prioritárias", "Praticar entrevistas técnicas", "Conduzir follow-ups estratégicos"] },
      { group: "Oferta", items: ["Negociar proposta e pacote", "Validar suporte migratório"] },
      { group: "Relocação", items: ["Organizar housing e mudança", "Planejar documentação pós-chegada"] },
    ],
  },
  research: {
    typeLabel: "Pesquisa / PhD",
    namePrefix: "Pesquisa",
    milestoneGroups: [
      { group: "Preparação", items: ["Mapear linhas e orientadores-alvo", "Definir hipótese e foco de pesquisa"] },
      { group: "Documentação", items: ["Escrever research proposal", "Consolidar histórico acadêmico", "Solicitar recomendações acadêmicas"] },
      { group: "Aplicação", items: ["Enviar contatos estratégicos", "Submeter candidatura e funding"] },
      { group: "Pós-aceite", items: ["Planejar visto e instalação", "Organizar cronograma de chegada"] },
    ],
  },
  startup: {
    typeLabel: "Startup Visa",
    namePrefix: "Startup",
    milestoneGroups: [
      { group: "Estratégia", items: ["Validar tese e mercado-alvo", "Mapear critérios do programa"] },
      { group: "Documentação", items: ["Estruturar pitch e deck", "Consolidar projeções financeiras", "Preparar narrativa do fundador"] },
      { group: "Aplicação", items: ["Submeter ao programa/visa pathway", "Preparar entrevistas com avaliadores"] },
      { group: "Execução", items: ["Planejar setup operacional", "Organizar mudança e compliance inicial"] },
    ],
  },
  exchange: {
    typeLabel: "Intercâmbio",
    namePrefix: "Intercâmbio",
    milestoneGroups: [
      { group: "Preparação", items: ["Escolher programa e janela ideal", "Definir orçamento e duração"] },
      { group: "Documentação", items: ["Organizar application package", "Preparar idioma e seguro"] },
      { group: "Aplicação", items: ["Enviar candidatura", "Confirmar acomodação e logística"] },
      { group: "Embarque", items: ["Organizar viagem", "Preparar chegada e adaptação"] },
    ],
  },
  job_relocation: {
    typeLabel: "Relocação por Emprego",
    namePrefix: "Relocação",
    milestoneGroups: [
      { group: "Preparação", items: ["Atualizar CV e perfil LinkedIn", "Mapear empresas com patrocínio de visto"] },
      { group: "Aplicação", items: ["Conduzir candidaturas estratégicas", "Praticar entrevistas técnicas"] },
      { group: "Oferta", items: ["Negociar pacote e suporte migratório"] },
      { group: "Relocação", items: ["Organizar visto e housing", "Planejar chegada"] },
    ],
  },
  postdoc: {
    typeLabel: "Pós-Doutorado",
    namePrefix: "Pós-Doc",
    milestoneGroups: [
      { group: "Pesquisa", items: ["Mapear laboratórios e orientadores-alvo", "Definir proposta de pesquisa"] },
      { group: "Documentação", items: ["Redigir research statement", "Solicitar recomendações acadêmicas"] },
      { group: "Aplicação", items: ["Submeter candidatura e funding"] },
    ],
  },
  academic_visiting: {
    typeLabel: "Pesquisador Visitante",
    namePrefix: "Visitante",
    milestoneGroups: [
      { group: "Preparação", items: ["Contatar instituição de destino", "Definir período e objetivos"] },
      { group: "Documentação", items: ["Carta de convite e MOU", "Atualizar CV acadêmico"] },
      { group: "Execução", items: ["Organizar visto e acomodação"] },
    ],
  },
  professional_certification: {
    typeLabel: "Certificação Profissional",
    namePrefix: "Certificação",
    milestoneGroups: [
      { group: "Estudo", items: ["Definir certificação-alvo", "Criar plano de estudos"] },
      { group: "Preparação", items: ["Completar material e simulados", "Agendar exame"] },
      { group: "Execução", items: ["Realizar exame", "Registrar certificação"] },
    ],
  },
  intracompany_transfer: {
    typeLabel: "Transferência Intracompanhia",
    namePrefix: "Transferência",
    milestoneGroups: [
      { group: "Estratégia", items: ["Alinhar com RH e gestor", "Mapear vaga-alvo no exterior"] },
      { group: "Documentação", items: ["Preparar documentação de transferência", "Iniciar processo de visto L-1/ICT"] },
      { group: "Relocação", items: ["Organizar mudança e housing", "Planejar chegada"] },
    ],
  },
  conference_representation: {
    typeLabel: "Participação em Conferência",
    namePrefix: "Conferência",
    milestoneGroups: [
      { group: "Submissão", items: ["Escrever e submeter paper/abstract", "Preparar apresentação"] },
      { group: "Logística", items: ["Organizar passagem e hospedagem", "Solicitar visto de visitante"] },
      { group: "Execução", items: ["Participar e fazer networking", "Publicar insights pós-evento"] },
    ],
  },
  corporate_secondment: {
    typeLabel: "Secondment Corporativo",
    namePrefix: "Secondment",
    milestoneGroups: [
      { group: "Alinhamento", items: ["Negociar termo de secondment", "Definir escopo e duração"] },
      { group: "Documentação", items: ["Preparar contrato e visto de trabalho", "Planejar transição de responsabilidades"] },
      { group: "Execução", items: ["Instalação no destino", "Integração com time local"] },
    ],
  },
  volunteer_abroad: {
    typeLabel: "Voluntariado Internacional",
    namePrefix: "Voluntariado",
    milestoneGroups: [
      { group: "Pesquisa", items: ["Escolher organização e programa", "Alinhar com missão pessoal"] },
      { group: "Aplicação", items: ["Submeter candidatura de voluntário", "Organizar financiamento e seguro"] },
      { group: "Execução", items: ["Organizar visto e viagem", "Preparar chegada"] },
    ],
  },
  ngo_mission: {
    typeLabel: "Missão ONG / Humanitária",
    namePrefix: "Missão",
    milestoneGroups: [
      { group: "Alinhamento", items: ["Identificar missão e organização", "Alinhar habilidades necessárias"] },
      { group: "Preparação", items: ["Completar treinamentos exigidos", "Organizar documentação e vistos"] },
      { group: "Execução", items: ["Desdobrar missão", "Documentar impacto"] },
    ],
  },
  retirement_abroad: {
    typeLabel: "Aposentadoria no Exterior",
    namePrefix: "Aposentadoria",
    milestoneGroups: [
      { group: "Pesquisa", items: ["Escolher país e cidade-alvo", "Avaliar custo de vida e qualidade"] },
      { group: "Legal", items: ["Pesquisar visto de aposentado/renda passiva", "Consultar planejador financeiro"] },
      { group: "Relocação", items: ["Organizar imóvel e estrutura", "Regularizar documentação fiscal"] },
    ],
  },
  remote_work: {
    typeLabel: "Trabalho Remoto Internacional",
    namePrefix: "Remote",
    milestoneGroups: [
      { group: "Estratégia", items: ["Validar política de remote com empregador", "Pesquisar país-base e regime fiscal"] },
      { group: "Legal", items: ["Pesquisar visto digital nomad ou residência", "Regularizar compliance tributário"] },
      { group: "Execução", items: ["Organizar housing e conectividade", "Planejar chegada"] },
    ],
  },
  digital_nomad: {
    typeLabel: "Nômade Digital",
    namePrefix: "Nômade",
    milestoneGroups: [
      { group: "Estratégia", items: ["Definir rota de países e janelas", "Mapear vistos de nômade disponíveis"] },
      { group: "Infraestrutura", items: ["Organizar setup de trabalho remoto", "Definir base financeira e seguros"] },
      { group: "Execução", items: ["Lançar primeira etapa", "Estruturar rotina de trabalho em trânsito"] },
    ],
  },
  investor_visa: {
    typeLabel: "Visto de Investidor",
    namePrefix: "Investidor",
    milestoneGroups: [
      { group: "Estratégia", items: ["Pesquisar programas de golden visa / EB-5 / equivalente", "Avaliar requisito de capital"] },
      { group: "Legal", items: ["Contratar assessoria jurídica e financeira", "Estruturar investimento qualificado"] },
      { group: "Aplicação", items: ["Submeter processo de visto", "Acompanhar aprovação"] },
    ],
  },
};

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function parseTimelineMonths(timeline: string): number {
  const value = Number.parseInt(timeline.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(value) ? value : 12;
}

export function getCountryLabel(countryCode: string): string {
  return COUNTRY_OPTIONS.find((option) => option.value === countryCode)?.label || countryCode;
}

export function getTimelineLabel(timelineCode: string): string {
  return TIMELINE_OPTIONS.find((option) => option.value === timelineCode)?.label || timelineCode;
}

export function buildRoutePlan(config: RoutePlannerConfig): UserRoute {
  const template = ROUTE_TEMPLATES[config.type];
  const months = parseTimelineMonths(config.timeline);
  const now = new Date();
  const routeId = `r${Date.now()}`;
  const checkpoints = template.milestoneGroups.flatMap((group, groupIndex) => {
    return group.items.map((item, itemIndex) => {
      const offsetMonths = Math.max(1, Math.round(((groupIndex + itemIndex + 1) / (template.milestoneGroups.length + 1)) * months));
      const dueDate = addMonths(now, offsetMonths).toISOString().slice(0, 10);
      const id = `${routeId}-m${groupIndex + 1}-${itemIndex + 1}`;
      const dependsOn = itemIndex > 0
        ? [`${routeId}-m${groupIndex + 1}-${itemIndex}`]
        : groupIndex > 0
          ? [`${routeId}-m${groupIndex}-${ROUTE_TEMPLATES[config.type].milestoneGroups[groupIndex - 1].items.length}`]
          : undefined;
      const status: Milestone["status"] = groupIndex === 0 && itemIndex === 0 ? "in_progress" : "pending";
      return {
        id,
        name: item,
        group: group.group,
        status,
        dueDate,
        dependsOn,
      } satisfies Milestone;
    });
  });

  return {
    id: routeId,
    name: `${template.namePrefix} para ${getCountryLabel(config.country)}`,
    type: template.typeLabel,
    country: getCountryLabel(config.country),
    timeline: getTimelineLabel(config.timeline),
    budget: config.budget.trim(),
    milestones: checkpoints,
    createdAt: now.toISOString().slice(0, 10),
  };
}

export function previewRouteMilestones(type: RouteIntentType): Array<Pick<Milestone, "group" | "name">> {
  return ROUTE_TEMPLATES[type].milestoneGroups.flatMap((group) => group.items.map((item) => ({ group: group.group, name: item })));
}

export function getRouteTypeLabel(type: RouteIntentType): string {
  return ROUTE_TEMPLATES[type].typeLabel;
}
