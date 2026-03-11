import { type Milestone, type UserRoute } from "@/stores/routes";

export type RouteIntentType = "scholarship" | "employment" | "research" | "startup" | "exchange";

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
      { group: "Preparação", items: ["Definir shortlist de programas", "Mapear requisitos de bolsa"] },
      { group: "Documentação", items: ["Rascunhar carta de motivação", "Solicitar cartas de recomendação", "Planejar prova de proficiência"] },
      { group: "Aplicação", items: ["Finalizar candidatura principal", "Submeter bolsa e universidade"] },
      { group: "Pós-aceite", items: ["Planejar visto e finanças", "Organizar moradia e chegada"] },
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
