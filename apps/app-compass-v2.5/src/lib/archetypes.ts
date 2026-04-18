/**
 * Sistema de Arquétipos Olcan - Definições dos 12 Arquétipos v2.5
 * Baseado na especificação Metamoderna
 */

export type ArchetypeId = 
  | 'institutional_escapee'
  | 'scholarship_cartographer'
  | 'career_pivot'
  | 'global_nomad'
  | 'technical_bridge_builder'
  | 'insecure_corporate_dev'
  | 'exhausted_solo_mother'
  | 'trapped_public_servant'
  | 'academic_hermit'
  | 'executive_refugee'
  | 'creative_visionary'
  | 'lifestyle_optimizer'

export type AuraCreature = 
  | 'fox'        // Estrategista
  | 'dragon'     // Inovador
  | 'lion'       // Criador
  | 'phoenix'    // Diplomata
  | 'wolf'       // Pioneiro
  | 'owl'        // Estudioso
  | 'bear'       // Guardião
  | 'eagle'      // Visionário
  | 'deer'       // Acadêmico
  | 'tiger'      // Executivo
  | 'butterfly'  // Criativo
  | 'dolphin'    // Otimizador

export type Motivator = 
  | 'freedom'
  | 'success'
  | 'growth'
  | 'adventure'
  | 'stability'
  | 'safety'
  | 'security'
  | 'purpose'
  | 'knowledge'
  | 'peace'
  | 'expression'
  | 'efficiency'

export type FearCluster = 
  | 'competence'      // Síndrome do impostor
  | 'rejection'       // Rejeição cultural
  | 'loss'           // Perda de status/posses
  | 'irreversibility' // Medo de não ter volta

export interface ArchetypeDefinition {
  id: ArchetypeId
  name: string
  creature: AuraCreature
  motivator: Motivator
  fearCluster: FearCluster
  description: string
  context: string
  evolutionPath: {
    from: string
    to: string
  }
  colors: {
    primary: string
    secondary: string
    gradient: string
  }
  abilities: string[]
}

export interface ArchetypeCMSOverride {
  key: ArchetypeId
  name?: string
  description?: string
  context?: string
  creature?: AuraCreature
  abilities?: string[]
  gradient?: string
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  institutional_escapee: {
    id: 'institutional_escapee',
    name: 'O Fugitivo Institucional',
    creature: 'fox',
    motivator: 'freedom',
    fearCluster: 'loss',
    description: 'Mestre da independência estratégica e liberdade táctica',
    context: 'Alguém que sente que o sistema brasileiro limita sua liberdade individual ou financeira',
    evolutionPath: {
      from: 'Escritor Oculto',
      to: 'Operador Global Soberano'
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#6366F1',
      gradient: 'from-purple-600 to-indigo-600'
    },
    abilities: ['Planejamento Estratégico', 'Avaliação de Risco', 'Independência']
  },
  
  scholarship_cartographer: {
    id: 'scholarship_cartographer',
    name: 'O Cartógrafo de Bolsas',
    creature: 'dragon',
    motivator: 'success',
    fearCluster: 'competence',
    description: 'Pioneiro da excelência acadêmica e oportunidades de prestígio',
    context: 'Acadêmicos focados em bolsas de prestígio (Fulbright, Erasmus)',
    evolutionPath: {
      from: 'Candidato Invisível',
      to: 'Acadêmico Patrocinado'
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      gradient: 'from-blue-600 to-blue-800'
    },
    abilities: ['Excelência em Pesquisa', 'Domínio de Candidaturas', 'Escrita Acadêmica']
  },

  career_pivot: {
    id: 'career_pivot',
    name: 'O Pivô de Carreira',
    creature: 'lion',
    motivator: 'growth',
    fearCluster: 'competence',
    description: 'Artista da transformação e domínio de novas competências',
    context: 'Profissionais em meio de carreira que desejam mudar completamente de área no exterior',
    evolutionPath: {
      from: 'Especialista Local',
      to: 'Iniciante Global Estratégico'
    },
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      gradient: 'from-emerald-600 to-green-700'
    },
    abilities: ['Adaptabilidade', 'Transferência de Habilidades', 'Mentalidade de Crescimento']
  },

  global_nomad: {
    id: 'global_nomad',
    name: 'O Nômade Global',
    creature: 'phoenix',
    motivator: 'adventure',
    fearCluster: 'irreversibility',
    description: 'Especialista em adaptação cultural e vida sem fronteiras',
    context: 'Puristas digitais que buscam o mundo como escritório através de vistos de nômade',
    evolutionPath: {
      from: 'Turista com Laptop',
      to: 'Habitante do Fluxo'
    },
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      gradient: 'from-cyan-600 to-teal-600'
    },
    abilities: ['Fluência Cultural', 'Domínio Remoto', 'Independência Geográfica']
  },

  technical_bridge_builder: {
    id: 'technical_bridge_builder',
    name: 'O Construtor de Pontes Técnicas',
    creature: 'wolf',
    motivator: 'stability',
    fearCluster: 'rejection',
    description: 'Construtor de fundamentos técnicos e transições seguras',
    context: 'Desenvolvedores e engenheiros buscando transferência tecnológica ou realocação corporativa direta',
    evolutionPath: {
      from: 'Recurso Terceirizado',
      to: 'Arquiteto de Fronteira'
    },
    colors: {
      primary: '#64748B',
      secondary: '#475569',
      gradient: 'from-slate-600 to-slate-800'
    },
    abilities: ['Excelência Técnica', 'Design de Sistemas', 'Liderança de Equipe']
  },

  insecure_corporate_dev: {
    id: 'insecure_corporate_dev',
    name: 'O Dev Corporativo Inseguro',
    creature: 'owl',
    motivator: 'safety',
    fearCluster: 'competence',
    description: 'Buscador de validação e confiança técnica',
    context: 'Profissionais talentosos com medo de falhar em entrevistas técnicas ou barreiras linguísticas',
    evolutionPath: {
      from: 'Sombra da Equipe',
      to: 'Especialista Validado'
    },
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      gradient: 'from-indigo-600 to-indigo-800'
    },
    abilities: ['Domínio de Entrevistas', 'Construção de Confiança', 'Comunicação Técnica']
  },

  exhausted_solo_mother: {
    id: 'exhausted_solo_mother',
    name: 'A Mãe Solo Exausta',
    creature: 'bear',
    motivator: 'security',
    fearCluster: 'loss',
    description: 'Guardiã do futuro familiar e força protetora',
    context: 'Buscando um país mais seguro e estável para criar os filhos',
    evolutionPath: {
      from: 'Heroína Exausta',
      to: 'Guardiã do Futuro Global'
    },
    colors: {
      primary: '#475569',
      secondary: '#334155',
      gradient: 'from-slate-700 to-slate-800'
    },
    abilities: ['Planejamento Familiar', 'Gestão de Recursos', 'Resiliência']
  },

  trapped_public_servant: {
    id: 'trapped_public_servant',
    name: 'O Servidor Público Encurralado',
    creature: 'eagle',
    motivator: 'purpose',
    fearCluster: 'irreversibility',
    description: 'Visionário em busca de impacto significativo e propósito',
    context: 'Estável financeiramente no Brasil, mas frustrado com a falta de impacto real ou propósito',
    evolutionPath: {
      from: 'Burocrata Encurralado',
      to: 'Agente de Mudança Internacional'
    },
    colors: {
      primary: '#DC2626',
      secondary: '#B91C1C',
      gradient: 'from-red-600 to-red-800'
    },
    abilities: ['Especialidade em Políticas', 'Criação de Impacto', 'Alinhamento de Propósito']
  },

  academic_hermit: {
    id: 'academic_hermit',
    name: 'O Eremita Acadêmico',
    creature: 'deer',
    motivator: 'knowledge',
    fearCluster: 'rejection',
    description: 'Buscador de sabedoria e excelência intelectual',
    context: 'Pesquisadores em busca de laboratórios de ponta e ambientes de alto intelecto',
    evolutionPath: {
      from: 'Teórico Isolado',
      to: 'Nó de Conhecimento Global'
    },
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      gradient: 'from-violet-600 to-purple-800'
    },
    abilities: ['Pesquisa Profunda', 'Redes Acadêmicas', 'Síntese de Conhecimento']
  },

  executive_refugee: {
    id: 'executive_refugee',
    name: 'O Refugiado Executivo',
    creature: 'tiger',
    motivator: 'peace',
    fearCluster: 'loss',
    description: 'Mestre do equilíbrio e liderança consciente',
    context: 'C-levels e diretores que desejam desacelerar em um país de primeiro mundo com melhor qualidade de vida',
    evolutionPath: {
      from: 'Máquina Dourada',
      to: 'Gestor Consciente'
    },
    colors: {
      primary: '#94A3B8',
      secondary: '#64748B',
      gradient: 'from-slate-600 to-slate-700'
    },
    abilities: ['Liderança Estratégica', 'Equilíbrio Vida-Trabalho', 'Gestão de Patrimônio']
  },

  creative_visionary: {
    id: 'creative_visionary',
    name: 'O Visionário Criativo',
    creature: 'butterfly',
    motivator: 'expression',
    fearCluster: 'rejection',
    description: 'Artista da autoexpressão e inovação cultural',
    context: 'Artistas, designers e criativos em busca de centros culturais vibrantes no exterior',
    evolutionPath: {
      from: 'Persona Marginal',
      to: 'Protagonista Cultural'
    },
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      gradient: 'from-pink-600 to-rose-700'
    },
    abilities: ['Expressão Criativa', 'Adaptação Cultural', 'Inovação Artística']
  },

  lifestyle_optimizer: {
    id: 'lifestyle_optimizer',
    name: 'O Otimizador de Estilo de Vida',
    creature: 'dolphin',
    motivator: 'efficiency',
    fearCluster: 'irreversibility',
    description: 'Especialista em otimização de qualidade e vida estratégica',
    context: 'Buscando a melhor relação custo-benefício, clima e infraestrutura',
    evolutionPath: {
      from: 'Contribuinte',
      to: 'Árbitro de Destino'
    },
    colors: {
      primary: '#14B8A6',
      secondary: '#0D9488',
      gradient: 'from-teal-600 to-cyan-700'
    },
    abilities: ['Análise de Dados', 'Otimização', 'Planejamento Estratégico']
  }
}

export const getArchetype = (id: ArchetypeId): ArchetypeDefinition => {
  return ARCHETYPES[id]
}

export const getAllArchetypes = (): ArchetypeDefinition[] => {
  return Object.values(ARCHETYPES)
}

export const getArchetypeByCreature = (creature: AuraCreature): ArchetypeDefinition | undefined => {
  return Object.values(ARCHETYPES).find(a => a.creature === creature)
}

export const getArchetypesByMotivator = (motivator: Motivator): ArchetypeDefinition[] => {
  return Object.values(ARCHETYPES).filter(a => a.motivator === motivator)
}

export const getArchetypesByFearCluster = (fear: FearCluster): ArchetypeDefinition[] => {
  return Object.values(ARCHETYPES).filter(a => a.fearCluster === fear)
}

export const mergeArchetypeOverrides = (
  overrides: ArchetypeCMSOverride[] = [],
): ArchetypeDefinition[] => {
  const byKey = new Map(overrides.map((item) => [item.key, item]))

  return getAllArchetypes().map((archetype) => {
    const override = byKey.get(archetype.id)
    if (!override) {
      return archetype
    }

    return {
      ...archetype,
      name: override.name || archetype.name,
      description: override.description || archetype.description,
      context: override.context || archetype.context,
      creature: override.creature || archetype.creature,
      abilities: override.abilities?.length ? override.abilities : archetype.abilities,
      colors: {
        ...archetype.colors,
        gradient: override.gradient || archetype.colors.gradient,
      },
    }
  })
}
