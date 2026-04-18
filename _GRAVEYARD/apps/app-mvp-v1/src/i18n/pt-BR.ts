/**
 * Portuguese (Brazil) translations
 * Centralized strings for future i18n support
 */

export const ptBR = {
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    share: 'Compartilhar',
    logout: 'Sair',
  },

  auth: {
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    resetPassword: 'Redefinir senha',
    verifyEmail: 'Verificar e-mail',
  },

  navigation: {
    dashboard: 'Painel',
    psychology: 'Psicologia',
    routes: 'Rotas',
    narratives: 'Narrativas',
    interviews: 'Entrevistas',
    applications: 'Candidaturas',
    sprints: 'Sprints',
    marketplace: 'Marketplace',
    admin: 'Administração',
  },

  psychology: {
    profile: 'Perfil Psicológico',
    assessment: 'Avaliação',
    dimensions: 'Dimensões',
    openness: 'Abertura',
    conscientiousness: 'Conscienciosidade',
    extraversion: 'Extroversão',
    agreeableness: 'Amabilidade',
    neuroticism: 'Neuroticismo',
  },

  routes: {
    templates: 'Modelos de Rota',
    myRoutes: 'Minhas Rotas',
    milestones: 'Marcos',
    progress: 'Progresso',
  },

  narratives: {
    dashboard: 'Narrativas',
    editor: 'Editor',
    versions: 'Versões',
    analysis: 'Análise',
    wordCount: 'Contagem de palavras',
  },

  interviews: {
    questionBank: 'Banco de Questões',
    sessions: 'Sessões',
    practice: 'Praticar',
    feedback: 'Feedback',
  },

  applications: {
    opportunities: 'Oportunidades',
    myApplications: 'Minhas Candidaturas',
    deadlines: 'Prazos',
    documents: 'Documentos',
    status: 'Status',
  },

  sprints: {
    templates: 'Modelos de Sprint',
    mySprints: 'Meus Sprints',
    tasks: 'Tarefas',
    gapAnalysis: 'Análise de Lacunas',
  },

  marketplace: {
    browse: 'Explorar',
    providers: 'Prestadores',
    services: 'Serviços',
    bookings: 'Reservas',
    messages: 'Mensagens',
    reviews: 'Avaliações',
  },

  // Economics-driven intelligence features
  credentials: {
    title: 'Perfil Verificado',
    badge: 'Perfil Verificado',
    types: {
      readiness: 'Prontidão',
      milestone: 'Marco',
      assessment: 'Avaliação',
    },
    details: {
      score: 'Score',
      issuedAt: 'Emitida em',
      validUntil: 'Válida até',
      verifications: 'Verificações',
    },
    actions: {
      copyLink: 'Copiar Link de Verificação',
      linkCopied: 'Link Copiado!',
      share: 'Compartilhe este link com empregadores para comprovar sua preparação',
    },
    messages: {
      credentialGenerated: 'Credencial gerada com sucesso',
      credentialRevoked: 'Credencial revogada',
      verificationSuccess: 'Credencial verificada com sucesso',
      verificationFailed: 'Credencial inválida ou expirada',
    },
  },

  temporalMatching: {
    title: 'Rotas Recomendadas para Você',
    subtitle: 'Baseado no seu perfil',
    preferences: {
      accelerated: 'Ritmo Acelerado',
      balanced: 'Ritmo Equilibrado',
      gradual: 'Ritmo Gradual',
    },
    urgencyLabel: 'Urgência',
    matchScore: 'compatível',
    reasons: {
      fastPaced: 'Esta rota combina com seu ritmo acelerado',
      balanced: 'Esta rota oferece um equilíbrio ideal para você',
      gradual: 'Esta rota respeita seu ritmo gradual de aprendizado',
    },
    emptyState: 'Complete sua avaliação psicológica para receber recomendações personalizadas',
    footer: 'Estas rotas foram selecionadas para alinhar com seu ritmo natural de trabalho. Você pode explorar outras rotas a qualquer momento.',
    viewDetails: 'Ver detalhes',
  },

  opportunityCost: {
    title: 'Potencial de Crescimento',
    subtitle: 'Acelere sua jornada com ferramentas premium',
    momentum: {
      label: 'Momentum Atual',
      milestones: 'marcos em 30 dias',
    },
    potential: {
      approaching: 'Cada dia de preparação te aproxima de',
      perMonth: '/mês',
      accumulated: 'Potencial acumulado',
      next30Days: 'em oportunidades nos próximos 30 dias',
    },
    motivation: 'Ferramentas premium ajudam você a manter o ritmo e alcançar seus objetivos mais rapidamente. Desbloqueie recursos avançados de planejamento e acompanhamento.',
    cta: {
      upgradePremium: 'Upgrade para Premium',
      viewPro: 'Ver Plano Pro',
    },
    footer: 'Investir em sua preparação é investir em seu futuro',
  },

  escrow: {
    badge: 'Garantia de Resultado',
    title: 'Proteção de Pagamento com Escrow',
    description: '30% do pagamento fica retido até que a melhoria de prontidão seja confirmada. Se o resultado não for alcançado, você recebe reembolso automático.',
    successRate: 'Taxa de Sucesso do Provedor',
    benefits: {
      improvement: 'Melhoria mínima de 10 pontos no score de prontidão',
      protection: 'Pagamento liberado apenas após confirmação de resultados',
    },
    footer: 'Esta garantia protege seu investimento e incentiva provedores a entregar resultados reais',
    status: {
      pending: 'Pendente',
      held: 'Retido',
      released: 'Liberado',
      refunded: 'Reembolsado',
    },
  },

  scenarios: {
    title: 'Simulador de Cenários',
    subtitle: 'Explore oportunidades otimizadas baseadas em suas restrições e objetivos',
    backToOpportunities: 'Voltar para Oportunidades',
    constraints: {
      title: 'Suas Restrições',
      budget: 'Orçamento Máximo',
      time: 'Tempo Disponível',
      skills: 'Nível de Habilidade',
      locations: 'Localizações Alvo',
      industries: 'Indústrias Preferidas',
      reset: 'Redefinir Restrições',
      skillLevels: {
        beginner: 'Iniciante',
        advanced: 'Avançado',
      },
    },
    frontier: {
      title: 'Fronteira Viável',
      calculating: 'Calculando oportunidades ótimas...',
      results: 'oportunidades Pareto-ótimas de',
      analyzed: 'analisadas',
      optimal: 'Ótimas',
    },
    chart: {
      xAxis: 'Recursos Necessários (%)',
      yAxis: 'Competitividade (%)',
      paretoOptimal: 'Pareto-Ótimas',
      otherOpportunities: 'Outras Oportunidades',
      competitiveness: 'Competitividade',
      resources: 'Recursos Necessários',
    },
    recommendations: {
      title: 'Oportunidades Recomendadas',
      optimal: 'Ótima',
    },
    explanation: {
      title: 'Estas oportunidades oferecem o melhor equilíbrio entre competitividade e recursos necessários',
      description: 'Oportunidades Pareto-ótimas (em azul) são aquelas onde nenhuma outra opção oferece simultaneamente maior competitividade e menores requisitos de recursos. Focar nestas oportunidades maximiza suas chances de sucesso.',
    },
    emptyState: 'Ajuste suas restrições para ver oportunidades viáveis',
  },

  errors: {
    generic: 'Algo deu errado. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    unauthorized: 'Você não tem permissão para acessar este recurso.',
    notFound: 'Recurso não encontrado.',
    serverError: 'Erro no servidor. Nossa equipe foi notificada.',
  },

  validation: {
    required: 'Este campo é obrigatório',
    email: 'E-mail inválido',
    minLength: 'Mínimo de {min} caracteres',
    maxLength: 'Máximo de {max} caracteres',
    passwordStrength: 'A senha deve ter pelo menos 8 caracteres',
  },
} as const

export type TranslationKey = keyof typeof ptBR
