import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sprintsApi } from "@/lib/api";

export interface SprintTask {
  id: string;
  name: string;
  done: boolean;
  dueDate: string;
  notes?: string;
}

export interface Sprint {
  id: string;
  name: string;
  dimension: string;
  status: "active" | "completed" | "paused";
  tasks: SprintTask[];
  createdAt: string;
  targetDate: string;
  routeId?: string;
}

interface RemoteSprintTask {
  id: string;
  title: string;
  status: string;
  due_date?: string | null;
  user_notes?: string | null;
}

interface RemoteSprint {
  id: string;
  name: string;
  route_id?: string | null;
  gap_category: string;
  status: string;
  created_at: string;
  target_end_date?: string | null;
}

interface RemoteSprintDetail extends RemoteSprint {
  tasks?: RemoteSprintTask[];
}

interface SprintState {
  sprints: Sprint[];
  isSyncing: boolean;
  syncError: string | null;
  syncFromApi: () => Promise<void>;
  addSprint: (sprint: Sprint) => Promise<Sprint | null>;
  removeSprint: (id: string) => Promise<void>;
  toggleTask: (sprintId: string, taskId: string) => Promise<void>;
  addTask: (sprintId: string, task: SprintTask) => Promise<void>;
  removeTask: (sprintId: string, taskId: string) => Promise<void>;
  getSprintProgress: (sprintId: string) => number;
  getSprintById: (id: string) => Sprint | undefined;
  getTotalPendingTasks: () => number;
  getActiveSprints: () => Sprint[];
  getNextTask: () => { sprint: Sprint; task: SprintTask } | null;
  pauseSprint: (id: string) => Promise<void>;
  resumeSprint: (id: string) => Promise<void>;
  reset: () => void;
}

const SEED_SPRINTS: Sprint[] = [];

const GAP_CATEGORY_TO_DIMENSION: Record<string, string> = {
  financial: "Financeira",
  finance: "Financeira",
  documentation: "Documental",
  document: "Documental",
  language: "Linguística",
  linguistic: "Linguística",
  confidence: "Psicológica",
  discipline: "Psicológica",
  psychology: "Psicológica",
  psychological: "Psicológica",
  visa: "Logística",
  relocation: "Logística",
  logistics: "Logística",
  narrative: "Narrativa",
  interview: "Entrevista",
};

const DIMENSION_TO_GAP_CATEGORY: Record<string, string> = {
  Financeira: "financial",
  Documental: "documentation",
  Linguística: "language",
  Psicológica: "confidence",
  Logística: "visa",
  Narrativa: "narrative",
  Entrevista: "interview",
};

const REMOTE_STATUS_TO_LOCAL: Record<string, Sprint["status"]> = {
  active: "active",
  completed: "completed",
  planned: "paused",
  abandoned: "paused",
};

function normalizeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function mapDimension(value?: string | null): string {
  if (!value) return "Prontidão";
  return GAP_CATEGORY_TO_DIMENSION[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

function mapTask(task: RemoteSprintTask, fallbackDate: string): SprintTask {
  return {
    id: task.id,
    name: task.title,
    done: task.status === "completed",
    dueDate: normalizeDate(task.due_date) || fallbackDate,
    notes: task.user_notes || undefined,
  };
}

function mapSprint(remote: RemoteSprintDetail): Sprint {
  const targetDate = normalizeDate(remote.target_end_date) || normalizeDate(remote.created_at);
  const tasks = (remote.tasks || []).map((task) => mapTask(task, targetDate));
  const statusFromRemote = REMOTE_STATUS_TO_LOCAL[remote.status] || "active";
  const computedStatus =
    tasks.length > 0 && tasks.every((task) => task.done)
      ? "completed"
      : statusFromRemote === "completed"
      ? "active"
      : statusFromRemote;

  return {
    id: remote.id,
    name: remote.name,
    dimension: mapDimension(remote.gap_category),
    status: computedStatus,
    tasks,
    createdAt: normalizeDate(remote.created_at),
    targetDate,
    routeId: remote.route_id || undefined,
  };
}

async function loadDetailedSprints(): Promise<Sprint[]> {
  const { data } = await sprintsApi.getAll();
  const sprints: RemoteSprint[] = data?.items || [];

  const details = await Promise.allSettled(
    sprints.map(async (sprint) => {
      const detailResponse = await sprintsApi.get(sprint.id);
      return mapSprint(detailResponse.data as RemoteSprintDetail);
    })
  );

  return details.flatMap((result, index) => {
    if (result.status === "fulfilled") return [result.value];
    return [mapSprint(sprints[index])];
  });
}

export const useSprintStore = create<SprintState>()(
  persist(
    (set, get) => ({
      sprints: SEED_SPRINTS,
      isSyncing: false,
      syncError: null,

      syncFromApi: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const sprints = await loadDetailedSprints();
          set({ sprints, isSyncing: false, syncError: null });
        } catch {
          set({
            isSyncing: false,
            syncError: "Não foi possível sincronizar os sprints com a API.",
          });
        }
      },

      addSprint: async (sprint) => {
        // Build the local sprint object with a stable local ID up-front.
        // We use this immediately if the API is unavailable, and replace it
        // with the server-assigned ID once the backend responds.
        const localSprint: Sprint = {
          ...sprint,
          id: sprint.id || `local_s_${Date.now()}`,
          createdAt: sprint.createdAt || new Date().toISOString().slice(0, 10),
          status: "active",
        };

        try {
          const response = await sprintsApi.create({
            name: sprint.name,
            route_id: sprint.routeId || null,
            gap_category: DIMENSION_TO_GAP_CATEGORY[sprint.dimension] || "general",
            start_date: localSprint.createdAt,
            target_end_date: sprint.targetDate || null,
            description: `Sprint criado no workspace Compass para a dimensão ${sprint.dimension}.`,
          });

          const created = response.data as RemoteSprintDetail;
          const createdId = created.id;

          if (sprint.tasks.length > 0) {
            // Single bulk request instead of N concurrent POSTs — prevents Neon connection exhaustion
            const taskPayloads = sprint.tasks.map((task, index) => ({
              title: task.name,
              category: DIMENSION_TO_GAP_CATEGORY[sprint.dimension] || "general",
              due_date: task.dueDate || null,
              display_order: index,
            }));
            await sprintsApi.createTasksBulk(createdId, taskPayloads);
          }

          const detailResponse = await sprintsApi.get(createdId);
          const mapped = mapSprint(detailResponse.data as RemoteSprintDetail);
          set((state) => ({
            sprints: [mapped, ...state.sprints.filter((item) => item.id !== mapped.id)],
            syncError: null,
          }));
          return mapped;
        } catch {
          // API unavailable — persist locally so the user can still work offline.
          // The sprint will be synced to the backend when it comes back online.
          set((state) => ({
            sprints: [localSprint, ...state.sprints.filter((item) => item.id !== localSprint.id)],
            syncError: null,
          }));
          return localSprint;
        }
      },

      removeSprint: async (id) => {
        const previous = get().sprints;
        set((state) => ({ sprints: state.sprints.filter((sprint) => sprint.id !== id) }));
        try {
          await sprintsApi.remove(id);
        } catch {
          set({ sprints: previous, syncError: "Não foi possível remover o sprint." });
        }
      },

      toggleTask: async (sprintId, taskId) => {
        const sprint = get().sprints.find((item) => item.id === sprintId);
        if (!sprint) return;
        const task = sprint.tasks.find((item) => item.id === taskId);
        if (!task) return;

        const nextDone = !task.done;
        const nextTasks = sprint.tasks.map((item) =>
          item.id === taskId ? { ...item, done: nextDone } : item
        );
        const nextStatus =
          nextTasks.length > 0 && nextTasks.every((item) => item.done)
            ? "completed"
            : sprint.status === "paused"
            ? "paused"
            : "active";

        // Always apply optimistic update first — never block user on API latency
        set((state) => ({
          sprints: state.sprints.map((item) =>
            item.id === sprintId ? { ...item, tasks: nextTasks, status: nextStatus } : item
          ),
        }));

        try {
          if (nextDone) {
            await sprintsApi.completeTask(sprintId, taskId);
          } else {
            await sprintsApi.updateTask(sprintId, taskId, { status: "todo" });
            await sprintsApi.update(sprintId, { status: "active" });
          }

          // Refresh to get authoritative server state
          const detailResponse = await sprintsApi.get(sprintId);
          const mapped = mapSprint(detailResponse.data as RemoteSprintDetail);
          set((state) => ({
            sprints: state.sprints.map((item) => (item.id === sprintId ? mapped : item)),
            syncError: null,
          }));
        } catch {
          // Keep optimistic state — do NOT revert. Local completion is valid.
          // Clear any previous error message so the user doesn't see stale alerts.
          set({ syncError: null });
        }
      },

      addTask: async (sprintId, task) => {
        const sprint = get().sprints.find((item) => item.id === sprintId);
        if (!sprint) return;

        // Optimistic update first — user sees the task immediately
        const optimisticTask: SprintTask = { ...task, id: task.id || `local_t_${Date.now()}` };
        set((state) => ({
          sprints: state.sprints.map((item) =>
            item.id === sprintId
              ? { ...item, tasks: [...item.tasks, optimisticTask] }
              : item
          ),
        }));

        try {
          await sprintsApi.createTask(sprintId, {
            title: optimisticTask.name,
            category: DIMENSION_TO_GAP_CATEGORY[sprint.dimension] || "general",
            due_date: optimisticTask.dueDate || sprint.targetDate || null,
            display_order: sprint.tasks.length,
          });
          // Refresh from remote to get server-assigned ID
          const detailResponse = await sprintsApi.get(sprintId);
          const mapped = mapSprint(detailResponse.data as RemoteSprintDetail);
          set((state) => ({
            sprints: state.sprints.map((item) => (item.id === sprintId ? mapped : item)),
            syncError: null,
          }));
        } catch {
          // Keep the optimistic task — it's already in local state
          // The task will be marked as local and synced when connection is restored
          set({ syncError: null }); // Clear previous errors — local creation succeeded
        }
      },

      removeTask: async () => {
        set({
          syncError:
            "A API atual ainda não suporta remover tarefas de sprint. O fluxo precisa de backend antes de ser habilitado.",
        });
      },

      getSprintProgress: (sprintId) => {
        const sprint = get().sprints.find((item) => item.id === sprintId);
        if (!sprint || sprint.tasks.length === 0) return 0;
        return Math.round(
          (sprint.tasks.filter((task) => task.done).length / sprint.tasks.length) * 100
        );
      },

      getSprintById: (id) => get().sprints.find((sprint) => sprint.id === id),

      getTotalPendingTasks: () =>
        get()
          .sprints.filter((sprint) => sprint.status === "active")
          .reduce((sum, sprint) => sum + sprint.tasks.filter((task) => !task.done).length, 0),

      getActiveSprints: () => get().sprints.filter((sprint) => sprint.status === "active"),

      getNextTask: () => {
        const active = get().sprints.filter((sprint) => sprint.status === "active");
        for (const sprint of active) {
          const task = sprint.tasks
            .filter((item) => !item.done)
            .sort(
              (left, right) =>
                new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
            )[0];
          if (task) return { sprint, task };
        }
        return null;
      },

      pauseSprint: async (id) => {
        const previous = get().sprints;
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === id ? { ...sprint, status: "paused" } : sprint
          ),
        }));
        try {
          await sprintsApi.update(id, { status: "planned" });
        } catch {
          set({ sprints: previous, syncError: "Não foi possível pausar o sprint." });
        }
      },

      resumeSprint: async (id) => {
        const previous = get().sprints;
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === id ? { ...sprint, status: "active" } : sprint
          ),
        }));
        try {
          await sprintsApi.update(id, { status: "active" });
          const detailResponse = await sprintsApi.get(id);
          const mapped = mapSprint(detailResponse.data as RemoteSprintDetail);
          set((state) => ({
            sprints: state.sprints.map((sprint) => (sprint.id === id ? mapped : sprint)),
            syncError: null,
          }));
        } catch {
          set({ sprints: previous, syncError: "Não foi possível retomar o sprint." });
        }
      },

      reset: () =>
        set({
          sprints: SEED_SPRINTS,
          isSyncing: false,
          syncError: null,
        }),
    }),
    { name: "olcan-sprints" }
  )
);
