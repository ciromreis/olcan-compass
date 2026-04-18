/**
 * Fear Reframe Engine - Transforms anxiety-inducing content into empowering narratives
 * 
 * Reframes threatening information (visa risks, deadlines, gaps) into actionable
 * opportunities while avoiding toxic positivity. Acknowledges real challenges
 * while emphasizing agency and growth potential.
 */

export interface ReframedMessage {
  original: string;
  reframed: string;
  actionable: string[];
  acknowledgment?: string;
}

/**
 * Reframe visa rejection risks with mitigation strategies
 */
export function reframeVisaRisk(
  riskLevel: 'low' | 'medium' | 'high',
  specificRisks: string[]
): ReframedMessage {
  const reframes: Record<string, ReframedMessage> = {
    low: {
      original: 'Risco baixo de rejeição de visto',
      reframed: 'Seu perfil está bem posicionado para aprovação',
      actionable: [
        'Revise a documentação para garantir completude',
        'Prepare-se para possíveis perguntas na entrevista',
        'Mantenha cópias digitais de todos os documentos',
      ],
    },
    medium: {
      original: 'Risco médio de rejeição de visto',
      reframed: 'Há pontos de atenção que podem ser fortalecidos',
      actionable: [
        'Identifique os pontos fracos específicos do seu perfil',
        'Busque documentação adicional para mitigar riscos',
        'Considere consultoria especializada para revisão',
        'Prepare narrativas claras sobre lacunas no histórico',
      ],
      acknowledgment:
        'Processos de visto são complexos, mas preparação reduz incerteza.',
    },
    high: {
      original: 'Risco alto de rejeição de visto',
      reframed: 'Seu perfil precisa de fortalecimento estratégico antes da aplicação',
      actionable: [
        'Adie a aplicação até resolver pontos críticos',
        'Busque consultoria especializada imediatamente',
        'Construa histórico que mitigue os riscos identificados',
        'Considere rotas alternativas ou programas diferentes',
        'Documente planos de retorno ao país de origem',
      ],
      acknowledgment:
        'Rejeições são frustrantes e custosas. Investir em preparação agora economiza tempo e recursos.',
    },
  };

  const base = reframes[riskLevel];

  // Add specific risk mitigations
  const specificActions = specificRisks.map((risk) => {
    const mitigations: Record<string, string> = {
      'insufficient-funds': 'Obtenha carta de patrocínio ou comprove renda adicional',
      'weak-ties': 'Documente vínculos familiares, profissionais e patrimoniais',
      'incomplete-docs': 'Complete toda documentação exigida antes de aplicar',
      'criminal-record': 'Obtenha certidões atualizadas e prepare explicações',
      'previous-rejection': 'Demonstre mudanças significativas desde última aplicação',
    };

    return mitigations[risk] || `Mitigue: ${risk}`;
  });

  return {
    ...base,
    actionable: [...base.actionable, ...specificActions],
  };
}

/**
 * Reframe application deadlines as opportunities rather than threats
 */
export function reframeDeadline(
  daysRemaining: number,
  _taskName: string
): ReframedMessage {
  if (daysRemaining > 30) {
    return {
      original: `Prazo em ${daysRemaining} dias`,
      reframed: `Você tem ${daysRemaining} dias para criar uma candidatura forte`,
      actionable: [
        'Divida o trabalho em etapas semanais',
        'Comece pelos documentos que exigem terceiros',
        'Reserve tempo para revisões e ajustes',
      ],
    };
  } else if (daysRemaining > 7) {
    return {
      original: `Prazo em ${daysRemaining} dias`,
      reframed: `${daysRemaining} dias para finalizar — tempo suficiente com foco`,
      actionable: [
        'Priorize tarefas críticas primeiro',
        'Elimine distrações e bloqueie tempo dedicado',
        'Peça feedback de revisores agora',
      ],
      acknowledgment: 'Prazos geram pressão, mas também clareza sobre prioridades.',
    };
  } else if (daysRemaining > 0) {
    return {
      original: `Prazo em ${daysRemaining} dias`,
      reframed: `Últimos ${daysRemaining} dias — foque no essencial`,
      actionable: [
        'Identifique o mínimo viável para submissão',
        'Aceite que perfeição não é possível agora',
        'Submeta no prazo, mesmo que não ideal',
      ],
      acknowledgment:
        'Urgência é real. Faça o melhor possível com o tempo disponível.',
    };
  } else {
    return {
      original: 'Prazo vencido',
      reframed: 'Este prazo passou — aprenda e siga em frente',
      actionable: [
        'Identifique o que impediu a conclusão',
        'Ajuste planejamento para próximos prazos',
        'Verifique se há prazos estendidos ou próximas turmas',
      ],
      acknowledgment:
        'Perder prazos acontece. O que importa é como você responde.',
    };
  }
}

/**
 * Reframe gap analysis results emphasizing growth potential
 */
export function reframeGapAnalysis(gaps: {
  category: string;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
}[]): ReframedMessage {
  const criticalCount = gaps.filter((g) => g.severity === 'critical').length;
  const moderateCount = gaps.filter((g) => g.severity === 'moderate').length;

  let reframed: string;
  let acknowledgment: string | undefined;

  if (criticalCount > 0) {
    reframed = `${criticalCount} lacuna(s) crítica(s) identificada(s) — oportunidades de crescimento prioritárias`;
    acknowledgment =
      'Lacunas críticas são desafiadoras, mas também indicam onde o esforço terá maior impacto.';
  } else if (moderateCount > 0) {
    reframed = `${moderateCount} área(s) para desenvolvimento — seu perfil tem base sólida`;
    acknowledgment = 'Nenhum perfil é completo. O que importa é direção, não perfeição.';
  } else {
    reframed = 'Seu perfil está bem preparado — mantenha o momentum';
  }

  const actionable = gaps.map((gap) => {
    const actions: Record<string, string> = {
      'language-proficiency': 'Invista em curso intensivo de idiomas',
      'academic-credentials': 'Considere cursos complementares ou certificações',
      'work-experience': 'Busque estágios, voluntariado ou projetos freelance',
      'financial-proof': 'Organize documentação financeira ou busque bolsas',
      'test-scores': 'Prepare-se para retomar exames padronizados',
    };

    return (
      actions[gap.category] ||
      `Desenvolva: ${gap.description} (${gap.severity})`
    );
  });

  return {
    original: `${gaps.length} lacunas identificadas`,
    reframed,
    actionable: actionable.length > 0 ? actionable : ['Continue fortalecendo seu perfil'],
    acknowledgment,
  };
}

/**
 * Reframe rejection or negative outcome
 */
export function reframeRejection(
  context: 'application' | 'interview' | 'visa',
  hasDetails: boolean
): ReframedMessage {
  const reframes: Record<string, ReframedMessage> = {
    application: {
      original: 'Candidatura não aprovada',
      reframed: 'Esta porta se fechou — outras permanecem abertas',
      actionable: hasDetails
        ? [
            'Analise o feedback recebido objetivamente',
            'Identifique padrões se houver múltiplas rejeições',
            'Ajuste estratégia para próximas candidaturas',
            'Considere programas ou instituições alternativas',
          ]
        : [
            'Processos seletivos são competitivos e multifatoriais',
            'Não personalize a rejeição — continue aplicando',
            'Revise e fortaleça sua candidatura para próximas',
          ],
      acknowledgment:
        'Rejeições doem, especialmente após investimento emocional. Permita-se sentir, depois siga em frente.',
    },
    interview: {
      original: 'Entrevista não resultou em aprovação',
      reframed: 'A entrevista foi prática — agora você sabe o que esperar',
      actionable: [
        'Revise suas respostas e identifique pontos de melhoria',
        'Pratique com mock interviews antes da próxima',
        'Ajuste narrativas que não funcionaram',
        'Cada entrevista é treino para a próxima',
      ],
      acknowledgment:
        'Entrevistas são performances sob pressão. Melhorar é questão de prática.',
    },
    visa: {
      original: 'Visto negado',
      reframed: 'Negação de visto é um obstáculo, não um fim',
      actionable: hasDetails
        ? [
            'Entenda os motivos específicos da negação',
            'Corrija os problemas identificados antes de reaplicar',
            'Busque consultoria especializada para próxima tentativa',
            'Considere rotas alternativas (outros países, programas)',
          ]
        : [
            'Solicite esclarecimentos sobre os motivos da negação',
            'Não reaplique imediatamente sem mudanças substanciais',
            'Explore alternativas enquanto se prepara para nova tentativa',
          ],
      acknowledgment:
        'Negações de visto são frustrantes e custosas. Não é sobre você como pessoa — é sobre critérios burocráticos.',
    },
  };

  return reframes[context];
}

/**
 * Reframe financial concerns
 */
export function reframeFinancialConcern(
  shortfall: number,
  currency: string = 'USD'
): ReframedMessage {
  const formattedShortfall = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(shortfall);

  return {
    original: `Falta ${formattedShortfall} para atingir o valor necessário`,
    reframed: `Você precisa de ${formattedShortfall} adicionais — há caminhos para isso`,
    actionable: [
      'Pesquise bolsas parciais e auxílios financeiros',
      'Considere trabalho part-time permitido pelo visto',
      'Explore empréstimos estudantis com juros favoráveis',
      'Busque patrocínio de empresas ou organizações',
      'Avalie programas com custo de vida mais baixo',
    ],
    acknowledgment:
      'Questões financeiras são reais e limitantes. Criatividade e pesquisa podem abrir alternativas.',
  };
}

/**
 * Reframe uncertainty or waiting period
 */
export function reframeUncertainty(
  _context: string,
  estimatedWaitDays?: number
): ReframedMessage {
  const waitMessage = estimatedWaitDays
    ? `Aguardando resposta (estimativa: ${estimatedWaitDays} dias)`
    : 'Aguardando resposta';

  return {
    original: waitMessage,
    reframed: 'A espera é parte do processo — use este tempo estrategicamente',
    actionable: [
      'Continue avançando em outras candidaturas',
      'Fortaleça áreas do seu perfil enquanto aguarda',
      'Prepare planos B e C para diferentes cenários',
      'Pratique aceitação do que não está sob seu controle',
    ],
    acknowledgment:
      'Incerteza gera ansiedade. Foque no que você pode controlar enquanto aguarda.',
  };
}
