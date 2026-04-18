/**
 * Demo quiz questions for OIOS archetype assessment
 * Used when DEMO_MODE is enabled to provide a working quiz experience
 */

export interface DemoQuestionOption {
  value: string;
  label: string;
  score: number;
}

export interface DemoQuestion {
  id: string;
  text_pt: string;
  question_type: string;
  category: string;
  options: DemoQuestionOption[];
  display_order: number;
}

export const DEMO_QUIZ_QUESTIONS: DemoQuestion[] = [
  {
    id: "demo-q1",
    text_pt: "Como você se sente ao pensar em mudar de país para estudar ou trabalhar?",
    question_type: "likert",
    category: "mobility_readiness",
    display_order: 1,
    options: [
      { value: "very_excited", label: "Muito animado(a), é um sonho!", score: 5 },
      { value: "excited", label: "Animado(a), mas com algumas preocupações", score: 4 },
      { value: "neutral", label: "Neutro, ainda estou avaliando", score: 3 },
      { value: "anxious", label: "Ansioso(a), tenho muitas dúvidas", score: 2 },
      { value: "very_anxious", label: "Muito ansioso(a), não sei se consigo", score: 1 },
    ],
  },
  {
    id: "demo-q2",
    text_pt: "Quando você pensa em escrever uma carta de motivação ou currículo internacional:",
    question_type: "likert",
    category: "preparation_confidence",
    display_order: 2,
    options: [
      { value: "confident", label: "Me sinto confiante, sei o que fazer", score: 5 },
      { value: "somewhat_confident", label: "Tenho alguma ideia, mas preciso de ajuda", score: 4 },
      { value: "unsure", label: "Não tenho certeza por onde começar", score: 3 },
      { value: "overwhelmed", label: "Me sinto sobrecarregado(a) com a tarefa", score: 2 },
      { value: "lost", label: "Estou completamente perdido(a)", score: 1 },
    ],
  },
  {
    id: "demo-q3",
    text_pt: "Qual é o seu maior receio em relação a candidaturas internacionais?",
    question_type: "multiple_choice",
    category: "fear_cluster",
    display_order: 3,
    options: [
      { value: "rejection", label: "Medo de ser rejeitado(a)", score: 1 },
      { value: "financial", label: "Preocupações financeiras", score: 2 },
      { value: "language", label: "Barreira do idioma", score: 3 },
      { value: "qualification", label: "Sentir que não sou qualificado(a) o suficiente", score: 4 },
      { value: "unknown", label: "O desconhecido, sair da zona de conforto", score: 5 },
    ],
  },
  {
    id: "demo-q4",
    text_pt: "Como você prefere trabalhar em seus objetivos de mobilidade?",
    question_type: "multiple_choice",
    category: "work_style",
    display_order: 4,
    options: [
      { value: "structured", label: "Com um plano estruturado e prazos claros", score: 5 },
      { value: "guided", label: "Com orientação, mas alguma flexibilidade", score: 4 },
      { value: "flexible", label: "De forma flexível, no meu próprio ritmo", score: 3 },
      { value: "exploratory", label: "Explorando opções sem compromisso imediato", score: 2 },
      { value: "spontaneous", label: "De forma espontânea, quando surge a oportunidade", score: 1 },
    ],
  },
  {
    id: "demo-q5",
    text_pt: "Quando você enfrenta um obstáculo no processo de candidatura:",
    question_type: "likert",
    category: "resilience",
    display_order: 5,
    options: [
      { value: "persist", label: "Persisto até encontrar uma solução", score: 5 },
      { value: "seek_help", label: "Busco ajuda e continuo tentando", score: 4 },
      { value: "pause", label: "Faço uma pausa e retomo depois", score: 3 },
      { value: "discouraged", label: "Fico desanimado(a) por um tempo", score: 2 },
      { value: "give_up", label: "Considero desistir", score: 1 },
    ],
  },
  {
    id: "demo-q6",
    text_pt: "Qual dessas afirmações melhor descreve sua situação atual?",
    question_type: "multiple_choice",
    category: "mobility_state",
    display_order: 6,
    options: [
      { value: "exploring", label: "Estou explorando possibilidades", score: 1 },
      { value: "planning", label: "Estou planejando minha estratégia", score: 2 },
      { value: "preparing", label: "Estou preparando documentos e materiais", score: 3 },
      { value: "applying", label: "Estou ativamente aplicando para oportunidades", score: 4 },
      { value: "waiting", label: "Estou aguardando respostas", score: 5 },
    ],
  },
  {
    id: "demo-q7",
    text_pt: "Como você se sente em relação ao seu perfil e experiências?",
    question_type: "likert",
    category: "self_perception",
    display_order: 7,
    options: [
      { value: "strong", label: "Tenho um perfil forte e competitivo", score: 5 },
      { value: "good", label: "Tenho boas experiências para compartilhar", score: 4 },
      { value: "average", label: "Tenho um perfil mediano", score: 3 },
      { value: "developing", label: "Ainda estou desenvolvendo meu perfil", score: 2 },
      { value: "weak", label: "Sinto que meu perfil é fraco", score: 1 },
    ],
  },
  {
    id: "demo-q8",
    text_pt: "Quando você pensa em prazos de candidatura:",
    question_type: "likert",
    category: "time_management",
    display_order: 8,
    options: [
      { value: "early", label: "Prefiro começar com bastante antecedência", score: 5 },
      { value: "planned", label: "Planejo com tempo suficiente", score: 4 },
      { value: "moderate", label: "Começo com tempo moderado", score: 3 },
      { value: "last_minute", label: "Costumo deixar para a última hora", score: 2 },
      { value: "procrastinate", label: "Procrastino frequentemente", score: 1 },
    ],
  },
];

/**
 * Calculate archetype based on demo quiz answers
 */
export function calculateDemoArchetype(answers: Record<string, string>): {
  dominant_archetype: string;
  primary_fear_cluster: string;
  mobility_state: string;
} {
  // Simple scoring logic based on answer patterns
  const scores: Record<string, number> = {};
  
  Object.entries(answers).forEach(([questionId, answerValue]) => {
    const question = DEMO_QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;
    
    const option = question.options.find(o => o.value === answerValue);
    if (!option) return;
    
    scores[question.category] = (scores[question.category] || 0) + option.score;
  });
  
  // Determine archetype based on overall confidence and readiness
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  
  let archetype = "explorer";
  if (avgScore >= 4.5) archetype = "pioneer";
  else if (avgScore >= 4) archetype = "strategist";
  else if (avgScore >= 3.5) archetype = "builder";
  else if (avgScore >= 3) archetype = "navigator";
  else if (avgScore >= 2.5) archetype = "seeker";
  
  // Determine fear cluster based on fear_cluster question
  const fearAnswer = answers["demo-q3"];
  let fearCluster = "uncertainty";
  if (fearAnswer === "rejection") fearCluster = "rejection";
  else if (fearAnswer === "financial") fearCluster = "scarcity";
  else if (fearAnswer === "language") fearCluster = "inadequacy";
  else if (fearAnswer === "qualification") fearCluster = "inadequacy";
  else if (fearAnswer === "unknown") fearCluster = "uncertainty";
  
  // Determine mobility state based on mobility_state question
  const stateAnswer = answers["demo-q6"];
  let mobilityState = "exploring";
  if (stateAnswer === "exploring") mobilityState = "exploring";
  else if (stateAnswer === "planning") mobilityState = "planning";
  else if (stateAnswer === "preparing") mobilityState = "preparing";
  else if (stateAnswer === "applying") mobilityState = "applying";
  else if (stateAnswer === "waiting") mobilityState = "deciding";
  
  return {
    dominant_archetype: archetype,
    primary_fear_cluster: fearCluster,
    mobility_state: mobilityState,
  };
}
