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
      title: "Maior bloqueio",
      description: metrics.pendingTasks > 0
        ? "Sua cadência ainda depende de concluir tarefas pendentes com prazo próximo."
        : metrics.urgentApplications > 0
          ? "Existem prazos sensíveis nas candidaturas que pedem revisão imediata."
          : "Seu principal risco agora é manter consistência e não perder tração.",
      meta: metrics.pendingTasks > 0
        ? `${metrics.pendingTasks} tarefa${metrics.pendingTasks !== 1 ? "s" : ""} pendente${metrics.pendingTasks !== 1 ? "s" : ""}.`
        : metrics.urgentApplications > 0
          ? `${metrics.urgentApplications} deadline${metrics.urgentApplications !== 1 ? "s" : ""} urgente${metrics.urgentApplications !== 1 ? "s" : ""}.`
          : "Sem alertas críticos neste momento.",
      href: metrics.pendingTasks > 0 ? "/sprints" : "/applications",
      cta: metrics.pendingTasks > 0 ? "Resolver pendências" : "Revisar prazos",
      tone: "clay",
    },
    {
      title: "Apoio recomendado",
      description: metrics.docProgress < 60
        ? "Revisão documental tende a gerar mais retorno do que acelerar novas ações agora."
        : metrics.interviewProgress < 40
          ? "Treino guiado pode elevar sua segurança antes dos próximos marcos decisivos."
          : "Se quiser acelerar, apoio especializado pode encurtar o tempo entre preparo e submissão.",
      meta: metrics.docProgress < 60
        ? "Sugestão: revisão de CV, essays ou tradução especializada."
        : metrics.interviewProgress < 40
          ? "Sugestão: coaching de entrevistas e simulações orientadas."
          : `Sugestão alinhada à etapa atual: ${lifecycle.label.toLowerCase()}.`,
      href: metrics.docProgress < 60 || metrics.interviewProgress < 40 ? "/marketplace" : "/marketplace/bookings",
      cta: "Ver apoio",
      tone: "sage",
    },
  ];
}
