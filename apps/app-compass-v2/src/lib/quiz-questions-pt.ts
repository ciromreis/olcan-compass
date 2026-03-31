/**
 * Questionário de Descoberta de Arquétipo - 10 Perguntas
 * Determina o arquétipo dominante do usuário para atribuição de companion
 */

import { ArchetypeId } from './archetypes'

export interface QuizOption {
  text: string
  archetype: ArchetypeId
  weight: number
}

export interface QuizQuestion {
  id: string
  question: string
  category: 'motivation' | 'work_style' | 'challenge' | 'fear' | 'goal'
  options: QuizOption[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'primary_motivation',
    question: 'O que impulsiona principalmente sua decisão de buscar oportunidades internacionais?',
    category: 'motivation',
    options: [
      { text: 'Liberdade de restrições institucionais e burocracia', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Alcançar reconhecimento acadêmico prestigioso', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Crescimento pessoal e domínio de novas habilidades', archetype: 'career_pivot', weight: 3 },
      { text: 'Aventura e vivência de diferentes culturas', archetype: 'global_nomad', weight: 3 },
      { text: 'Progressão de carreira estável em tecnologia', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Melhor qualidade de vida para minha família', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'work_environment',
    question: 'Que tipo de ambiente de trabalho mais te atrai?',
    category: 'work_style',
    options: [
      { text: 'Consultoria independente ou empreendedorismo', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Instituições de pesquisa de primeira linha', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Startups dinâmicas com oportunidades de aprendizado', archetype: 'career_pivot', weight: 2 },
      { text: 'Empresas remote-first com equipes globais', archetype: 'global_nomad', weight: 2 },
      { text: 'Empresas de tecnologia estabelecidas com estrutura clara', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Organizações estáveis com equilíbrio trabalho-vida', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'biggest_fear',
    question: 'O que mais te preocupa sobre mudar para o exterior?',
    category: 'fear',
    options: [
      { text: 'Perder minha independência ou autonomia', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Não ser competitivo o suficiente academicamente', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Começar do zero em uma nova área', archetype: 'career_pivot', weight: 2 },
      { text: 'Não conseguir voltar se as coisas não derem certo', archetype: 'global_nomad', weight: 2 },
      { text: 'Falhar em entrevistas técnicas ou barreiras linguísticas', archetype: 'insecure_corporate_dev', weight: 2 },
      { text: 'Não proporcionar segurança para minha família', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'success_definition',
    question: 'Como você define sucesso em sua jornada internacional?',
    category: 'goal',
    options: [
      { text: 'Liberdade financeira e pessoal completa', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Garantir uma bolsa ou posição prestigiosa', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Transição bem-sucedida para um novo caminho de carreira', archetype: 'career_pivot', weight: 3 },
      { text: 'Viver e trabalhar de qualquer lugar do mundo', archetype: 'global_nomad', weight: 3 },
      { text: 'Conseguir uma posição tech estável em uma boa empresa', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Criar uma vida segura e estável para minha família', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'challenge_preference',
    question: 'Que tipo de desafios mais te empolgam?',
    category: 'challenge',
    options: [
      { text: 'Romper com sistemas e criar meu próprio caminho', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Competir por oportunidades altamente seletivas', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Aprender habilidades e domínios completamente novos', archetype: 'career_pivot', weight: 2 },
      { text: 'Adaptar-se a novas culturas e ambientes', archetype: 'global_nomad', weight: 2 },
      { text: 'Resolver problemas técnicos complexos', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Superar obstáculos para proteger entes queridos', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'current_situation',
    question: 'Qual descreve melhor sua situação profissional atual?',
    category: 'work_style',
    options: [
      { text: 'Me sentindo preso em uma estrutura corporativa ou governamental rígida', archetype: 'trapped_public_servant', weight: 3 },
      { text: 'Cursando ou planejando cursar pós-graduação', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Meio de carreira buscando mudar de indústria', archetype: 'career_pivot', weight: 3 },
      { text: 'Já trabalhando remotamente ou como nômade digital', archetype: 'global_nomad', weight: 3 },
      { text: 'Trabalhando em tech mas me sentindo inseguro sobre habilidades', archetype: 'insecure_corporate_dev', weight: 3 },
      { text: 'Equilibrando carreira com responsabilidades familiares', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'decision_making',
    question: 'Como você tipicamente toma decisões importantes de carreira?',
    category: 'work_style',
    options: [
      { text: 'Baseado em maximizar liberdade pessoal', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Baseado em prestígio e potencial de reconhecimento', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Baseado em oportunidades de aprendizado e crescimento', archetype: 'career_pivot', weight: 2 },
      { text: 'Baseado em estilo de vida e flexibilidade de localização', archetype: 'global_nomad', weight: 2 },
      { text: 'Baseado em estabilidade e progressão de carreira', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Baseado em segurança e bem-estar familiar', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'ideal_outcome',
    question: 'Qual seria seu resultado ideal daqui a 5 anos?',
    category: 'goal',
    options: [
      { text: 'Administrando meu próprio negócio ou consultoria independente', archetype: 'institutional_escapee', weight: 3 },
      { text: 'Ocupando uma posição acadêmica ou de pesquisa prestigiosa', archetype: 'scholarship_cartographer', weight: 3 },
      { text: 'Prosperando em uma área de carreira completamente nova', archetype: 'career_pivot', weight: 3 },
      { text: 'Vivendo como um verdadeiro cidadão global', archetype: 'global_nomad', weight: 3 },
      { text: 'Posição técnica sênior em uma empresa de ponta', archetype: 'technical_bridge_builder', weight: 3 },
      { text: 'Vida estável em um país seguro com minha família', archetype: 'exhausted_solo_mother', weight: 3 }
    ]
  },
  {
    id: 'motivation_source',
    question: 'O que te motiva a continuar seguindo em frente?',
    category: 'motivation',
    options: [
      { text: 'O desejo por autonomia e autodeterminação', archetype: 'institutional_escapee', weight: 2 },
      { text: 'A busca pela excelência e reconhecimento', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'A empolgação da transformação e crescimento', archetype: 'career_pivot', weight: 2 },
      { text: 'A emoção de novas experiências e culturas', archetype: 'global_nomad', weight: 2 },
      { text: 'Construir expertise técnica e estabilidade de carreira', archetype: 'technical_bridge_builder', weight: 2 },
      { text: 'Criar um futuro melhor para meus entes queridos', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  },
  {
    id: 'support_need',
    question: 'Que tipo de suporte te ajudaria mais agora?',
    category: 'challenge',
    options: [
      { text: 'Estratégias para romper com restrições', archetype: 'institutional_escapee', weight: 2 },
      { text: 'Ajuda para criar aplicações competitivas', archetype: 'scholarship_cartographer', weight: 2 },
      { text: 'Orientação sobre estratégias de transição de carreira', archetype: 'career_pivot', weight: 2 },
      { text: 'Logística de visto e trabalho remoto', archetype: 'global_nomad', weight: 2 },
      { text: 'Preparação para entrevistas e construção de confiança', archetype: 'insecure_corporate_dev', weight: 2 },
      { text: 'Planejamento de realocação amigável para família', archetype: 'exhausted_solo_mother', weight: 2 }
    ]
  }
]

export interface QuizResult {
  dominantArchetype: ArchetypeId
  scores: Record<ArchetypeId, number>
  answers: Record<string, string>
}

export function calculateArchetype(answers: Record<string, QuizOption>): QuizResult {
  const scores: Record<string, number> = {}
  
  // Initialize all archetype scores
  const allArchetypes: ArchetypeId[] = [
    'institutional_escapee',
    'scholarship_cartographer',
    'career_pivot',
    'global_nomad',
    'technical_bridge_builder',
    'insecure_corporate_dev',
    'exhausted_solo_mother',
    'trapped_public_servant',
    'academic_hermit',
    'executive_refugee',
    'creative_visionary',
    'lifestyle_optimizer'
  ]
  
  allArchetypes.forEach(archetype => {
    scores[archetype] = 0
  })
  
  // Calculate scores based on weighted answers
  Object.values(answers).forEach(option => {
    scores[option.archetype] = (scores[option.archetype] || 0) + option.weight
  })
  
  // Find dominant archetype
  const dominantArchetype = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0] as ArchetypeId
  
  return {
    dominantArchetype,
    scores: scores as Record<ArchetypeId, number>,
    answers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, value.text])
    )
  }
}
