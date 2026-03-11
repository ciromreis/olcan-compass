import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InterviewType = "academic" | "visa" | "job" | "scholarship" | "panel";

export interface InterviewAnswer {
  questionIndex: number;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  timeSpent: number;
}

export interface InterviewSession {
  id: string;
  type: InterviewType;
  typeLabel: string;
  target: string;
  language: string;
  difficulty: string;
  status: "in_progress" | "completed";
  questions: string[];
  answers: InterviewAnswer[];
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
}

interface InterviewState {
  sessions: InterviewSession[];
  activeSessionId: string | null;
  startSession: (config: { type: InterviewType; typeLabel: string; target: string; language: string; difficulty: string }) => string;
  submitAnswer: (sessionId: string, answer: InterviewAnswer) => void;
  completeSession: (sessionId: string) => void;
  getSessionById: (id: string) => InterviewSession | undefined;
  getActiveSession: () => InterviewSession | undefined;
  getStats: () => { totalSessions: number; avgScore: number; totalTime: string; bestScore: number };
  reset: () => void;
}

const QUESTION_BANK: Record<InterviewType, string[]> = {
  academic: [
    "Tell me about yourself and why you're interested in this program.",
    "What research area interests you the most and why?",
    "How does this program fit into your long-term career goals?",
    "Can you describe a challenging academic project you've completed?",
    "What unique perspective or experience would you bring to this program?",
    "How do you handle working under pressure or tight deadlines?",
    "Where do you see yourself in 5 years after completing this program?",
    "Do you have any questions for us about the program?",
  ],
  visa: [
    "What is the purpose of your trip?",
    "How will you finance your stay abroad?",
    "Do you have ties to your home country that will ensure your return?",
    "Where will you be living during your stay?",
    "Have you traveled internationally before? Where?",
    "What is your current occupation?",
    "How long do you plan to stay?",
    "Do you have family or friends in the destination country?",
  ],
  job: [
    "Tell me about yourself and your professional background.",
    "Why are you interested in this role and our company?",
    "Describe a technical challenge you solved recently.",
    "How do you approach working in a multicultural team?",
    "What are your salary expectations for this role?",
    "Describe a situation where you had to lead a project with ambiguous requirements.",
    "What motivates you to relocate internationally for this position?",
    "Do you have any questions about the role or the team?",
  ],
  scholarship: [
    "Why did you choose this specific scholarship program?",
    "How will this scholarship contribute to your country's development?",
    "Describe your most significant academic achievement.",
    "What challenges do you expect to face and how will you overcome them?",
    "How do you plan to give back to your community after the scholarship?",
    "What makes you a strong candidate compared to others?",
    "Describe your research or study plan in detail.",
    "How does this opportunity align with your long-term goals?",
  ],
  panel: [
    "Please introduce yourself to the panel.",
    "What is your strongest qualification for this opportunity?",
    "How would your colleagues describe your work style?",
    "Give an example of how you've handled disagreement in a team.",
    "What is the most innovative project you've contributed to?",
    "How do you stay updated with developments in your field?",
    "What would you do in your first 90 days if selected?",
    "Is there anything else you'd like the panel to know?",
  ],
};

const FEEDBACK_TEMPLATES = {
  excellent: [
    "Excelente resposta! Clara, estruturada e convincente.",
    "Muito bem articulado. Demonstra maturidade e autoconhecimento.",
    "Resposta forte com exemplos concretos. Impressionante.",
  ],
  good: [
    "Boa resposta. Poderia ser mais específica com exemplos concretos.",
    "Sólida, mas tente conectar mais com o contexto da vaga/programa.",
    "Boa estrutura. Adicione mais detalhes sobre resultados quantificáveis.",
  ],
  average: [
    "Resposta adequada, mas genérica. Personalize mais para o contexto.",
    "Faltou profundidade. Tente usar a estrutura STAR (Situação, Tarefa, Ação, Resultado).",
    "A ideia está lá, mas a comunicação pode ser mais direta e confiante.",
  ],
  weak: [
    "Resposta curta demais. Desenvolva mais com exemplos específicos.",
    "Faltou clareza. Reestruture sua resposta com um começo, meio e fim claros.",
    "Precisa de mais preparação neste tópico. Pratique com a estrutura STAR.",
  ],
};

function generateScore(answerLength: number, timeSpent: number): number {
  const lengthScore = Math.min(40, answerLength / 3);
  const timeBonus = timeSpent > 10 && timeSpent < 120 ? 20 : timeSpent >= 120 ? 10 : 5;
  const randomVariance = Math.floor(Math.random() * 20) + 10;
  return Math.min(98, Math.max(30, Math.round(lengthScore + timeBonus + randomVariance)));
}

function generateFeedback(score: number): string {
  let pool: string[];
  if (score >= 80) pool = FEEDBACK_TEMPLATES.excellent;
  else if (score >= 65) pool = FEEDBACK_TEMPLATES.good;
  else if (score >= 50) pool = FEEDBACK_TEMPLATES.average;
  else pool = FEEDBACK_TEMPLATES.weak;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getQuestionsForType(type: InterviewType, count: number = 5): string[] {
  const bank = QUESTION_BANK[type] || QUESTION_BANK.academic;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bank.length));
}

export function getQuestionBank(type?: InterviewType): string[] | Record<InterviewType, string[]> {
  if (type) {
    return [...(QUESTION_BANK[type] || QUESTION_BANK.academic)];
  }

  return Object.fromEntries(
    (Object.entries(QUESTION_BANK) as Array<[InterviewType, string[]]>).map(([key, value]) => [key, [...value]])
  ) as Record<InterviewType, string[]>;
}

export { generateScore, generateFeedback };

const SEED_SESSIONS: InterviewSession[] = [
  {
    id: "s1",
    type: "academic",
    typeLabel: "Admissão Acadêmica",
    target: "TU Berlin — MSc Computer Science",
    language: "en",
    difficulty: "Intermediário",
    status: "completed",
    questions: [
      "Tell me about yourself and why you're interested in this program.",
      "What research area interests you the most?",
      "How do you handle working under pressure?",
      "Where do you see yourself in 5 years?",
      "Do you have any questions for us about the program?",
    ],
    startedAt: "2025-03-01T10:00:00Z",
    completedAt: "2025-03-01T10:18:00Z",
    overallScore: 74,
    answers: [
      { questionIndex: 0, question: "Tell me about yourself and why you're interested in this program.", answer: "I'm a software engineer with 3 years of experience in backend systems...", score: 82, feedback: "Boa estrutura. Faltou mencionar experiência específica com distributed systems.", timeSpent: 65 },
      { questionIndex: 1, question: "What research area interests you the most?", answer: "I'm interested in distributed systems and cloud computing...", score: 75, feedback: "Resposta válida mas genérica. Mencione o grupo de pesquisa do Prof. Schmidt.", timeSpent: 45 },
      { questionIndex: 2, question: "How do you handle working under pressure?", answer: "I try to stay organized and break tasks down...", score: 68, feedback: "Resposta hesitante no início. Pratique o opening statement.", timeSpent: 38 },
      { questionIndex: 3, question: "Where do you see yourself in 5 years?", answer: "I want to work in the European tech industry...", score: 60, feedback: "Falta de clareza nos objetivos pós-mestrado. Seja mais específico.", timeSpent: 30 },
    ],
  },
  {
    id: "s2",
    type: "visa",
    typeLabel: "Visto de Estudante",
    target: "Consulado Alemão — São Paulo",
    language: "en",
    difficulty: "Iniciante",
    status: "completed",
    questions: [
      "What is the purpose of your trip?",
      "How will you finance your stay abroad?",
      "Do you have ties to your home country?",
      "Where will you be living during your stay?",
      "How long do you plan to stay?",
    ],
    startedAt: "2025-02-22T14:00:00Z",
    completedAt: "2025-02-22T14:12:00Z",
    overallScore: 68,
    answers: [
      { questionIndex: 0, question: "What is the purpose of your trip?", answer: "I'm going to study at TU Berlin...", score: 78, feedback: "Clara e direta. Boa resposta para entrevista consular.", timeSpent: 20 },
      { questionIndex: 1, question: "How will you finance your stay abroad?", answer: "I have a blocked account (Sperrkonto) and savings...", score: 72, feedback: "Boa menção ao Sperrkonto. Inclua valores específicos.", timeSpent: 25 },
      { questionIndex: 2, question: "Do you have ties to your home country?", answer: "Yes, my family is here...", score: 55, feedback: "Resposta fraca. Mencione propriedade, emprego garantido de retorno, ou outros vínculos concretos.", timeSpent: 15 },
    ],
  },
];

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      sessions: SEED_SESSIONS,
      activeSessionId: null,

      startSession: (config) => {
        const id = `s_${Date.now()}`;
        const questions = getQuestionsForType(config.type, 5);
        const session: InterviewSession = {
          id,
          ...config,
          status: "in_progress",
          questions,
          answers: [],
          startedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      submitAnswer: (sessionId, answer) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, answers: [...s.answers, answer] }
              : s
          ),
        })),

      completeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const avg = s.answers.length > 0
              ? Math.round(s.answers.reduce((sum, a) => sum + a.score, 0) / s.answers.length)
              : 0;
            return {
              ...s,
              status: "completed" as const,
              completedAt: new Date().toISOString(),
              overallScore: avg,
            };
          }),
          activeSessionId: null,
        })),

      getSessionById: (id) => get().sessions.find((s) => s.id === id),

      getActiveSession: () => {
        const id = get().activeSessionId;
        return id ? get().sessions.find((s) => s.id === id) : undefined;
      },

      getStats: () => {
        const completed = get().sessions.filter((s) => s.status === "completed");
        const totalTime = completed.reduce((sum, s) => {
          if (s.startedAt && s.completedAt) {
            return sum + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime());
          }
          return sum;
        }, 0);
        const minutes = Math.round(totalTime / 60000);
        const avgScore = completed.length > 0
          ? Math.round(completed.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completed.length)
          : 0;
        const bestScore = completed.reduce((best, s) => Math.max(best, s.overallScore || 0), 0);
        return {
          totalSessions: completed.length,
          avgScore,
          totalTime: `${minutes} min`,
          bestScore,
        };
      },

      reset: () => set({ sessions: SEED_SESSIONS, activeSessionId: null }),
    }),
    { name: "olcan-interviews" }
  )
);
