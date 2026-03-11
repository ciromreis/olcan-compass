import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

interface ApplicationState {
  applications: UserApplication[];
  addApplication: (app: UserApplication) => void;
  removeApplication: (id: string) => void;
  setStatus: (id: string, status: AppStatus) => void;
  updateApplication: (id: string, updates: Partial<Pick<UserApplication, "program" | "status" | "notes">>) => void;
  toggleDocument: (appId: string, docId: string) => void;
  toggleTimelineEvent: (appId: string, eventId: string) => void;
  getById: (id: string) => UserApplication | undefined;
  getUpcomingDeadlines: (days: number) => UserApplication[];
  getStats: () => { total: number; submitted: number; drafts: number; urgentCount: number };
  reset: () => void;
}

const SEED_APPS: UserApplication[] = [
  {
    id: "a1",
    program: "MSc Computer Science — TU Berlin",
    type: "Mestrado",
    country: "Alemanha",
    deadline: "2025-05-01",
    status: "in_progress",
    match: 85,
    createdAt: "2025-02-10",
    documents: [
      { id: "d1", name: "Carta de Motivação", status: "ready", forgeLink: "/forge/d1" },
      { id: "d2", name: "CV Acadêmico", status: "ready", forgeLink: "/forge/d2" },
      { id: "d3", name: "Certificado de Proficiência (IELTS)", status: "ready" },
      { id: "d4", name: "Carta de Recomendação #1", status: "pending" },
      { id: "d5", name: "Carta de Recomendação #2", status: "pending" },
    ],
    timeline: [
      { id: "te1", event: "Candidatura criada", date: "2025-02-10", done: true },
      { id: "te2", event: "Documentos em preparação", date: "2025-02-15", done: true },
      { id: "te3", event: "Carta de motivação finalizada", date: "2025-03-01", done: true },
      { id: "te4", event: "Deadline de submissão", date: "2025-05-01", done: false },
      { id: "te5", event: "Resultado esperado", date: "2025-06-15", done: false },
    ],
  },
  {
    id: "a2",
    program: "DAAD Scholarship 2025/26",
    type: "Bolsa",
    country: "Alemanha",
    deadline: "2025-05-15",
    status: "draft",
    match: 78,
    createdAt: "2025-02-20",
    documents: [
      { id: "d6", name: "Formulário DAAD preenchido", status: "in_progress" },
      { id: "d7", name: "Plano de estudos", status: "pending" },
      { id: "d8", name: "Carta de motivação DAAD", status: "pending", forgeLink: "/forge/d3" },
      { id: "d9", name: "Comprovante de proficiência", status: "ready" },
    ],
    timeline: [
      { id: "te6", event: "Pesquisa sobre a bolsa", date: "2025-02-20", done: true },
      { id: "te7", event: "Formulário DAAD", date: "2025-03-15", done: false },
      { id: "te8", event: "Deadline de submissão", date: "2025-05-15", done: false },
      { id: "te9", event: "Resultado", date: "2025-07-01", done: false },
    ],
  },
  {
    id: "a3",
    program: "Software Engineer — Klarna (Stockholm)",
    type: "Emprego",
    country: "Suécia",
    deadline: "2025-04-10",
    status: "submitted",
    match: 72,
    createdAt: "2025-01-20",
    documents: [
      { id: "d10", name: "CV Tech", status: "ready", forgeLink: "/forge/d4" },
      { id: "d11", name: "Cover Letter", status: "ready", forgeLink: "/forge/d5" },
      { id: "d12", name: "Portfolio / GitHub", status: "ready" },
      { id: "d13", name: "Referências profissionais", status: "ready" },
    ],
    timeline: [
      { id: "te10", event: "Candidatura enviada", date: "2025-03-01", done: true },
      { id: "te11", event: "Screening call", date: "2025-03-15", done: true },
      { id: "te12", event: "Technical interview", date: "2025-03-28", done: false },
      { id: "te13", event: "Resultado final", date: "2025-04-10", done: false },
    ],
  },
];

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: SEED_APPS,

      addApplication: (app) =>
        set((state) => ({ applications: [...state.applications, app] })),

      removeApplication: (id) =>
        set((state) => ({ applications: state.applications.filter((a) => a.id !== id) })),

      setStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      updateApplication: (id, updates) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      toggleDocument: (appId, docId) =>
        set((state) => ({
          applications: state.applications.map((app) => {
            if (app.id !== appId) return app;
            return {
              ...app,
              documents: app.documents.map((d) => {
                if (d.id !== docId) return d;
                const next = d.status === "ready" ? "pending" : d.status === "in_progress" ? "ready" : "in_progress";
                return { ...d, status: next as AppDocument["status"] };
              }),
            };
          }),
        })),

      toggleTimelineEvent: (appId, eventId) =>
        set((state) => ({
          applications: state.applications.map((app) => {
            if (app.id !== appId) return app;
            return {
              ...app,
              timeline: app.timeline.map((t) =>
                t.id === eventId ? { ...t, done: !t.done } : t
              ),
            };
          }),
        })),

      getById: (id) => get().applications.find((a) => a.id === id),

      getUpcomingDeadlines: (days) => {
        const cutoff = Date.now() + days * 86400000;
        return get().applications.filter(
          (a) => a.status !== "submitted" && a.status !== "accepted" && a.status !== "rejected" &&
            new Date(a.deadline).getTime() <= cutoff
        );
      },

      getStats: () => {
        const apps = get().applications;
        return {
          total: apps.length,
          submitted: apps.filter((a) => a.status === "submitted").length,
          drafts: apps.filter((a) => a.status === "draft").length,
          urgentCount: apps.filter(
            (a) =>
              a.status !== "submitted" && a.status !== "accepted" && a.status !== "rejected" &&
              new Date(a.deadline).getTime() < Date.now() + 14 * 86400000
          ).length,
        };
      },

      reset: () => set({ applications: SEED_APPS }),
    }),
    { name: "olcan-applications" }
  )
);
