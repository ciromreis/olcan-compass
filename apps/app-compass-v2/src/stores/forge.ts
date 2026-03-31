import { create } from "zustand";
import { persist } from "zustand/middleware";
import { forgeApi } from "@/lib/api";

export type DocType =
  | "motivation_letter"
  | "cv"
  | "research_proposal"
  | "personal_statement"
  | "recommendation"
  | "other";

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
  constraints?: {
    minWords?: number;
    maxWords?: number;
    targetScholarship?: string;
  };
  interviewLoop?: {
    linkedSessionCount: number;
    completedSessionCount: number;
    averageOverallScore?: number | null;
    alignmentScore?: number | null;
    evidenceCoverageScore?: number | null;
    averageAnswerDurationSeconds?: number | null;
    strongestSignals: string[];
    focusAreas: string[];
    latestSessionId?: string | null;
  };
}

export interface CoachMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
}

interface RemoteNarrativeVersion {
  id: string;
  content: string;
  word_count: number;
  change_summary?: string | null;
  created_at: string;
}

interface RemoteNarrativeDetail {
  id: string;
  title: string;
  narrative_type: string;
  target_country?: string | null;
  target_institution?: string | null;
  target_program?: string | null;
  latest_overall_score?: number | null;
  created_at: string;
  updated_at: string;
  current_version?: RemoteNarrativeVersion | null;
  versions?: RemoteNarrativeVersion[];
  interview_loop?: {
    linked_session_count: number;
    completed_session_count: number;
    average_overall_score?: number | null;
    alignment_score?: number | null;
    evidence_coverage_score?: number | null;
    average_answer_duration_seconds?: number | null;
    strongest_signals?: string[];
    focus_areas?: string[];
    latest_session_id?: string | null;
  } | null;
}

interface ForgeState {
  documents: ForgeDocument[];
  coachThreads: Record<string, CoachMessage[]>;
  isSyncing: boolean;
  syncError: string | null;
  syncFromApi: () => Promise<void>;
  createDocument: (doc: {
    title: string;
    type: DocType;
    targetProgram?: string;
    language?: string;
  }) => Promise<string | null>;
  updateContent: (docId: string, content: string) => Promise<void>;
  updateTitle: (docId: string, title: string) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
  saveVersion: (docId: string, label?: string) => Promise<void>;
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

function fallbackScore(content: string): number | null {
  const words = wordCount(content);
  if (words < 30) return null;
  let score = 40;
  if (words >= 100) score += 8;
  if (words >= 200) score += 7;
  if (words >= 400) score += 5;
  if (content.includes("\n\n")) score += 5;
  if (/\d+/.test(content)) score += 4;
  if (content.split(".").length > 3) score += 5;
  return Math.min(98, Math.max(15, score));
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  motivation_letter: "Carta de Motivação",
  cv: "Currículo",
  research_proposal: "Proposta de Pesquisa",
  personal_statement: "Apresentação Pessoal",
  recommendation: "Carta de Recomendação",
  other: "Outro",
};

const LOCAL_TO_REMOTE_TYPE: Record<DocType, string> = {
  motivation_letter: "motivation_letter",
  cv: "cv_summary",
  research_proposal: "research_proposal",
  personal_statement: "personal_statement",
  recommendation: "other",
  other: "other",
};

const REMOTE_TO_LOCAL_TYPE: Record<string, DocType> = {
  motivation_letter: "motivation_letter",
  cv_summary: "cv",
  research_proposal: "research_proposal",
  personal_statement: "personal_statement",
  cover_letter: "recommendation",
  scholarship_essay: "other",
  other: "other",
};

export { DOC_TYPE_LABELS };

function normalizeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function mapVersion(version: RemoteNarrativeVersion): DocVersion {
  return {
    id: version.id,
    content: version.content,
    savedAt: normalizeDate(version.created_at),
    wordCount: version.word_count,
    label: version.change_summary || undefined,
  };
}

function mapNarrative(detail: RemoteNarrativeDetail): ForgeDocument {
  const currentContent = detail.current_version?.content || "";
  return {
    id: detail.id,
    title: detail.title,
    type: REMOTE_TO_LOCAL_TYPE[detail.narrative_type] || "other",
    content: currentContent,
    versions: (detail.versions || (detail.current_version ? [detail.current_version] : [])).map(mapVersion),
    createdAt: normalizeDate(detail.created_at),
    updatedAt: normalizeDate(detail.updated_at),
    competitivenessScore:
      detail.latest_overall_score !== null && detail.latest_overall_score !== undefined
        ? Math.round(detail.latest_overall_score)
        : fallbackScore(currentContent),
    targetProgram: detail.target_program || detail.target_institution || undefined,
    language: "en",
    interviewLoop: detail.interview_loop
      ? {
          linkedSessionCount: detail.interview_loop.linked_session_count || 0,
          completedSessionCount: detail.interview_loop.completed_session_count || 0,
          averageOverallScore: detail.interview_loop.average_overall_score ?? null,
          alignmentScore: detail.interview_loop.alignment_score ?? null,
          evidenceCoverageScore: detail.interview_loop.evidence_coverage_score ?? null,
          averageAnswerDurationSeconds: detail.interview_loop.average_answer_duration_seconds ?? null,
          strongestSignals: detail.interview_loop.strongest_signals || [],
          focusAreas: detail.interview_loop.focus_areas || [],
          latestSessionId: detail.interview_loop.latest_session_id ?? null,
        }
      : undefined,
  };
}

async function loadDetailedDocuments(previous: ForgeDocument[]): Promise<ForgeDocument[]> {
  const { data } = await forgeApi.getDocuments();
  const items: RemoteNarrativeDetail[] = data?.items || [];

  const details = await Promise.allSettled(
    items.map(async (item) => {
      const detailResponse = await forgeApi.getDocument(item.id, {
        include_versions: true,
        include_analyses: true,
      });
      return mapNarrative(detailResponse.data as RemoteNarrativeDetail);
    })
  );

  return details.flatMap((result, index) => {
    if (result.status === "fulfilled") return [result.value];
    const fallback = previous.find((doc) => doc.id === items[index].id);
    return fallback ? [fallback] : [];
  });
}

export const useForgeStore = create<ForgeState>()(
  persist(
    (set, get) => ({
      documents: [],
      coachThreads: {},
      isSyncing: false,
      syncError: null,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const documents = await loadDetailedDocuments(get().documents);
          set({ documents, isSyncing: false, syncError: null });
        } catch {
          set({
            isSyncing: false,
            syncError: "Não foi possível sincronizar os documentos do Forge com a API.",
          });
        }
      },

      createDocument: async ({ title, type, targetProgram, language }) => {
        try {
          const response = await forgeApi.createDocument({
            title,
            narrative_type: LOCAL_TO_REMOTE_TYPE[type] || "other",
            content: " ",
            target_program: targetProgram || null,
            target_institution: targetProgram || null,
            target_country: null,
          });

          const detailResponse = await forgeApi.getDocument(response.data.id, {
            include_versions: true,
            include_analyses: true,
          });
          const mapped = mapNarrative(detailResponse.data as RemoteNarrativeDetail);
          mapped.language = language || "pt";

          set((state) => ({
            documents: [mapped, ...state.documents.filter((doc) => doc.id !== mapped.id)],
            syncError: null,
          }));
          return mapped.id;
        } catch {
          set({ syncError: "Não foi possível criar o documento no Forge." });
          return null;
        }
      },

      updateContent: async (docId, content) => {
        const previous = get().documents;
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId
              ? {
                  ...doc,
                  content,
                  updatedAt: new Date().toISOString(),
                  competitivenessScore: fallbackScore(content),
                }
              : doc
          ),
        }));

        try {
          await forgeApi.updateContent(docId, content);
          const detailResponse = await forgeApi.getDocument(docId, {
            include_versions: true,
            include_analyses: true,
          });
          const mapped = mapNarrative(detailResponse.data as RemoteNarrativeDetail);
          set((state) => ({
            documents: state.documents.map((doc) => (doc.id === docId ? mapped : doc)),
            syncError: null,
          }));
        } catch {
          set({
            documents: previous,
            syncError: "Não foi possível salvar o rascunho do documento.",
          });
        }
      },

      updateTitle: async (docId, title) => {
        const previous = get().documents;
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, title, updatedAt: new Date().toISOString() } : doc
          ),
        }));

        try {
          await forgeApi.updateDocument(docId, { title });
          const detailResponse = await forgeApi.getDocument(docId, {
            include_versions: true,
            include_analyses: true,
          });
          const mapped = mapNarrative(detailResponse.data as RemoteNarrativeDetail);
          set((state) => ({
            documents: state.documents.map((doc) => (doc.id === docId ? mapped : doc)),
            syncError: null,
          }));
        } catch {
          set({ documents: previous, syncError: "Não foi possível atualizar o título do documento." });
        }
      },

      deleteDocument: async (docId) => {
        const previous = get().documents;
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== docId),
        }));

        try {
          await forgeApi.deleteDocument(docId);
        } catch {
          set({ documents: previous, syncError: "Não foi possível remover o documento." });
        }
      },

      saveVersion: async (docId, label) => {
        const doc = get().documents.find((item) => item.id === docId);
        if (!doc || !doc.content.trim()) return;

        try {
          await forgeApi.createVersion(docId, {
            content: doc.content,
            change_summary: label || "Versão salva manualmente",
          });
          const detailResponse = await forgeApi.getDocument(docId, {
            include_versions: true,
            include_analyses: true,
          });
          const mapped = mapNarrative(detailResponse.data as RemoteNarrativeDetail);
          set((state) => ({
            documents: state.documents.map((item) => (item.id === docId ? mapped : item)),
            syncError: null,
          }));
        } catch {
          set({ syncError: "Não foi possível salvar uma nova versão do documento." });
        }
      },

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

      getDocById: (id) => get().documents.find((doc) => doc.id === id),

      getDocsByType: (type) => get().documents.filter((doc) => doc.type === type),

      getStats: () => {
        const docs = get().documents;
        const scored = docs.filter((doc) => doc.competitivenessScore !== null);
        const oneWeekAgo = Date.now() - 7 * 86400000;
        return {
          total: docs.length,
          avgScore:
            scored.length > 0
              ? Math.round(
                  scored.reduce((sum, doc) => sum + (doc.competitivenessScore || 0), 0) /
                    scored.length
                )
              : 0,
          totalWords: docs.reduce((sum, doc) => sum + wordCount(doc.content), 0),
          recentlyEdited: docs.filter((doc) => new Date(doc.updatedAt).getTime() > oneWeekAgo).length,
        };
      },

      reset: () =>
        set({
          documents: [],
          coachThreads: {},
          isSyncing: false,
          syncError: null,
        }),
    }),
    {
      name: "olcan-forge",
      partialize: (state) => ({
        documents: state.documents,
        coachThreads: state.coachThreads,
      }),
    }
  )
);
