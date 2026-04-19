import { create } from "zustand";
import { persist } from "zustand/middleware";
import { forgeApi } from "@/lib/api";
import { eventBus } from "@/lib/event-bus";
import { getTemplateForType } from "@/lib/document-templates";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function genLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type DocType =
  | "cv"
  | "resume"
  | "motivation_letter"
  | "cover_letter"
  | "statement_of_purpose"
  | "personal_statement"
  | "research_proposal"
  | "scholarship_essay"
  | "recommendation"
  | "transcript"
  | "language_cert"
  | "portfolio"
  | "writing_sample"
  | "other";

export interface DocVersion {
  id: string;
  content: string;
  savedAt: string;
  wordCount: number;
  label?: string;
}

/** Local writing-coach analysis (forge-lab); optional until user runs analyze. */
export interface ForgeDocAnalysisMetrics {
  score: number;
  issues: Array<{ type: string; severity: string; message: string }>;
  suggestions: string[];
  wordCount: number;
  readabilityScore: number;
}

/** A named section within a structured document. */
export interface ForgeSection {
  id: string;
  title: string;
  content: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Target word-count range for this section. */
  wordCountTarget?: { min: number; max: number };
  /** Contextual tips shown in the section editor. */
  tips?: string[];
  /** Whether this section is collapsed in the UI. */
  collapsed?: boolean;
  /** Profile intake field key that can prefill this section. */
  profileKey?: string;
  /** Whether this section is required for the document. */
  required?: boolean;
}

export interface ForgeDocument {
  id: string;
  title: string;
  type: DocType;
  content: string;
  /** Structured sections. When present the editor renders per-section panels. */
  sections?: ForgeSection[];
  /** Whether the document is in section-editing mode. */
  sectionMode?: boolean;
  versions: DocVersion[];
  createdAt: string;
  updatedAt: string;
  competitivenessScore: number | null;
  /** Writing-lab coach panel (mock analysis until backend polish is wired). */
  metrics?: ForgeDocAnalysisMetrics | null;
  targetProgram?: string;
  language: string;
  /** Route this document is bound to (null = universal). */
  routeId?: string | null;
  /** 'universal' docs appear in all dossiers; 'route' docs are contextual. */
  scope?: "universal" | "route";
  /** Opportunity binding - primary opportunity this asset was created for */
  primaryOpportunityId?: string | null;
  /** Opportunity binding - all opportunities this asset serves */
  opportunityIds?: string[];
  /** Readiness level for submission */
  readinessLevel?: "draft" | "review" | "export_ready" | "submitted";
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

interface RemoteDocument {
  id: string;
  title: string;
  document_type: string;
  content: string;
  status: string;
  ats_score?: number | null;
  min_character_count?: number | null;
  max_character_count?: number | null;
  target_word_count?: number | null;
  current_word_count?: number;
  current_character_count?: number;
  route_id?: string | null;
  scope?: string;
  created_at: string;
  updated_at: string;
}

interface RemoteDocumentListResponse {
  documents: RemoteDocument[];
  total: number;
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
    routeId?: string;
    scope?: "universal" | "route";
    primaryOpportunityId?: string;
    opportunityIds?: string[];
  }) => Promise<string | null>;
  updateContent: (docId: string, content: string) => Promise<void>;
  updateTitle: (docId: string, title: string) => Promise<void>;
  updateType: (docId: string, type: DocType) => Promise<void>;
  updateReadinessLevel: (docId: string, level: "draft" | "review" | "export_ready" | "submitted") => Promise<void>;
  bindToOpportunity: (docId: string, opportunityId: string, isPrimary?: boolean) => Promise<void>;
  unbindFromOpportunity: (docId: string, opportunityId: string) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
  saveVersion: (docId: string, label?: string) => Promise<void>;
  setCoachThread: (docId: string, messages: CoachMessage[]) => void;
  appendCoachMessage: (docId: string, message: Omit<CoachMessage, "id" | "createdAt">) => void;
  clearCoachThread: (docId: string) => void;
  getDocById: (id: string) => ForgeDocument | undefined;
  getDocsByType: (type: DocType) => ForgeDocument[];
  getDocsByOpportunity: (opportunityId: string) => ForgeDocument[];
  getStats: () => { total: number; avgScore: number; totalWords: number; recentlyEdited: number };
  analyzeDocument: (docId: string) => Promise<void>;
  /** Initialise structured sections from the document-type template. */
  initializeSections: (docId: string) => void;
  /** Update a single section's content. Also assembles full `content`. */
  updateSection: (docId: string, sectionId: string, content: string) => void;
  /** Toggle collapsed state of a section. */
  toggleSectionCollapsed: (docId: string, sectionId: string) => void;
  /** Switch between section-editing and plain textarea mode. */
  toggleSectionMode: (docId: string) => void;
  /** Add a custom section at the end. */
  addCustomSection: (docId: string, title: string) => void;
  /** Remove a section (only non-required custom ones). */
  removeSection: (docId: string, sectionId: string) => void;
  /** Reorder sections. */
  reorderSections: (docId: string, from: number, to: number) => void;
  reset: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function generateForgeAnalysisMetrics(content: string): ForgeDocAnalysisMetrics {
  const wc = wordCount(content);
  const sentences = Math.max(1, content.split(/[.!?]+/).filter(Boolean).length);
  const avgWordsPerSentence = wc / sentences;

  const issues: ForgeDocAnalysisMetrics["issues"] = [];
  const suggestions: string[] = [];

  if (avgWordsPerSentence > 20) {
    issues.push({
      type: "sentence_length",
      severity: "medium",
      message: "Sentenças muito longas. Considere dividir para melhor legibilidade.",
    });
  }

  if (wc < 200) {
    issues.push({
      type: "length",
      severity: "high",
      message: "Texto muito curto. Adicione mais detalhes e desenvolvimento.",
    });
  }

  if (content.toLowerCase().split(/\s+/).filter((w) => w.length > 12).length > 5) {
    issues.push({
      type: "word_complexity",
      severity: "low",
      message: "Considere substituir palavras complexas por alternativas mais simples.",
    });
  }

  suggestions.push("Adicione exemplos concretos para fortalecer seus argumentos.");
  suggestions.push("Revise a estrutura para garantir fluxo lógico.");
  suggestions.push("Verifique a consistência do tom ao longo do texto.");

  const readabilityScore = Math.max(
    0,
    Math.min(100, 100 - (avgWordsPerSentence - 15) * 2 - (wc < 200 ? 20 : 0))
  );
  const score = Math.max(0, Math.min(100, readabilityScore - issues.length * 5));

  return {
    score,
    issues,
    suggestions,
    wordCount: wc,
    readabilityScore,
  };
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
  cv: "Currículo (CV)",
  resume: "Resume",
  motivation_letter: "Carta de Motivação",
  cover_letter: "Carta de Apresentação",
  statement_of_purpose: "Statement of Purpose",
  personal_statement: "Personal Statement",
  research_proposal: "Proposta de Pesquisa",
  scholarship_essay: "Essay de Bolsa",
  recommendation: "Carta de Recomendação",
  transcript: "Transcrição Escolar",
  language_cert: "Certificação de Idiomas",
  portfolio: "Portfólio",
  writing_sample: "Amostra de Escrita",
  other: "Outro",
};

const LOCAL_TO_REMOTE_TYPE: Record<DocType, string> = {
  cv: "cv",
  resume: "resume",
  motivation_letter: "motivation_letter",
  cover_letter: "cover_letter",
  statement_of_purpose: "statement_of_purpose",
  personal_statement: "personal_statement",
  research_proposal: "research_proposal",
  scholarship_essay: "scholarship_essay",
  recommendation: "recommendation",
  transcript: "transcript",
  language_cert: "language_cert",
  portfolio: "portfolio",
  writing_sample: "writing_sample",
  other: "other",
};

const REMOTE_TO_LOCAL_TYPE: Record<string, DocType> = {
  cv: "cv",
  resume: "resume",
  cv_summary: "cv",
  motivation_letter: "motivation_letter",
  cover_letter: "cover_letter",
  statement_of_purpose: "statement_of_purpose",
  personal_statement: "personal_statement",
  research_proposal: "research_proposal",
  scholarship_essay: "scholarship_essay",
  recommendation: "recommendation",
  transcript: "transcript",
  language_cert: "language_cert",
  portfolio: "portfolio",
  writing_sample: "writing_sample",
  other: "other",
};

export { DOC_TYPE_LABELS };

function normalizeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function mapDocument(remote: RemoteDocument): ForgeDocument {
  const content = remote.content || "";
  return {
    id: String(remote.id),
    title: remote.title,
    type: REMOTE_TO_LOCAL_TYPE[remote.document_type] || "other",
    content,
    versions: [],
    createdAt: normalizeDate(remote.created_at),
    updatedAt: normalizeDate(remote.updated_at),
    competitivenessScore:
      remote.ats_score != null ? Math.round(remote.ats_score) : fallbackScore(content),
    language: "pt",
    routeId: remote.route_id ?? null,
    scope: (remote.scope === "route" ? "route" : "universal") as "universal" | "route",
    constraints:
      remote.min_character_count || remote.max_character_count || remote.target_word_count
        ? {
            minWords: remote.min_character_count
              ? Math.round(remote.min_character_count / 5)
              : undefined,
            maxWords: remote.max_character_count
              ? Math.round(remote.max_character_count / 5)
              : undefined,
          }
        : undefined,
  };
}

async function loadDocuments(previous: ForgeDocument[]): Promise<ForgeDocument[]> {
  const { data } = await forgeApi.getDocuments();
  const list = (data as RemoteDocumentListResponse)?.documents || [];
  return list.map((item) => {
    const existing = previous.find((d) => d.id === String(item.id));
    const mapped = mapDocument(item);
    // preserve local versions history
    if (existing?.versions?.length) mapped.versions = existing.versions;
    return mapped;
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
        if (IS_DEMO) return;
        set({ isSyncing: true, syncError: null });
        try {
          const documents = await loadDocuments(get().documents);
          set({ documents, isSyncing: false, syncError: null });
        } catch {
          set({
            isSyncing: false,
            syncError: "Não foi possível sincronizar os documentos do Forge com a API.",
          });
        }
      },

      createDocument: async ({ title, type, targetProgram, language, routeId, scope, primaryOpportunityId, opportunityIds }) => {
        // Demo mode: create locally without API
        if (IS_DEMO) {
          const localDoc: ForgeDocument = {
            id: genLocalId(),
            title,
            type,
            content: "",
            versions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            competitivenessScore: null,
            targetProgram: targetProgram || undefined,
            language: language || "pt",
            routeId: routeId ?? null,
            scope: scope ?? "universal",
            primaryOpportunityId: primaryOpportunityId ?? null,
            opportunityIds: opportunityIds || [],
            readinessLevel: "draft",
          };
          set((state) => ({ documents: [localDoc, ...state.documents] }));
          return localDoc.id;
        }

        try {
          const response = await forgeApi.createDocument({
            title,
            document_type: LOCAL_TO_REMOTE_TYPE[type] || "other",
            content: "",
            ...(routeId ? { route_id: routeId } : {}),
            scope: scope ?? "universal",
          });
          const remote = response.data as RemoteDocument;
          const mapped = mapDocument(remote);
          mapped.language = language || "pt";
          if (targetProgram) mapped.targetProgram = targetProgram;
          // Add opportunity binding (local-only until backend supports it)
          mapped.primaryOpportunityId = primaryOpportunityId ?? null;
          mapped.opportunityIds = opportunityIds || [];
          mapped.readinessLevel = "draft";

          set((state) => ({
            documents: [mapped, ...state.documents.filter((doc) => doc.id !== mapped.id)],
            syncError: null,
          }));
          // Emit product event for gamification
          eventBus.emit("document.created", { docId: mapped.id, docType: type });
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

        if (IS_DEMO) return;

        try {
          await forgeApi.updateContent(docId, content);
          const detailResponse = await forgeApi.getDocument(docId);
          const mapped = mapDocument(detailResponse.data as RemoteDocument);
          mapped.content = content; // keep local content (API may lag)
          set((state) => ({
            documents: state.documents.map((doc) => (doc.id === docId ? { ...mapped, versions: doc.versions } : doc)),
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

        if (IS_DEMO) return;

        try {
          await forgeApi.updateDocument(docId, { title });
        } catch {
          set({ documents: previous, syncError: "Não foi possível atualizar o título do documento." });
        }
      },

      updateType: async (docId, type) => {
        const previous = get().documents;
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, type, updatedAt: new Date().toISOString() } : doc
          ),
        }));

        if (IS_DEMO) return;

        try {
          await forgeApi.updateDocument(docId, { document_type: LOCAL_TO_REMOTE_TYPE[type] || "other" });
        } catch {
          set({ documents: previous, syncError: "Não foi possível atualizar o tipo do documento." });
        }
      },

      deleteDocument: async (docId) => {
        const previous = get().documents;
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== docId),
        }));

        if (IS_DEMO) return;

        try {
          await forgeApi.deleteDocument(docId);
        } catch {
          set({ documents: previous, syncError: "Não foi possível remover o documento." });
        }
      },

      saveVersion: async (docId, label) => {
        const doc = get().documents.find((item) => item.id === docId);
        if (!doc || !doc.content.trim()) return;

        const newVersion: DocVersion = {
          id: genLocalId(),
          content: doc.content,
          savedAt: new Date().toISOString(),
          wordCount: wordCount(doc.content),
          label: label || "Versão salva manualmente",
        };

        // Always save locally
        set((state) => ({
          documents: state.documents.map((item) =>
            item.id === docId
              ? { ...item, versions: [...item.versions, newVersion] }
              : item
          ),
        }));

        // Emit version saved event
        eventBus.emit("document.version_saved", { docId, label: label || "manual" });

        if (IS_DEMO) return;

        try {
          await forgeApi.createVersion(docId, {
            content: doc.content,
            change_summary: label || "Versão salva manualmente",
          });
        } catch {
          // Version was saved locally — silent fail on API
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

      getDocsByOpportunity: (opportunityId) =>
        get().documents.filter(
          (doc) =>
            doc.primaryOpportunityId === opportunityId ||
            doc.opportunityIds?.includes(opportunityId)
        ),

      updateReadinessLevel: async (docId, level) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, readinessLevel: level, updatedAt: new Date().toISOString() } : doc
          ),
        }));
        // TODO: Sync to backend when API supports readiness_level field
      },

      bindToOpportunity: async (docId, opportunityId, isPrimary = false) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            
            const opportunityIds = doc.opportunityIds || [];
            if (!opportunityIds.includes(opportunityId)) {
              opportunityIds.push(opportunityId);
            }
            
            return {
              ...doc,
              opportunityIds,
              primaryOpportunityId: isPrimary ? opportunityId : doc.primaryOpportunityId,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        // TODO: Sync to backend when API supports opportunity binding
      },

      unbindFromOpportunity: async (docId, opportunityId) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            
            const opportunityIds = (doc.opportunityIds || []).filter((id) => id !== opportunityId);
            const primaryOpportunityId =
              doc.primaryOpportunityId === opportunityId ? null : doc.primaryOpportunityId;
            
            return {
              ...doc,
              opportunityIds,
              primaryOpportunityId,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        // TODO: Sync to backend when API supports opportunity binding
      },

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

      analyzeDocument: async (docId) => {
        const doc = get().documents.find((d) => d.id === docId);
        if (!doc) return;

        if (!IS_DEMO) {
          try {
            await forgeApi.analyzeDocument(docId);
          } catch {
            // fall through to local heuristic so the lab stays usable
          }
        }

        await new Promise((r) => setTimeout(r, IS_DEMO ? 0 : 800));
        const metrics = generateForgeAnalysisMetrics(doc.content);

        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === docId ? { ...d, metrics, competitivenessScore: metrics.score } : d
          ),
        }));
      },

      // ─── Section-based editing ──────────────────────────────────────────────

      initializeSections: (docId) => {
        const doc = get().documents.find((d) => d.id === docId);
        if (!doc) return;
        const template = getTemplateForType(doc.type);
        if (!template) return;
        const sections: ForgeSection[] = template.sections.map((s) => ({
          id: s.id,
          title: s.title,
          content: "",
          placeholder: s.example || `Escreva aqui sobre: ${s.description}`,
          wordCountTarget: s.wordCount
            ? { min: s.wordCount.min, max: s.wordCount.max }
            : undefined,
          tips: template.tips.slice(0, 3),
          collapsed: false,
          required: s.required,
          profileKey: s.id,
        }));
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === docId
              ? { ...d, sections, sectionMode: true, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      updateSection: (docId, sectionId, content) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId || !d.sections) return d;
            const sections = d.sections.map((sec) =>
              sec.id === sectionId ? { ...sec, content } : sec
            );
            // Reassemble full content from sections for backward compat
            const assembled = sections
              .filter((sec) => sec.content.trim())
              .map((sec) => `## ${sec.title}\n\n${sec.content}`)
              .join("\n\n");
            return { ...d, sections, content: assembled, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      toggleSectionCollapsed: (docId, sectionId) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId || !d.sections) return d;
            return {
              ...d,
              sections: d.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, collapsed: !sec.collapsed } : sec
              ),
            };
          }),
        }));
      },

      toggleSectionMode: (docId) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d;
            return { ...d, sectionMode: !d.sectionMode };
          }),
        }));
      },

      addCustomSection: (docId, title) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d;
            const newSection: ForgeSection = {
              id: `custom-${Date.now()}`,
              title,
              content: "",
              placeholder: `Escreva o conteúdo de "${title}"...`,
              collapsed: false,
              required: false,
            };
            return {
              ...d,
              sections: [...(d.sections || []), newSection],
              sectionMode: true,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeSection: (docId, sectionId) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId || !d.sections) return d;
            const sections = d.sections.filter(
              (sec) => sec.id !== sectionId || sec.required
            );
            return { ...d, sections, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      reorderSections: (docId, from, to) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId || !d.sections) return d;
            const sections = [...d.sections];
            const [moved] = sections.splice(from, 1);
            sections.splice(to, 0, moved);
            return { ...d, sections, updatedAt: new Date().toISOString() };
          }),
        }));
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
