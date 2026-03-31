import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applicationsApi } from "@/lib/api";

export type AppStatus = "draft" | "in_progress" | "submitted" | "accepted" | "rejected" | "waitlisted";

export interface AppDocument {
  id: string;
  name: string;
  status: "ready" | "pending" | "in_progress";
  forgeLink?: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  date: string;
  done: boolean;
}

export interface UserApplication {
  id: string;
  program: string;
  type: string;
  country: string;
  deadline: string;
  status: AppStatus;
  match: number;
  documents: AppDocument[];
  timeline: TimelineEvent[];
  notes?: string;
  createdAt: string;
  opportunityId?: string;
  priority?: string;
  checklistProgress?: Record<string, boolean>;
}

interface RemoteOpportunity {
  id: string;
  title: string;
  opportunity_type: string;
  organization_name?: string | null;
  organization_country?: string | null;
  location_country?: string | null;
  application_deadline?: string | null;
  required_documents?: string[];
}

interface RemoteApplicationDocument {
  id: string;
  document_type: string;
  narrative_id?: string | null;
  is_submitted: boolean;
}

interface RemoteApplication {
  id: string;
  opportunity_id: string;
  status: string;
  priority: string;
  completion_percentage: number;
  notes?: string | null;
  checklist_progress?: Record<string, boolean>;
  started_at?: string | null;
  submitted_at?: string | null;
  response_received_at?: string | null;
  outcome?: string | null;
  created_at: string;
  updated_at?: string;
  opportunity?: RemoteOpportunity | null;
  documents?: RemoteApplicationDocument[];
}

interface ApplicationState {
  applications: UserApplication[];
  isSyncing: boolean;
  syncError: string | null;
  syncFromApi: () => Promise<void>;
  addApplication: (app: UserApplication) => Promise<UserApplication | null>;
  removeApplication: (id: string) => Promise<void>;
  setStatus: (id: string, status: AppStatus) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Pick<UserApplication, "program" | "status" | "notes">>) => Promise<void>;
  toggleDocument: (appId: string, docId: string) => Promise<void>;
  toggleTimelineEvent: (appId: string, eventId: string) => void;
  getById: (id: string) => UserApplication | undefined;
  getUpcomingDeadlines: (days: number) => UserApplication[];
  getStats: () => { total: number; submitted: number; drafts: number; urgentCount: number };
  reset: () => void;
}

const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  scholarship: "Bolsa",
  job: "Emprego",
  research_position: "Pesquisa",
  exchange_program: "Intercâmbio",
  grant: "Bolsa",
  fellowship: "Bolsa",
  internship: "Estágio",
  conference: "Conferência",
};

const LOCAL_TYPE_TO_REMOTE: Record<string, string> = {
  Mestrado: "exchange_program",
  Doutorado: "research_position",
  Bolsa: "scholarship",
  Emprego: "job",
  Estágio: "internship",
};

const DOCUMENT_LABELS: Record<string, string> = {
  motivation_letter: "Carta de Motivação",
  cv: "CV Acadêmico",
  transcript: "Histórico Escolar",
  recommendation_letter: "Carta de Recomendação",
  language_certificate: "Certificado de Proficiência",
  portfolio: "Portfolio / GitHub",
  research_proposal: "Proposta de Pesquisa",
  other: "Outro Documento",
};

const DOCUMENT_NAME_TO_REMOTE: Record<string, string> = {
  "Carta de Motivação": "motivation_letter",
  "Carta de motivação": "motivation_letter",
  "CV Acadêmico": "cv",
  "CV / Résumé": "cv",
  "CV Tech": "cv",
  "Histórico Escolar": "transcript",
  "Carta de Recomendação": "recommendation_letter",
  "Carta de Recomendação #1": "recommendation_letter",
  "Carta de Recomendação #2": "recommendation_letter",
  "Certificado de Proficiência": "language_certificate",
  "Comprovante de Proficiência": "language_certificate",
  "Portfolio / GitHub": "portfolio",
  "Proposta de Pesquisa": "research_proposal",
  "Plano de Estudos": "other",
  "Formulário da Bolsa": "other",
  "Formulário DAAD preenchido": "other",
  "Cover Letter": "motivation_letter",
  Referências: "other",
};

const SEED_APPS: UserApplication[] = [];

function normalizeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function makeChecklistKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function mapRemoteStatus(status: string, outcome?: string | null): AppStatus {
  switch (status) {
    case "in_progress":
      return "in_progress";
    case "submitted":
    case "under_review":
      return "submitted";
    case "accepted":
      return "accepted";
    case "rejected":
      return "rejected";
    case "withdrawn":
      return "waitlisted";
    case "watching":
    case "planned":
    default:
      return outcome === "waitlisted" ? "waitlisted" : "draft";
  }
}

function mapLocalStatus(status: AppStatus): string {
  switch (status) {
    case "in_progress":
      return "in_progress";
    case "submitted":
      return "submitted";
    case "accepted":
      return "accepted";
    case "rejected":
      return "rejected";
    case "waitlisted":
      return "withdrawn";
    case "draft":
    default:
      return "planned";
  }
}

function parseProgram(value: string): { title: string; organizationName?: string } {
  const [title, organizationName] = value.split("—").map((part) => part.trim()).filter(Boolean);
  return {
    title: title || value.trim(),
    organizationName,
  };
}

function getDocumentLabel(value: string): string {
  return DOCUMENT_LABELS[value] || value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function buildDocuments(app: RemoteApplication): AppDocument[] {
  const checklist = app.checklist_progress || {};
  const requiredDocumentKeys = (app.opportunity?.required_documents || []).map((item) => item || "other");
  const actualDocumentKeys = (app.documents || []).map((item) => item.document_type || "other");
  const allKeys = Array.from(new Set([...requiredDocumentKeys, ...actualDocumentKeys, ...Object.keys(checklist)]));

  return allKeys.map((key) => {
    const normalizedKey = makeChecklistKey(key);
    const remoteDocument = (app.documents || []).find((item) => item.document_type === key);
    const done = checklist[key] || checklist[normalizedKey] || remoteDocument?.is_submitted || false;
    const hasProgress = Boolean(remoteDocument) || Boolean(checklist[key] === false || checklist[normalizedKey] === false);

    return {
      id: normalizedKey,
      name: getDocumentLabel(key),
      status: done ? "ready" : hasProgress ? "in_progress" : "pending",
      forgeLink: remoteDocument?.narrative_id ? `/forge/${remoteDocument.narrative_id}` : undefined,
    };
  });
}

function buildTimeline(app: RemoteApplication, deadline: string): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "created",
      event: "Candidatura criada",
      date: normalizeDate(app.created_at),
      done: true,
    },
  ];

  if (app.started_at || app.status === "in_progress" || app.status === "submitted" || app.status === "under_review" || app.status === "accepted" || app.status === "rejected") {
    events.push({
      id: "started",
      event: "Documentos em preparação",
      date: normalizeDate(app.started_at || app.updated_at || app.created_at),
      done: true,
    });
  }

  events.push({
    id: "deadline",
    event: "Deadline de submissão",
    date: deadline,
    done: false,
  });

  if (app.submitted_at || app.status === "submitted" || app.status === "under_review" || app.status === "accepted" || app.status === "rejected") {
    events.push({
      id: "submitted",
      event: "Candidatura enviada",
      date: normalizeDate(app.submitted_at || app.updated_at || app.created_at),
      done: true,
    });
  }

  if (app.response_received_at || app.outcome) {
    events.push({
      id: "outcome",
      event: "Resultado recebido",
      date: normalizeDate(app.response_received_at || app.updated_at || app.created_at),
      done: true,
    });
  }

  return events;
}

function mapRemoteApplication(app: RemoteApplication): UserApplication {
  const deadline = normalizeDate(app.opportunity?.application_deadline);
  return {
    id: app.id,
    opportunityId: app.opportunity_id,
    program: app.opportunity?.title || "Oportunidade Compass",
    type: OPPORTUNITY_TYPE_LABELS[app.opportunity?.opportunity_type || ""] || "Oportunidade",
    country: app.opportunity?.location_country || app.opportunity?.organization_country || "—",
    deadline,
    status: mapRemoteStatus(app.status, app.outcome),
    match: app.completion_percentage || 0,
    documents: buildDocuments(app),
    timeline: buildTimeline(app, deadline),
    notes: app.notes || undefined,
    createdAt: normalizeDate(app.created_at),
    priority: app.priority,
    checklistProgress: app.checklist_progress || {},
  };
}

async function loadDetailedApplications(): Promise<UserApplication[]> {
  const { data } = await applicationsApi.getAll();
  const items: RemoteApplication[] = data?.items || [];

  const detailedResults = await Promise.allSettled(
    items.map(async (item) => {
      const detailResponse = await applicationsApi.get(item.id);
      return mapRemoteApplication(detailResponse.data as RemoteApplication);
    })
  );

  return detailedResults.flatMap((result, index) => {
    if (result.status === "fulfilled") return [result.value];
    return [mapRemoteApplication(items[index])];
  });
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: SEED_APPS,
      isSyncing: false,
      syncError: null,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const applications = await loadDetailedApplications();
          set({ applications, isSyncing: false, syncError: null });
        } catch {
          set({
            isSyncing: false,
            syncError: "Não foi possível sincronizar as candidaturas com a API.",
          });
        }
      },

      addApplication: async (app) => {
        try {
          const parsed = parseProgram(app.program);
          const opportunityPayload = {
            title: parsed.title,
            description: app.notes || "Oportunidade registrada pelo usuário no workspace Compass.",
            opportunity_type: LOCAL_TYPE_TO_REMOTE[app.type] || "scholarship",
            organization_name: parsed.organizationName || null,
            organization_country: app.country || null,
            location_country: app.country || null,
            application_deadline: app.deadline ? new Date(`${app.deadline}T12:00:00Z`).toISOString() : null,
            required_documents: app.documents
              .map((doc) => DOCUMENT_NAME_TO_REMOTE[doc.name] || "other"),
          };

          const opportunityResponse = app.opportunityId
            ? await applicationsApi.getOpportunity(app.opportunityId)
            : await applicationsApi.createOpportunity(opportunityPayload);
          const opportunity = opportunityResponse.data as RemoteOpportunity;

          const createResponse = await applicationsApi.create({
            opportunity_id: opportunity.id,
            status: mapLocalStatus(app.status),
            priority: app.priority || "medium",
            notes: app.notes,
          });

          const createdApplication = createResponse.data as RemoteApplication;
          const checklistProgress = Object.fromEntries(
            app.documents.map((doc) => [
              DOCUMENT_NAME_TO_REMOTE[doc.name] || makeChecklistKey(doc.name),
              doc.status === "ready",
            ])
          );

          let finalRemoteApp = createdApplication;
          if (Object.keys(checklistProgress).length > 0) {
            const updated = await applicationsApi.update(createdApplication.id, {
              checklist_progress: checklistProgress,
            });
            finalRemoteApp = updated.data as RemoteApplication;
          }

          const detail = await applicationsApi.get(finalRemoteApp.id);
          const mapped = mapRemoteApplication(detail.data as RemoteApplication);
          set((state) => ({
            applications: [mapped, ...state.applications.filter((item) => item.id !== mapped.id)],
            syncError: null,
          }));
          return mapped;
        } catch {
          set({ syncError: "Não foi possível criar a candidatura na API." });
          return null;
        }
      },

      removeApplication: async (id) => {
        const previous = get().applications;
        set((state) => ({ applications: state.applications.filter((app) => app.id !== id) }));
        try {
          await applicationsApi.remove(id);
        } catch {
          set({ applications: previous, syncError: "Não foi possível remover a candidatura." });
        }
      },

      setStatus: async (id, status) => {
        const previous = get().applications;
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        }));

        try {
          if (status === "submitted") {
            const response = await applicationsApi.submit(id);
            const mapped = mapRemoteApplication(response.data as RemoteApplication);
            set((state) => ({
              applications: state.applications.map((app) => (app.id === id ? mapped : app)),
              syncError: null,
            }));
            return;
          }

          if (status === "accepted" || status === "rejected") {
            const response = await applicationsApi.update(id, { status: mapLocalStatus(status) });
            const mapped = mapRemoteApplication(response.data as RemoteApplication);
            set((state) => ({
              applications: state.applications.map((app) => (app.id === id ? mapped : app)),
              syncError: null,
            }));
            return;
          }

          await applicationsApi.update(id, { status: mapLocalStatus(status) });
        } catch {
          set({ applications: previous, syncError: "Não foi possível atualizar o status da candidatura." });
        }
      },

      updateApplication: async (id, updates) => {
        const previous = get().applications;
        const current = previous.find((app) => app.id === id);
        if (!current) return;

        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          ),
        }));

        try {
          if (updates.program && current.opportunityId) {
            await applicationsApi.updateOpportunity(current.opportunityId, {
              title: parseProgram(updates.program).title,
              organization_name: parseProgram(updates.program).organizationName || null,
            });
          }

          const response = await applicationsApi.update(id, {
            status: updates.status ? mapLocalStatus(updates.status) : undefined,
            notes: updates.notes,
          });
          const detail = await applicationsApi.get(response.data.id);
          const mapped = mapRemoteApplication(detail.data as RemoteApplication);
          set((state) => ({
            applications: state.applications.map((app) => (app.id === id ? mapped : app)),
            syncError: null,
          }));
        } catch {
          set({ applications: previous, syncError: "Não foi possível salvar as alterações da candidatura." });
        }
      },

      toggleDocument: async (appId, docId) => {
        const app = get().applications.find((item) => item.id === appId);
        if (!app) return;

        const nextApplications: UserApplication[] = get().applications.map((item) => {
          if (item.id !== appId) return item;
          return {
            ...item,
            documents: item.documents.map((doc) => {
              if (doc.id !== docId) return doc;
              const nextStatus: AppDocument["status"] =
                doc.status === "ready" ? "pending" : doc.status === "in_progress" ? "ready" : "in_progress";
              return { ...doc, status: nextStatus };
            }),
          };
        });

        set({ applications: nextApplications });

        const target = nextApplications.find((item) => item.id === appId);
        if (!target) return;

        const checklistProgress = Object.fromEntries(
          target.documents.map((doc) => [doc.id, doc.status === "ready"])
        );

        try {
          const response = await applicationsApi.update(appId, { checklist_progress: checklistProgress });
          const detail = await applicationsApi.get(response.data.id);
          const mapped = mapRemoteApplication(detail.data as RemoteApplication);
          set((state) => ({
            applications: state.applications.map((item) => (item.id === appId ? mapped : item)),
            syncError: null,
          }));
        } catch {
          set({
            applications: get().applications.map((item) =>
              item.id === appId ? app : item
            ),
            syncError: "Não foi possível atualizar o checklist documental.",
          });
        }
      },

      toggleTimelineEvent: (appId, eventId) =>
        set((state) => ({
          applications: state.applications.map((app) => {
            if (app.id !== appId) return app;
            return {
              ...app,
              timeline: app.timeline.map((event) =>
                event.id === eventId ? { ...event, done: !event.done } : event
              ),
            };
          }),
        })),

      getById: (id) => get().applications.find((app) => app.id === id),

      getUpcomingDeadlines: (days) => {
        const cutoff = Date.now() + days * 86400000;
        return get().applications.filter(
          (app) =>
            app.status !== "submitted" &&
            app.status !== "accepted" &&
            app.status !== "rejected" &&
            new Date(app.deadline).getTime() <= cutoff
        );
      },

      getStats: () => {
        const applications = get().applications;
        return {
          total: applications.length,
          submitted: applications.filter((app) => app.status === "submitted").length,
          drafts: applications.filter((app) => app.status === "draft").length,
          urgentCount: applications.filter(
            (app) =>
              app.status !== "submitted" &&
              app.status !== "accepted" &&
              app.status !== "rejected" &&
              new Date(app.deadline).getTime() < Date.now() + 14 * 86400000
          ).length,
        };
      },

      reset: () =>
        set({
          applications: SEED_APPS,
          isSyncing: false,
          syncError: null,
        }),
    }),
    { name: "olcan-applications" }
  )
);
