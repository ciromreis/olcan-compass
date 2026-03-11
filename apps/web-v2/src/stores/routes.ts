import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MilestoneStatus = "completed" | "in_progress" | "pending" | "blocked";

export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  group: string;
  dueDate?: string;
  dependsOn?: string[];
}

export interface UserRoute {
  id: string;
  name: string;
  type: string;
  country: string;
  timeline: string;
  budget: string;
  milestones: Milestone[];
  createdAt: string;
}

interface RouteState {
  routes: UserRoute[];
  addRoute: (route: UserRoute) => void;
  removeRoute: (id: string) => void;
  toggleMilestone: (routeId: string, milestoneId: string) => void;
  setMilestoneStatus: (routeId: string, milestoneId: string, status: MilestoneStatus) => void;
  getRouteById: (id: string) => UserRoute | undefined;
  getRouteProgress: (routeId: string) => number;
  getNextMilestone: (routeId: string) => Milestone | null;
  reset: () => void;
}

const SEED_ROUTES: UserRoute[] = [
  {
    id: "r1",
    name: "Mestrado em Berlim",
    type: "Bolsa de Estudos",
    country: "Alemanha",
    timeline: "12 meses",
    budget: "R$ 18.000",
    createdAt: "2025-01-15",
    milestones: [
      { id: "m1", name: "Pesquisa de programas", status: "completed", group: "Preparação", dueDate: "2025-01-30" },
      { id: "m2", name: "Teste de proficiência (IELTS/TOEFL)", status: "completed", group: "Preparação", dueDate: "2025-02-08" },
      { id: "m3", name: "Carta de motivação", status: "in_progress", group: "Documentação", dueDate: "2025-03-15", dependsOn: ["m1"] },
      { id: "m4", name: "Cartas de recomendação", status: "pending", group: "Documentação", dueDate: "2025-03-20" },
      { id: "m5", name: "Candidatura à universidade", status: "pending", group: "Aplicação", dueDate: "2025-05-01", dependsOn: ["m3", "m4"] },
      { id: "m6", name: "Candidatura à bolsa DAAD", status: "pending", group: "Aplicação", dueDate: "2025-05-15", dependsOn: ["m3", "m4"] },
      { id: "m7", name: "Visto de estudante", status: "pending", group: "Pós-aceite", dueDate: "2025-08-01", dependsOn: ["m5"] },
      { id: "m8", name: "Passagem e moradia", status: "pending", group: "Pós-aceite", dueDate: "2025-09-01", dependsOn: ["m7"] },
    ],
  },
  {
    id: "r2",
    name: "Relocação para Dublin",
    type: "Emprego Tech",
    country: "Irlanda",
    timeline: "8 meses",
    budget: "R$ 45.000",
    createdAt: "2025-02-01",
    milestones: [
      { id: "m9", name: "Atualizar LinkedIn e CV", status: "completed", group: "Preparação", dueDate: "2025-02-10" },
      { id: "m10", name: "Candidatura a 10 vagas", status: "in_progress", group: "Aplicação", dueDate: "2025-03-15", dependsOn: ["m9"] },
      { id: "m11", name: "Mock interviews (3 sessões)", status: "pending", group: "Aplicação", dueDate: "2025-03-30" },
      { id: "m12", name: "Entrevistas reais", status: "pending", group: "Aplicação", dueDate: "2025-04-30", dependsOn: ["m10", "m11"] },
      { id: "m13", name: "Negociação e aceite de oferta", status: "pending", group: "Pós-aceite", dueDate: "2025-05-15", dependsOn: ["m12"] },
      { id: "m14", name: "Critical Skills Visa", status: "pending", group: "Pós-aceite", dueDate: "2025-06-15", dependsOn: ["m13"] },
      { id: "m15", name: "Mudança e housing", status: "pending", group: "Relocação", dueDate: "2025-07-15", dependsOn: ["m14"] },
      { id: "m16", name: "Abertura de conta bancária", status: "pending", group: "Relocação", dueDate: "2025-07-20", dependsOn: ["m14"] },
      { id: "m17", name: "PPS Number (Social Security)", status: "pending", group: "Relocação", dueDate: "2025-07-30", dependsOn: ["m15"] },
      { id: "m18", name: "Primeiro dia no trabalho", status: "pending", group: "Relocação", dueDate: "2025-08-01", dependsOn: ["m15"] },
      { id: "m19", name: "Irish Residence Permit (IRP)", status: "pending", group: "Pós-chegada", dueDate: "2025-08-15", dependsOn: ["m18"] },
    ],
  },
];

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      routes: SEED_ROUTES,

      addRoute: (route) =>
        set((state) => ({ routes: [...state.routes, route] })),

      removeRoute: (id) =>
        set((state) => ({ routes: state.routes.filter((r) => r.id !== id) })),

      toggleMilestone: (routeId, milestoneId) =>
        set((state) => ({
          routes: state.routes.map((route) => {
            if (route.id !== routeId) return route;
            return {
              ...route,
              milestones: route.milestones.map((m) => {
                if (m.id !== milestoneId) return m;
                if (m.status === "completed") return { ...m, status: "pending" as MilestoneStatus };
                if (m.status === "in_progress") return { ...m, status: "completed" as MilestoneStatus };
                return { ...m, status: "in_progress" as MilestoneStatus };
              }),
            };
          }),
        })),

      setMilestoneStatus: (routeId, milestoneId, status) =>
        set((state) => ({
          routes: state.routes.map((route) => {
            if (route.id !== routeId) return route;
            return {
              ...route,
              milestones: route.milestones.map((m) =>
                m.id === milestoneId ? { ...m, status } : m
              ),
            };
          }),
        })),

      getRouteById: (id) => get().routes.find((r) => r.id === id),

      getRouteProgress: (routeId) => {
        const route = get().routes.find((r) => r.id === routeId);
        if (!route || route.milestones.length === 0) return 0;
        const completed = route.milestones.filter((m) => m.status === "completed").length;
        return Math.round((completed / route.milestones.length) * 100);
      },

      getNextMilestone: (routeId) => {
        const route = get().routes.find((r) => r.id === routeId);
        if (!route) return null;
        return (
          route.milestones.find((m) => m.status === "in_progress") ||
          route.milestones.find((m) => m.status === "pending") ||
          null
        );
      },

      reset: () => set({ routes: SEED_ROUTES }),
    }),
    { name: "olcan-routes" }
  )
);
