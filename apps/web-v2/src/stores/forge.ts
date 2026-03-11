import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DocType = "motivation_letter" | "cv" | "research_proposal" | "personal_statement" | "recommendation" | "other";

export interface DocVersion {
  id: string;
  content: string;
  savedAt: string;
  wordCount: number;
  label?: string;
}

export interface ForgeDocument {
  id: string;
  title: string;
  type: DocType;
  content: string;
  versions: DocVersion[];
  createdAt: string;
  updatedAt: string;
  competitivenessScore: number | null;
  targetProgram?: string;
  language: string;
}

export interface CoachMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
}

interface ForgeState {
  documents: ForgeDocument[];
  coachThreads: Record<string, CoachMessage[]>;
  createDocument: (doc: { title: string; type: DocType; targetProgram?: string; language?: string }) => string;
  updateContent: (docId: string, content: string) => void;
  updateTitle: (docId: string, title: string) => void;
  deleteDocument: (docId: string) => void;
  saveVersion: (docId: string, label?: string) => void;
  setCoachThread: (docId: string, messages: CoachMessage[]) => void;
  appendCoachMessage: (docId: string, message: Omit<CoachMessage, "id" | "createdAt">) => void;
  clearCoachThread: (docId: string) => void;
  getDocById: (id: string) => ForgeDocument | undefined;
  getDocsByType: (type: DocType) => ForgeDocument[];
  getStats: () => { total: number; avgScore: number; totalWords: number; recentlyEdited: number };
  reset: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function generateScore(content: string): number | null {
  const words = wordCount(content);
  if (words < 30) return null;
  // Heuristic scoring based on content quality signals
  let score = 40;
  // Length bonus (200-600 words is sweet spot for most docs)
  if (words >= 100) score += 8;
  if (words >= 200) score += 7;
  if (words >= 400) score += 5;
  if (words > 800) score -= 3; // Too long penalty
  // Structure signals
  if (content.includes("\n\n")) score += 5; // Paragraphs
  if (/\d+/.test(content)) score += 4; // Contains numbers/metrics
  if (content.split(".").length > 3) score += 5; // Multiple sentences
  // Keyword signals (common in strong applications)
  const strongSignals = ["experience", "research", "project", "team", "result", "impact", "skill", "goal", "contribute", "experiência", "pesquisa", "projeto", "equipe", "resultado", "impacto", "habilidade", "objetivo", "contribuir"];
  const matches = strongSignals.filter((kw) => content.toLowerCase().includes(kw)).length;
  score += Math.min(15, matches * 3);
  // Specificity bonus
  if (/\b(20\d{2})\b/.test(content)) score += 3; // Years
  if (/[A-Z]{2,}/.test(content)) score += 2; // Acronyms (programs, institutions)

  return Math.min(98, Math.max(15, score));
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  motivation_letter: "Carta de Motivação",
  cv: "Currículo",
  research_proposal: "Proposta de Pesquisa",
  personal_statement: "Personal Statement",
  recommendation: "Carta de Recomendação",
  other: "Outro",
};

export { DOC_TYPE_LABELS };

const SEED_DOCUMENTS: ForgeDocument[] = [
  {
    id: "fd1",
    title: "Carta de Motivação — TU Berlin",
    type: "motivation_letter",
    content: "Dear Admissions Committee,\n\nI am writing to express my strong interest in the MSc Computer Science program at TU Berlin. With a background in software engineering and 3 years of experience in distributed systems at a leading Brazilian tech company, I believe this program aligns perfectly with my career goals.\n\nDuring my undergraduate studies at USP, I developed a passion for systems architecture. My thesis on microservices orchestration received the best paper award at the university conference in 2023. This experience solidified my desire to pursue advanced studies in this field.\n\nI am particularly drawn to TU Berlin's research group on Cloud Computing and Internet Technologies. The work of Prof. Schmidt on serverless computing resonates with challenges I face daily in my professional work.\n\nI look forward to contributing my industry experience to the academic community while deepening my theoretical foundation.\n\nSincerely,",
    versions: [
      { id: "v1", content: "Draft 1...", savedAt: "2025-02-15T10:00:00Z", wordCount: 45, label: "Rascunho inicial" },
      { id: "v2", content: "Dear Admissions...", savedAt: "2025-02-28T14:30:00Z", wordCount: 142, label: "Versão revisada" },
    ],
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2025-03-01T09:15:00Z",
    competitivenessScore: 72,
    targetProgram: "TU Berlin — MSc Computer Science",
    language: "en",
  },
  {
    id: "fd2",
    title: "CV Acadêmico — Europa",
    type: "cv",
    content: "# Curriculum Vitae\n\n## Education\n- BSc Computer Science, USP (2018-2022), GPA 8.7/10\n\n## Experience\n- Software Engineer, Nubank (2022-present)\n  - Designed microservices handling 50M+ daily transactions\n  - Led migration from monolith to event-driven architecture\n  - Mentored 3 junior engineers\n\n## Research\n- Thesis: \"Orchestration Patterns for Microservices\" (Best Paper, USP 2022)\n- Published at SBRC 2023\n\n## Skills\n- Languages: Python, Go, Java, TypeScript\n- Cloud: AWS, GCP, Kubernetes\n- Languages: Portuguese (native), English (IELTS 8.0), German (B1)\n\n## Awards\n- Best Paper Award, USP Computer Science Conference 2022\n- Google Developer Scholarship 2021",
    versions: [
      { id: "v3", content: "Initial CV...", savedAt: "2025-01-10T08:00:00Z", wordCount: 85 },
      { id: "v4", content: "Updated CV...", savedAt: "2025-02-01T16:00:00Z", wordCount: 120 },
      { id: "v5", content: "# Curriculum Vitae...", savedAt: "2025-02-20T11:00:00Z", wordCount: 145, label: "Versão final" },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-02-20T11:00:00Z",
    competitivenessScore: 85,
    targetProgram: "Europa — Geral",
    language: "en",
  },
  {
    id: "fd3",
    title: "Research Proposal — UvA",
    type: "research_proposal",
    content: "",
    versions: [],
    createdAt: "2025-02-15T14:00:00Z",
    updatedAt: "2025-02-15T14:00:00Z",
    competitivenessScore: null,
    targetProgram: "UvA — MSc Artificial Intelligence",
    language: "en",
  },
];

export const useForgeStore = create<ForgeState>()(
  persist(
    (set, get) => ({
      documents: SEED_DOCUMENTS,
      coachThreads: {},

      createDocument: ({ title, type, targetProgram, language }) => {
        const id = `fd${Date.now()}`;
        const now = new Date().toISOString();
        const doc: ForgeDocument = {
          id,
          title,
          type,
          content: "",
          versions: [],
          createdAt: now,
          updatedAt: now,
          competitivenessScore: null,
          targetProgram,
          language: language || "pt",
        };
        set((state) => ({ documents: [...state.documents, doc] }));
        return id;
      },

      updateContent: (docId, content) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  content,
                  updatedAt: new Date().toISOString(),
                  competitivenessScore: generateScore(content),
                }
              : d
          ),
        })),

      updateTitle: (docId, title) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === docId ? { ...d, title, updatedAt: new Date().toISOString() } : d
          ),
        })),

      deleteDocument: (docId) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== docId),
        })),

      saveVersion: (docId, label) =>
        set((state) => ({
          documents: state.documents.map((d) => {
            if (d.id !== docId || !d.content.trim()) return d;
            const version: DocVersion = {
              id: `v${Date.now()}`,
              content: d.content,
              savedAt: new Date().toISOString(),
              wordCount: wordCount(d.content),
              label,
            };
            return { ...d, versions: [...d.versions, version] };
          }),
        })),

      setCoachThread: (docId, messages) =>
        set((state) => ({
          coachThreads: {
            ...state.coachThreads,
            [docId]: messages,
          },
        })),

      appendCoachMessage: (docId, message) =>
        set((state) => ({
          coachThreads: {
            ...state.coachThreads,
            [docId]: [
              ...(state.coachThreads[docId] || []),
              {
                id: `coach-${Date.now()}`,
                createdAt: new Date().toISOString(),
                ...message,
              },
            ],
          },
        })),

      clearCoachThread: (docId) =>
        set((state) => {
          const nextThreads = { ...state.coachThreads };
          delete nextThreads[docId];
          return { coachThreads: nextThreads };
        }),

      getDocById: (id) => get().documents.find((d) => d.id === id),

      getDocsByType: (type) => get().documents.filter((d) => d.type === type),

      getStats: () => {
        const docs = get().documents;
        const scored = docs.filter((d) => d.competitivenessScore !== null);
        const oneWeekAgo = Date.now() - 7 * 86400000;
        return {
          total: docs.length,
          avgScore: scored.length > 0
            ? Math.round(scored.reduce((s, d) => s + (d.competitivenessScore || 0), 0) / scored.length)
            : 0,
          totalWords: docs.reduce((s, d) => s + wordCount(d.content), 0),
          recentlyEdited: docs.filter((d) => new Date(d.updatedAt).getTime() > oneWeekAgo).length,
        };
      },

      reset: () => set({ documents: SEED_DOCUMENTS, coachThreads: {} }),
    }),
    { name: "olcan-forge" }
  )
);
