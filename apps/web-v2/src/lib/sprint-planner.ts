import { type Sprint, type SprintTask } from "@/stores/sprints";

export type SprintTemplateId = "financial" | "documental" | "linguistic" | "psychological" | "relocation";

export interface SprintPlannerConfig {
  templateId: SprintTemplateId;
  name: string;
  durationWeeks: number;
}

export const DURATION_OPTIONS = [
  { value: 2, label: "2 semanas" },
  { value: 4, label: "1 mês" },
  { value: 8, label: "2 meses" },
  { value: 12, label: "3 meses" },
  { value: 24, label: "6 meses" },
] as const;

const DIMENSION_MAP: Record<SprintTemplateId, string> = {
  financial: "Financeira",
  documental: "Documental",
  linguistic: "Linguística",
  psychological: "Psicológica",
  relocation: "Logística",
};

interface TaskTemplate {
  name: string;
  weekOffset: number;
}

const TASK_TEMPLATES: Record<SprintTemplateId, TaskTemplate[]> = {
  financial: [
    { name: "Abrir conta Wise ou Revolut", weekOffset: 1 },
    { name: "Configurar transferência automática mensal", weekOffset: 2 },
    { name: "Cancelar assinaturas desnecessárias", weekOffset: 2 },
    { name: "Pesquisar conta bloqueada (Sperrkonto / blocked account)", weekOffset: 4 },
    { name: "Cotação de seguro saúde internacional", weekOffset: 4 },
    { name: "Abrir conta bloqueada e depositar valor mínimo", weekOffset: 8 },
    { name: "Contratar seguro saúde internacional", weekOffset: 10 },
    { name: "Atingir reserva de 6 meses de custo de vida", weekOffset: 12 },
  ],
  documental: [
    { name: "Diploma traduzido e apostilado", weekOffset: 2 },
    { name: "Histórico escolar traduzido", weekOffset: 2 },
    { name: "Certidão de nascimento apostilada", weekOffset: 2 },
    { name: "Carta de motivação — rascunho inicial", weekOffset: 3 },
    { name: "Solicitar carta de recomendação #1", weekOffset: 3 },
    { name: "Solicitar carta de recomendação #2", weekOffset: 4 },
    { name: "Revisão final da carta de motivação", weekOffset: 5 },
    { name: "Compilar dossiê completo de candidatura", weekOffset: 6 },
  ],
  linguistic: [
    { name: "Definir exame-alvo (IELTS / TOEFL / TestDaF / DELF)", weekOffset: 1 },
    { name: "Inscrever-se no exame", weekOffset: 1 },
    { name: "Diagnóstico: simulado inicial", weekOffset: 2 },
    { name: "Plano de estudos semanal — semana 1", weekOffset: 3 },
    { name: "Simulados semanais (continuar até o exame)", weekOffset: 6 },
    { name: "Revisão de pontos fracos identificados", weekOffset: 8 },
    { name: "Simulado final (condições reais)", weekOffset: 10 },
    { name: "Realizar o exame", weekOffset: 12 },
  ],
  psychological: [
    { name: "Completar diagnóstico psicológico Compass", weekOffset: 1 },
    { name: "Estabelecer rotina de reflexão semanal", weekOffset: 2 },
    { name: "Identificar principais fontes de ansiedade", weekOffset: 2 },
    { name: "Construir rede de apoio (família, amigos, coach)", weekOffset: 3 },
    { name: "Praticar técnica de ancoragem em momentos de crise", weekOffset: 4 },
    { name: "Avaliar progresso emocional no mês", weekOffset: 6 },
    { name: "Revisitar plano de mobilidade com clareza emocional", weekOffset: 8 },
  ],
  relocation: [
    { name: "Pesquisar bairros e custos médios de moradia", weekOffset: 1 },
    { name: "Fechar contrato de moradia ou hostel de chegada", weekOffset: 2 },
    { name: "Contratar eSIM internacional", weekOffset: 2 },
    { name: "Planejar embarque (passagens, bagagem, vacinas)", weekOffset: 3 },
    { name: "Abrir conta bancária local", weekOffset: 4 },
    { name: "Registrar-se na prefeitura / serviço municipal local", weekOffset: 4 },
    { name: "Configurar transporte público recorrente", weekOffset: 5 },
  ],
};

function addWeeks(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

function buildTasks(templateId: SprintTemplateId, durationWeeks: number): SprintTask[] {
  const templates = TASK_TEMPLATES[templateId];
  return templates
    .filter((t) => t.weekOffset <= durationWeeks)
    .map((t, i) => ({
      id: `task-${Date.now()}-${i}`,
      name: t.name,
      done: false,
      dueDate: addWeeks(Math.min(t.weekOffset, durationWeeks)),
    }));
}

export function buildSprintPlan(config: SprintPlannerConfig): Sprint {
  const now = new Date().toISOString().split("T")[0];
  return {
    id: `sp-${Date.now()}`,
    name: config.name,
    dimension: DIMENSION_MAP[config.templateId],
    status: "active",
    createdAt: now,
    targetDate: addWeeks(config.durationWeeks),
    tasks: buildTasks(config.templateId, config.durationWeeks),
  };
}
