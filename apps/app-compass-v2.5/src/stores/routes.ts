import { create } from "zustand";
import { persist } from "zustand/middleware";
import { routesApi } from "@/lib/api";
import { eventBus } from "@/lib/event-bus";

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
  targetOrganization?: string;
  notes?: string;
  templateId?: string;
}

interface RemoteRouteTemplate {
  id: string;
  route_type: string;
  name_pt: string;
  estimated_duration_months: number;
  typical_cost_usd: number;
}

interface RemoteRoute {
  id: string;
  template_id: string;
  name: string;
  target_country?: string | null;
  target_organization?: string | null;
  target_deadline?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

interface RemoteRouteMilestone {
  id: string;
  status: string;
  name_pt?: string | null;
  category?: string | null;
  due_date?: string | null;
}

interface RemoteRouteDetail {
  route: RemoteRoute;
  milestones: RemoteRouteMilestone[];
  template: RemoteRouteTemplate;
}

interface RouteState {
  routes: UserRoute[];
  isSyncing: boolean;
  syncError: string | null;
  syncFromApi: () => Promise<void>;
  addRoute: (route: UserRoute) => Promise<UserRoute | null>;
  removeRoute: (id: string) => Promise<void>;
  toggleMilestone: (routeId: string, milestoneId: string) => Promise<void>;
  setMilestoneStatus: (routeId: string, milestoneId: string, status: MilestoneStatus) => Promise<void>;
  getRouteById: (id: string) => UserRoute | undefined;
  getRouteProgress: (routeId: string) => number;
  getNextMilestone: (routeId: string) => Milestone | null;
  reset: () => void;
}

const ROUTE_TYPE_LABELS: Record<string, string> = {
  // Imigração & relocação
  scholarship: "Bolsa de Estudos",
  job_relocation: "Relocação por Emprego",
  research: "Pesquisa / PhD",
  startup_visa: "Startup Visa",
  exchange: "Intercâmbio",
  digital_nomad: "Nômade Digital",
  investor_visa: "Visto para Investidor",
  // Acadêmico & desenvolvimento profissional
  postdoc: "Pós-Doutorado",
  academic_visiting: "Professor / Pesquisador Visitante",
  professional_certification: "Certificação Profissional",
  // Corporativo & organizacional
  intracompany_transfer: "Transferência Interna (ICT)",
  conference_representation: "Representação em Congresso",
  corporate_secondment: "Designação Temporária no Exterior",
  // Social & cívico
  volunteer_abroad: "Voluntariado Internacional",
  ngo_mission: "Missão em ONG / INGO",
  // Lifestyle & independente
  retirement_abroad: "Aposentadoria no Exterior",
  remote_work: "Trabalho Remoto Internacional",
};

const LOCAL_TYPE_TO_REMOTE: Record<string, string> = {
  scholarship: "scholarship",
  employment: "job_relocation",
  research: "research",
  startup: "startup_visa",
  exchange: "exchange",
};

const MILESTONE_CATEGORY_LABELS: Record<string, string> = {
  documentation: "Documentação",
  finance: "Finanças",
  language: "Idioma",
  application: "Aplicação",
  preparation: "Preparação",
  visa: "Visto",
  logistics: "Logística",
};

const REMOTE_STATUS_TO_LOCAL: Record<string, MilestoneStatus> = {
  completed: "completed",
  in_progress: "in_progress",
  available: "pending",
  locked: "blocked",
  skipped: "blocked",
};

const LOCAL_STATUS_TO_REMOTE: Record<MilestoneStatus, string> = {
  completed: "completed",
  in_progress: "in_progress",
  pending: "available",
  blocked: "locked",
};

const SEED_ROUTES: UserRoute[] = [];

function normalizeDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function formatBudget(usd?: number): string {
  if (!usd) return "Budget a definir";
  return `US$ ${usd.toLocaleString("en-US")}`;
}

function formatTimeline(months?: number): string {
  if (!months) return "Timeline aberta";
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

function mapRemoteMilestone(milestone: RemoteRouteMilestone): Milestone {
  return {
    id: milestone.id,
    name: milestone.name_pt || "Milestone Compass",
    status: REMOTE_STATUS_TO_LOCAL[milestone.status] || "pending",
    group: MILESTONE_CATEGORY_LABELS[milestone.category || ""] || "Execução",
    dueDate: normalizeDate(milestone.due_date),
    dependsOn: [],
  };
}

function mapRemoteRoute(detail: RemoteRouteDetail): UserRoute {
  return {
    id: detail.route.id,
    name: detail.route.name,
    type: ROUTE_TYPE_LABELS[detail.template.route_type] || detail.template.name_pt,
    country: detail.route.target_country || "—",
    timeline: formatTimeline(detail.template.estimated_duration_months),
    budget: formatBudget(detail.template.typical_cost_usd),
    milestones: detail.milestones.map(mapRemoteMilestone),
    createdAt: normalizeDate(detail.route.created_at) || "",
    targetOrganization: detail.route.target_organization || undefined,
    notes: detail.route.notes || undefined,
    templateId: detail.route.template_id,
  };
}

async function loadDetailedRoutes(): Promise<UserRoute[]> {
  const { data } = await routesApi.getUserRoutes();
  const routes: RemoteRoute[] = data?.routes || [];

  const details = await Promise.allSettled(
    routes.map(async (route) => {
      const detailResponse = await routesApi.getRoute(route.id);
      return mapRemoteRoute(detailResponse.data as RemoteRouteDetail);
    })
  );

  return details.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

async function fetchTemplateIdByLocalType(localType: string): Promise<string | null> {
  const remoteType = LOCAL_TYPE_TO_REMOTE[localType];
  if (!remoteType) return null;
  const { data } = await routesApi.getTemplates();
  const templates: RemoteRouteTemplate[] = data?.templates || [];
  return templates.find((template) => template.route_type === remoteType)?.id || null;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      routes: SEED_ROUTES,
      isSyncing: false,
      syncError: null,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const routes = await loadDetailedRoutes();
          set({ routes, isSyncing: false, syncError: null });
        } catch {
          set({ isSyncing: false, syncError: "Não foi possível sincronizar as rotas com a API." });
        }
      },

      addRoute: async (route) => {
        try {
          let templateId: string | null = null;

          // Attempt to fetch template from API with a short timeout
          try {
            templateId = await fetchTemplateIdByLocalType(route.type);
          } catch {
            // API unreachable — generate a stable local ID so the route installs offline
            templateId = null;
          }

          if (!templateId) {
            // Graceful degradation: create route locally without remote sync
            const localRoute: UserRoute = {
              ...route,
              id: route.id || `local_${Date.now()}`,
              milestones: route.milestones.length > 0 ? route.milestones : [
                { id: `m_${Date.now()}_1`, name: "Definição de estratégia", status: "pending", group: "Preparação" },
                { id: `m_${Date.now()}_2`, name: "Pesquisa e documentação", status: "pending", group: "Documentação" },
                { id: `m_${Date.now()}_3`, name: "Submissão e acompanhamento", status: "pending", group: "Aplicação" },
              ],
            };
            set((state) => ({
              routes: [localRoute, ...state.routes.filter((item) => item.id !== localRoute.id)],
              syncError: null,
            }));
            return localRoute;
          }

          const response = await routesApi.createRoute({
            template_id: templateId,
            name: route.name,
            target_country: route.country,
          });

          const detailResponse = await routesApi.getRoute(response.data.id);
          const mapped = mapRemoteRoute(detailResponse.data as RemoteRouteDetail);
          set((state) => ({
            routes: [mapped, ...state.routes.filter((item) => item.id !== mapped.id)],
            syncError: null,
          }));
          // Emit route selected event for gamification
          eventBus.emit("route.selected", { routeId: mapped.id, routeType: route.type });
          return mapped;
        } catch {
          // Last resort: install locally even if all API calls fail
          const fallbackRoute: UserRoute = {
            ...route,
            id: route.id || `local_${Date.now()}`,
          };
          set((state) => ({
            routes: [fallbackRoute, ...state.routes.filter((item) => item.id !== fallbackRoute.id)],
            syncError: "Rota criada localmente. Será sincronizada quando a conexão for restabelecida.",
          }));
          return fallbackRoute;
        }
      },

      removeRoute: async (id) => {
        const previous = get().routes;
        set((state) => ({ routes: state.routes.filter((route) => route.id !== id) }));
        try {
          await routesApi.deleteRoute(id);
        } catch {
          set({ routes: previous, syncError: "Não foi possível remover a rota." });
        }
      },

      toggleMilestone: async (routeId, milestoneId) => {
        const route = get().routes.find((item) => item.id === routeId);
        if (!route) return;
        const milestone = route.milestones.find((item) => item.id === milestoneId);
        if (!milestone) return;

        const nextStatus: MilestoneStatus =
          milestone.status === "completed"
            ? "pending"
            : milestone.status === "in_progress"
            ? "completed"
            : "in_progress";

        await get().setMilestoneStatus(routeId, milestoneId, nextStatus);
      },

      setMilestoneStatus: async (routeId, milestoneId, status) => {
        const previous = get().routes;
        set((state) => ({
          routes: state.routes.map((route) =>
            route.id !== routeId
              ? route
              : {
                  ...route,
                  milestones: route.milestones.map((milestone) =>
                    milestone.id === milestoneId ? { ...milestone, status } : milestone
                  ),
                }
          ),
        }));

        try {
          await routesApi.updateMilestone(milestoneId, { status: LOCAL_STATUS_TO_REMOTE[status] });
          const detailResponse = await routesApi.getRoute(routeId);
          const mapped = mapRemoteRoute(detailResponse.data as RemoteRouteDetail);
          set((state) => ({
            routes: state.routes.map((route) => (route.id === routeId ? mapped : route)),
            syncError: null,
          }));
          // Emit milestone completed event for gamification
          if (status === "completed") {
            eventBus.emit("route.milestone_completed", { routeId, milestoneId });
          }
        } catch {
          set({ routes: previous, syncError: "Não foi possível atualizar a milestone da rota." });
        }
      },

      getRouteById: (id) => get().routes.find((route) => route.id === id),

      getRouteProgress: (routeId) => {
        const route = get().routes.find((item) => item.id === routeId);
        if (!route || route.milestones.length === 0) return 0;
        const completed = route.milestones.filter((milestone) => milestone.status === "completed").length;
        return Math.round((completed / route.milestones.length) * 100);
      },

      getNextMilestone: (routeId) => {
        const route = get().routes.find((item) => item.id === routeId);
        if (!route) return null;
        return (
          route.milestones.find((milestone) => milestone.status === "in_progress") ||
          route.milestones.find((milestone) => milestone.status === "pending") ||
          null
        );
      },

      reset: () =>
        set({
          routes: SEED_ROUTES,
          isSyncing: false,
          syncError: null,
        }),
    }),
    { name: "olcan-routes" }
  )
);
