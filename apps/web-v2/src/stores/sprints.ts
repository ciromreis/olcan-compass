import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

interface SprintState {
  sprints: Sprint[];
  addSprint: (sprint: Sprint) => void;
  removeSprint: (id: string) => void;
  toggleTask: (sprintId: string, taskId: string) => void;
  addTask: (sprintId: string, task: SprintTask) => void;
  removeTask: (sprintId: string, taskId: string) => void;
  getSprintProgress: (sprintId: string) => number;
  getSprintById: (id: string) => Sprint | undefined;
  getTotalPendingTasks: () => number;
  getActiveSprints: () => Sprint[];
  getNextTask: () => { sprint: Sprint; task: SprintTask } | null;
  pauseSprint: (id: string) => void;
  resumeSprint: (id: string) => void;
  reset: () => void;
}

const SEED_SPRINTS: Sprint[] = [
  {
    id: "sp1",
    name: "Sprint Financeiro — 3 meses",
    dimension: "Financeira",
    status: "active",
    targetDate: "2025-05-01",
    createdAt: "2025-02-01",
    tasks: [
      { id: "t1", name: "Abrir conta Wise", done: true, dueDate: "2025-02-20" },
      { id: "t2", name: "Configurar transferência automática mensal", done: true, dueDate: "2025-02-25" },
      { id: "t3", name: "Cancelar assinaturas desnecessárias", done: true, dueDate: "2025-03-01" },
      { id: "t4", name: "Cotação de seguro saúde internacional", done: false, dueDate: "2025-03-10" },
      { id: "t5", name: "Pesquisar Sperrkonto (blocked account)", done: false, dueDate: "2025-03-15" },
      { id: "t6", name: "Abrir Sperrkonto e depositar", done: false, dueDate: "2025-04-01" },
      { id: "t7", name: "Contratar seguro saúde", done: false, dueDate: "2025-04-15" },
      { id: "t8", name: "Atingir reserva de 6 meses", done: false, dueDate: "2025-05-01" },
    ],
  },
  {
    id: "sp2",
    name: "Sprint Documental — Pré-candidatura",
    dimension: "Documental",
    status: "active",
    targetDate: "2025-03-28",
    createdAt: "2025-02-10",
    tasks: [
      { id: "t9", name: "Diploma traduzido e apostilado", done: true, dueDate: "2025-02-15" },
      { id: "t10", name: "Histórico escolar traduzido", done: true, dueDate: "2025-02-18" },
      { id: "t11", name: "Certidão de nascimento apostilada", done: true, dueDate: "2025-02-20" },
      { id: "t12", name: "Carta de motivação — rascunho 1", done: true, dueDate: "2025-02-28" },
      { id: "t13", name: "Solicitar carta de recomendação #1", done: false, dueDate: "2025-03-05" },
      { id: "t14", name: "Solicitar carta de recomendação #2", done: false, dueDate: "2025-03-10" },
    ],
  },
  {
    id: "sp3",
    name: "Sprint Linguístico — IELTS 8.0",
    dimension: "Linguística",
    status: "completed",
    targetDate: "2025-02-15",
    createdAt: "2024-12-01",
    tasks: [
      { id: "t15", name: "Inscrição IELTS", done: true, dueDate: "2024-12-15" },
      { id: "t16", name: "Simulados semanais (8 semanas)", done: true, dueDate: "2025-02-01" },
      { id: "t17", name: "Prova IELTS", done: true, dueDate: "2025-02-08" },
      { id: "t18", name: "Receber resultado", done: true, dueDate: "2025-02-15" },
    ],
  },
];

export const useSprintStore = create<SprintState>()(
  persist(
    (set, get) => ({
      sprints: SEED_SPRINTS,

      addSprint: (sprint) =>
        set((state) => ({ sprints: [...state.sprints, sprint] })),

      removeSprint: (id) =>
        set((state) => ({ sprints: state.sprints.filter((s) => s.id !== id) })),

      toggleTask: (sprintId, taskId) =>
        set((state) => {
          const sprints = state.sprints.map((sprint) => {
            if (sprint.id !== sprintId) return sprint;
            const tasks = sprint.tasks.map((task) =>
              task.id === taskId ? { ...task, done: !task.done } : task
            );
            const allDone = tasks.every((t) => t.done);
            return {
              ...sprint,
              tasks,
              status: allDone ? ("completed" as const) : sprint.status === "completed" ? ("active" as const) : sprint.status,
            };
          });
          return { sprints };
        }),

      addTask: (sprintId, task) =>
        set((state) => ({
          sprints: state.sprints.map((s) =>
            s.id === sprintId ? { ...s, tasks: [...s.tasks, task], status: "active" as const } : s
          ),
        })),

      removeTask: (sprintId, taskId) =>
        set((state) => ({
          sprints: state.sprints.map((s) =>
            s.id === sprintId
              ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
              : s
          ),
        })),

      getSprintProgress: (sprintId) => {
        const sprint = get().sprints.find((s) => s.id === sprintId);
        if (!sprint || sprint.tasks.length === 0) return 0;
        return Math.round(
          (sprint.tasks.filter((t) => t.done).length / sprint.tasks.length) * 100
        );
      },

      getSprintById: (id) => get().sprints.find((s) => s.id === id),

      getTotalPendingTasks: () =>
        get()
          .sprints.filter((s) => s.status === "active")
          .reduce((sum, s) => sum + s.tasks.filter((t) => !t.done).length, 0),

      getActiveSprints: () => get().sprints.filter((s) => s.status === "active"),

      getNextTask: () => {
        const active = get().sprints.filter((s) => s.status === "active");
        for (const sprint of active) {
          const task = sprint.tasks
            .filter((t) => !t.done)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
          if (task) return { sprint, task };
        }
        return null;
      },

      pauseSprint: (id) =>
        set((state) => ({
          sprints: state.sprints.map((s) =>
            s.id === id ? { ...s, status: "paused" as const } : s
          ),
        })),

      resumeSprint: (id) =>
        set((state) => ({
          sprints: state.sprints.map((s) =>
            s.id === id ? { ...s, status: "active" as const } : s
          ),
        })),

      reset: () => set({ sprints: SEED_SPRINTS }),
    }),
    { name: "olcan-sprints" }
  )
);
