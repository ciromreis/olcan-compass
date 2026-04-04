import { create } from "zustand";
import { persist } from "zustand/middleware";
import { interviewsApi } from "@/lib/api";

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
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
  status: "in_progress" | "completed";
  questions: string[];
  answers: InterviewAnswer[];
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
}

export interface InterviewQuestionContext {
  archetype?: string | null;
  target?: string | null;
  sourceDocumentTitle?: string | null;
  sourceDocumentType?: string | null;
  sourceProgram?: string | null;
  sourceSnippet?: string | null;
}

interface RemoteInterviewQuestion {
  id: string;
  question_text_en: string;
  question_text_pt: string;
  question_text_es: string;
  question_type: string;
  route_types?: string[];
  difficulty?: string;
}

interface RemoteInterviewAnswer {
  id: string;
  transcript?: string | null;
  duration_seconds?: number | null;
  overall_score?: number | null;
  content_feedback?: string | null;
  delivery_feedback?: string | null;
  improvement_suggestions?: string[];
  question?: RemoteInterviewQuestion | null;
}

interface RemoteInterviewSession {
  id: string;
  session_type: string;
  route_id?: string | null;
  source_narrative_id?: string | null;
  source_narrative_title?: string | null;
  target_institution?: string | null;
  status: string;
  total_questions: number;
  current_question_index: number;
  overall_score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  current_question?: RemoteInterviewQuestion | null;
  answers?: RemoteInterviewAnswer[];
}

interface StartSessionConfig {
  type: InterviewType;
  typeLabel: string;
  target: string;
  language: string;
  difficulty: string;
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
}

interface InterviewState {
  sessions: InterviewSession[];
  activeSessionId: string | null;
  isSyncing: boolean;
  syncError: string | null;
  syncFromApi: () => Promise<void>;
  startSession: (config: StartSessionConfig) => Promise<string | null>;
  submitAnswer: (sessionId: string, answer: InterviewAnswer) => Promise<InterviewAnswer | null>;
  completeSession: (sessionId: string) => Promise<void>;
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
  ],
  visa: [
    "What is the purpose of your trip?",
    "How will you finance your stay abroad?",
    "Do you have ties to your home country that will ensure your return?",
    "Where will you be living during your stay?",
    "How long do you plan to stay?",
  ],
  job: [
    "Tell me about yourself and your professional background.",
    "Why are you interested in this role and our company?",
    "Describe a technical challenge you solved recently.",
    "How do you approach working in a multicultural team?",
    "What motivates you to relocate internationally for this position?",
  ],
  scholarship: [
    "Why did you choose this specific scholarship program?",
    "How will this scholarship contribute to your country's development?",
    "Describe your most significant academic achievement.",
    "What challenges do you expect to face and how will you overcome them?",
    "How does this opportunity align with your long-term goals?",
  ],
  panel: [
    "Please introduce yourself to the panel.",
    "What is your strongest qualification for this opportunity?",
    "How would your colleagues describe your work style?",
    "Give an example of how you've handled disagreement in a team.",
    "What would you do in your first 90 days if selected?",
  ],
};

const SEED_SESSIONS: InterviewSession[] = [];

const TYPE_LABELS: Record<InterviewType, string> = {
  academic: "Admissão Acadêmica",
  visa: "Entrevista de Visto",
  job: "Entrevista de Emprego",
  scholarship: "Entrevista de Bolsa",
  panel: "Painel/Comitê",
};

const SESSION_QUESTION_CACHE: Record<string, string[]> = {};
const SESSION_META_CACHE: Record<string, {
  language: string;
  difficulty: string;
  type: InterviewType;
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
}> = {};
let REMOTE_QUESTION_BANK: Record<InterviewType, string[]> = { ...QUESTION_BANK };

function normalizeType(value: string): InterviewType {
  if (value.includes("visa")) return "visa";
  if (value.includes("job") || value.includes("work") || value.includes("employment")) return "job";
  if (value.includes("scholarship") || value.includes("grant") || value.includes("fellowship")) return "scholarship";
  if (value.includes("panel") || value.includes("committee")) return "panel";
  return "academic";
}

function normalizeQuestionType(question: RemoteInterviewQuestion): InterviewType {
  const routeTypes = question.route_types || [];
  if (routeTypes.includes("job_relocation")) return "job";
  if (routeTypes.includes("scholarship")) return "scholarship";
  if (question.question_type === "technical" || question.question_type === "cultural_fit") return "job";
  if (question.question_type === "question_for_panel") return "panel";
  const text = `${question.question_text_en} ${question.question_text_pt}`.toLowerCase();
  if (text.includes("visa") || text.includes("consular") || text.includes("trip")) return "visa";
  if (text.includes("scholarship") || text.includes("bolsa")) return "scholarship";
  return "academic";
}

function updateRemoteQuestionBank(questions: RemoteInterviewQuestion[]) {
  const nextBank: Record<InterviewType, string[]> = {
    academic: [],
    visa: [],
    job: [],
    scholarship: [],
    panel: [],
  };

  for (const question of questions) {
    const type = normalizeQuestionType(question);
    nextBank[type].push(question.question_text_pt || question.question_text_en);
  }

  REMOTE_QUESTION_BANK = {
    academic: nextBank.academic.length > 0 ? nextBank.academic : QUESTION_BANK.academic,
    visa: nextBank.visa.length > 0 ? nextBank.visa : QUESTION_BANK.visa,
    job: nextBank.job.length > 0 ? nextBank.job : QUESTION_BANK.job,
    scholarship: nextBank.scholarship.length > 0 ? nextBank.scholarship : QUESTION_BANK.scholarship,
    panel: nextBank.panel.length > 0 ? nextBank.panel : QUESTION_BANK.panel,
  };
}

function getCachedQuestions(type: InterviewType, count = 5): string[] {
  const bank = REMOTE_QUESTION_BANK[type] || QUESTION_BANK[type];
  return [...bank].slice(0, Math.min(count, bank.length));
}

export function getQuestionsForType(type: InterviewType, count = 5, archetype?: string | null): string[] {
  const generic = getCachedQuestions(type, count);
  if (!archetype) return generic;
  
  const ptMap: Record<string, string> = {
    "The Scientist": "Como a sua capacidade analítica de 'Cientista' se aplica aos desafios desta oportunidade?",
    "The Diplomat": "Como o seu perfil de 'Diplomata' ajuda a construir consenso e alinhar expectativas neste cenário?",
    "The Strategist": "Sendo um 'Estrategista', como você estrutura sistemas complexos para atingir resultados no longo prazo?",
    "The Pioneer": "Na posição de 'Pioneiro', descreva uma situação onde você desbravou um caminho inédito com sucesso.",
  };

  const currentQPt = ptMap[archetype] || `Sendo do arquétipo '${archetype}', como você utiliza suas forças naturais para lidar com incertezas?`;
  const currentQEn = `As someone with the '${archetype}' archetype, how do you leverage your natural strengths in this scenario?`;

  const contextualQ = type === "academic" || type === "scholarship" ? currentQPt : currentQEn;

  const mixed = [...generic];
  if (mixed.length > 2) {
    mixed[2] = contextualQ;
  } else {
    mixed.push(contextualQ);
  }
  return mixed.slice(0, count);
}

function extractTerms(...values: Array<string | null | undefined>): string[] {
  const raw = values
    .filter(Boolean)
    .join(" ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 4);

  const stopwords = new Set([
    "para", "com", "this", "that", "from", "your", "você", "sobre", "have", "will",
    "program", "programa", "letter", "carta", "motivation", "statement", "currículo",
    "documento", "personal", "research", "proposal",
  ]);

  return Array.from(new Set(raw.filter((term) => !stopwords.has(term.toLowerCase())))).slice(0, 4);
}

export function contextualizeQuestions(
  baseQuestions: string[],
  type: InterviewType,
  context?: InterviewQuestionContext
): string[] {
  if (!context) return baseQuestions;

  const target = context.sourceProgram || context.target || context.sourceDocumentTitle;
  const keywords = extractTerms(
    context.sourceDocumentTitle,
    context.sourceProgram,
    context.target,
    context.sourceSnippet
  );

  if (!target) return baseQuestions;

  const contextualPrompts: string[] = [];

  if (type === "academic" || type === "scholarship") {
    contextualPrompts.push(`Como a narrativa que você preparou para ${target} sustenta sua candidatura de forma convincente?`);
    if (keywords.length > 0) {
      contextualPrompts.push(`No seu dossiê aparecem elementos como ${keywords.join(", ")}. Como isso reforça sua aderência a ${target}?`);
    }
  } else if (type === "job" || type === "panel") {
    contextualPrompts.push(`Se o recrutador ler o documento que você preparou para ${target}, qual evidência principal você quer sustentar ao responder agora?`);
    if (keywords.length > 0) {
      contextualPrompts.push(`Seu material destaca ${keywords.join(", ")}. Como você transformaria isso em um exemplo claro durante a conversa?`);
    }
  } else if (type === "visa") {
    contextualPrompts.push(`Com base no plano que você estruturou para ${target}, como você explicaria seu objetivo de forma direta e confiável?`);
  }

  if (context.archetype) {
    contextualPrompts.push(`Sem soar genérico, como você usa seu perfil de ${context.archetype} para responder com clareza e credibilidade nesta entrevista?`);
  }

  if (contextualPrompts.length === 0) return baseQuestions;

  const merged = [...baseQuestions];
  contextualPrompts.slice(0, Math.min(2, merged.length)).forEach((prompt, index) => {
    const targetIndex = Math.min(index + 1, merged.length - 1);
    merged[targetIndex] = prompt;
  });

  return merged;
}

export function getQuestionBank(type?: InterviewType): string[] | Record<InterviewType, string[]> {
  if (type) {
    return [...(REMOTE_QUESTION_BANK[type] || QUESTION_BANK[type])];
  }

  return {
    academic: [...REMOTE_QUESTION_BANK.academic],
    visa: [...REMOTE_QUESTION_BANK.visa],
    job: [...REMOTE_QUESTION_BANK.job],
    scholarship: [...REMOTE_QUESTION_BANK.scholarship],
    panel: [...REMOTE_QUESTION_BANK.panel],
  };
}

function mapFeedback(answer: RemoteInterviewAnswer): string {
  if (answer.content_feedback) return answer.content_feedback;
  if (answer.delivery_feedback) return answer.delivery_feedback;
  if ((answer.improvement_suggestions || []).length > 0) {
    return answer.improvement_suggestions![0];
  }
  return "Resposta registrada e analisada.";
}

function mapAnswer(
  answer: RemoteInterviewAnswer,
  questionIndex: number,
  questionLabel: string
): InterviewAnswer {
  return {
    questionIndex,
    question: answer.question?.question_text_pt || answer.question?.question_text_en || questionLabel,
    answer: answer.transcript || "",
    score: Math.round(answer.overall_score || 0),
    feedback: mapFeedback(answer),
    timeSpent: answer.duration_seconds || 0,
  };
}

function buildQuestions(
  remote: RemoteInterviewSession,
  previous?: InterviewSession
): string[] {
  const cached = SESSION_QUESTION_CACHE[remote.id] || previous?.questions || [];
  const size = Math.max(remote.total_questions || 0, cached.length, remote.answers?.length || 0);
  const questions = Array.from({ length: size }, (_, index) => cached[index] || `Pergunta ${index + 1}`);

  (remote.answers || []).forEach((answer, index) => {
    const text = answer.question?.question_text_pt || answer.question?.question_text_en;
    if (text) questions[index] = text;
  });

  if (remote.current_question && remote.current_question_index < questions.length) {
    questions[remote.current_question_index] =
      remote.current_question.question_text_pt || remote.current_question.question_text_en;
  }

  if (questions.length === 0) {
    return previous?.questions || getCachedQuestions(normalizeType(remote.session_type), 5);
  }

  SESSION_QUESTION_CACHE[remote.id] = questions;
  return questions;
}

function mapRemoteSession(
  remote: RemoteInterviewSession,
  previous?: InterviewSession
): InterviewSession {
  const type = previous?.type || SESSION_META_CACHE[remote.id]?.type || normalizeType(remote.session_type);
  const questions = buildQuestions(remote, previous);
  const answers = (remote.answers || []).map((answer, index) =>
    mapAnswer(answer, index, questions[index] || `Pergunta ${index + 1}`)
  );

  return {
    id: remote.id,
    type,
    typeLabel: TYPE_LABELS[type],
    target: remote.target_institution || previous?.target || TYPE_LABELS[type],
    language: previous?.language || SESSION_META_CACHE[remote.id]?.language || "en",
    difficulty: previous?.difficulty || SESSION_META_CACHE[remote.id]?.difficulty || "Intermediário",
    sourceDocumentId: remote.source_narrative_id || previous?.sourceDocumentId || SESSION_META_CACHE[remote.id]?.sourceDocumentId,
    sourceDocumentTitle: remote.source_narrative_title || previous?.sourceDocumentTitle || SESSION_META_CACHE[remote.id]?.sourceDocumentTitle,
    status: remote.status === "completed" ? "completed" : "in_progress",
    questions,
    answers,
    startedAt: remote.started_at || remote.created_at,
    completedAt: remote.completed_at || undefined,
    overallScore: remote.overall_score ? Math.round(remote.overall_score) : undefined,
  };
}

async function loadDetailedSessions(previousSessions: InterviewSession[]): Promise<InterviewSession[]> {
  const { data } = await interviewsApi.getSessions();
  const items: RemoteInterviewSession[] = data?.items || [];

  const details = await Promise.allSettled(
    items.map(async (item) => {
      const detailResponse = await interviewsApi.getSession(item.id);
      const previous = previousSessions.find((session) => session.id === item.id);
      return mapRemoteSession(detailResponse.data as RemoteInterviewSession, previous);
    })
  );

  return details.flatMap((result, index) => {
    const previous = previousSessions.find((session) => session.id === items[index].id);
    if (result.status === "fulfilled") return [result.value];
    return [mapRemoteSession(items[index], previous)];
  });
}

function getFocusTypes(type: InterviewType): string[] | undefined {
  switch (type) {
    case "job":
      return ["background", "technical", "challenge", "cultural_fit"];
    case "visa":
      return ["background", "goals", "scenario"];
    case "scholarship":
      return ["motivation", "goals", "challenge", "background"];
    case "panel":
      return ["background", "challenge", "goals", "cultural_fit"];
    case "academic":
    default:
      return ["motivation", "background", "goals", "challenge"];
  }
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      sessions: SEED_SESSIONS,
      activeSessionId: null,
      isSyncing: false,
      syncError: null,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const [questionsResponse, sessions] = await Promise.all([
            interviewsApi.getQuestions(),
            loadDetailedSessions(get().sessions),
          ]);

          updateRemoteQuestionBank((questionsResponse.data?.items || []) as RemoteInterviewQuestion[]);

          const activeSession = sessions.find((session) => session.status === "in_progress");
          set({
            sessions,
            activeSessionId: activeSession?.id || null,
            isSyncing: false,
            syncError: null,
          });
        } catch {
          set({
            isSyncing: false,
            syncError: "Não foi possível sincronizar as entrevistas com a API.",
          });
        }
      },

      startSession: async (config) => {
        try {
          const createResponse = await interviewsApi.createSession({
            session_type: config.type,
            target_institution: config.target,
            source_narrative_id: config.sourceDocumentId,
            source_narrative_title: config.sourceDocumentTitle,
            estimated_duration_minutes: config.difficulty === "Avançado" ? 45 : 30,
          });
          const created = createResponse.data as RemoteInterviewSession;

          SESSION_META_CACHE[created.id] = {
            type: config.type,
            language: config.language,
            difficulty: config.difficulty,
            sourceDocumentId: config.sourceDocumentId,
            sourceDocumentTitle: config.sourceDocumentTitle,
          };

          const startResponse = await interviewsApi.startSession(created.id, {
            question_count: 5,
            focus_types: getFocusTypes(config.type),
          });

          const selectedQuestions = ((startResponse.data?.questions || []) as RemoteInterviewQuestion[]).map(
            (question) => question.question_text_pt || question.question_text_en
          );
          SESSION_QUESTION_CACHE[created.id] = selectedQuestions;

          const detailResponse = await interviewsApi.getSession(created.id);
          const mapped = mapRemoteSession(detailResponse.data as RemoteInterviewSession, {
            id: created.id,
            type: config.type,
            typeLabel: config.typeLabel,
            target: config.target,
            language: config.language,
            difficulty: config.difficulty,
            sourceDocumentId: config.sourceDocumentId,
            sourceDocumentTitle: config.sourceDocumentTitle,
            status: "in_progress",
            questions: selectedQuestions,
            answers: [],
            startedAt: created.started_at || created.created_at,
          });

          set((state) => ({
            sessions: [mapped, ...state.sessions.filter((session) => session.id !== mapped.id)],
            activeSessionId: mapped.id,
            syncError: null,
          }));

          return mapped.id;
        } catch {
          set({ syncError: "Não foi possível iniciar a sessão de entrevista." });
          return null;
        }
      },

      submitAnswer: async (sessionId, answer) => {
        const previousSessions = get().sessions;
        try {
          const submitResponse = await interviewsApi.submitAnswer(sessionId, {
            transcript: answer.answer,
            duration_seconds: answer.timeSpent,
          });

          const recorded = submitResponse.data as RemoteInterviewAnswer;
          const analyzeResponse = await interviewsApi.analyzeAnswer(recorded.id, {
            ai_model: process.env.NEXT_PUBLIC_INTERVIEWS_MODEL || "gpt-4o-mini-interview",
          });
          const analyzed = analyzeResponse.data as RemoteInterviewAnswer;

          const detailResponse = await interviewsApi.getSession(sessionId);
          const previous = previousSessions.find((session) => session.id === sessionId);
          const mapped = mapRemoteSession(detailResponse.data as RemoteInterviewSession, previous);
          const latestAnswer =
            mapped.answers[mapped.answers.length - 1] ||
            mapAnswer(analyzed, answer.questionIndex, answer.question);

          set((state) => ({
            sessions: state.sessions.map((session) => (session.id === sessionId ? mapped : session)),
            activeSessionId: mapped.status === "in_progress" ? mapped.id : null,
            syncError: null,
          }));

          return latestAnswer;
        } catch {
          set({
            sessions: previousSessions,
            syncError: "Não foi possível enviar a resposta da entrevista.",
          });
          return null;
        }
      },

      completeSession: async (sessionId) => {
        const previousSessions = get().sessions;
        try {
          await interviewsApi.completeSession(sessionId);
          const detailResponse = await interviewsApi.getSession(sessionId);
          const previous = previousSessions.find((session) => session.id === sessionId);
          const mapped = mapRemoteSession(detailResponse.data as RemoteInterviewSession, previous);

          set((state) => ({
            sessions: state.sessions.map((session) => (session.id === sessionId ? mapped : session)),
            activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
            syncError: null,
          }));
        } catch {
          set({
            sessions: previousSessions,
            syncError: "Não foi possível concluir a sessão de entrevista.",
          });
        }
      },

      getSessionById: (id) => get().sessions.find((session) => session.id === id),

      getActiveSession: () => {
        const id = get().activeSessionId;
        return id ? get().sessions.find((session) => session.id === id) : undefined;
      },

      getStats: () => {
        const completed = get().sessions.filter((session) => session.status === "completed");
        const totalTime = completed.reduce((sum, session) => {
          if (session.startedAt && session.completedAt) {
            return sum + (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime());
          }
          return sum;
        }, 0);
        const minutes = Math.round(totalTime / 60000);
        const avgScore =
          completed.length > 0
            ? Math.round(
                completed.reduce((sum, session) => sum + (session.overallScore || 0), 0) /
                  completed.length
              )
            : 0;
        const bestScore = completed.reduce(
          (best, session) => Math.max(best, session.overallScore || 0),
          0
        );

        return {
          totalSessions: completed.length,
          avgScore,
          totalTime: `${minutes} min`,
          bestScore,
        };
      },

      reset: () => set({ sessions: SEED_SESSIONS, activeSessionId: null, isSyncing: false, syncError: null }),
    }),
    { name: "olcan-interviews" }
  )
);
