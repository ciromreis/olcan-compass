"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Zap, CheckCircle, Circle, Plus,
  Pause, Play, AlertTriangle, TrendingUp, CalendarDays,
  LayoutList, Columns, CalendarRange, GanttChartSquare,
} from "lucide-react";
import { useSprintStore, type SprintTask } from "@/stores/sprints";
import { useHydration } from "@/hooks";
import { Input, PageHeader, Progress, Skeleton, useToast } from "@/components/ui";

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

const DIMENSION_WEIGHT: Record<string, number> = {
  Financeira: 30, Documental: 25, Linguística: 20, Psicológica: 15, Logística: 10,
};

type ViewMode = "list" | "kanban" | "calendar" | "gantt";

const VIEW_TABS: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "list", label: "Lista", icon: LayoutList },
  { id: "kanban", label: "Kanban", icon: Columns },
  { id: "calendar", label: "Calendário", icon: CalendarRange },
  { id: "gantt", label: "Gantt", icon: GanttChartSquare },
];

// ─── Kanban View ─────────────────────────────────────────────────────────────
function KanbanView({ tasks, onToggle }: { tasks: SprintTask[]; onToggle: (id: string) => void }) {
  const columns = [
    { id: "todo", label: "Para Fazer", color: "border-clay-300 bg-clay-50", dot: "bg-clay-400", tasks: tasks.filter((t) => !t.done) },
    { id: "done", label: "Concluído", color: "border-sage-300 bg-sage-50", dot: "bg-sage-400", tasks: tasks.filter((t) => t.done) },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 min-h-[300px]">
      {columns.map((col) => (
        <div key={col.id} className={`rounded-xl border-2 ${col.color} p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
            <h4 className="font-heading text-sm font-semibold text-text-primary">{col.label}</h4>
            <span className="ml-auto text-xs font-bold text-text-muted bg-white rounded-full px-2 py-0.5 border border-cream-300">
              {col.tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.tasks.length === 0 ? (
              <p className="text-center text-caption text-text-muted py-6">Nenhuma tarefa aqui</p>
            ) : (
              col.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-all cursor-pointer group ${task.done ? "border-sage-200 opacity-75" : "border-cream-300 hover:border-brand-300"}`}
                  onClick={() => onToggle(task.id)}
                >
                  <div className="flex items-center gap-2">
                    {task.done ? (
                      <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-cream-400 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
                    )}
                    <span className={`text-sm flex-1 ${task.done ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 ml-6">
                    <CalendarDays className="w-3 h-3 text-text-muted" />
                    <span className="text-[11px] text-text-muted">
                      {new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ tasks }: { tasks: SprintTask[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build task map by day
  const tasksByDay: Record<number, typeof tasks> = {};
  tasks.forEach((t) => {
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <h4 className="font-heading text-base font-semibold text-text-primary capitalize mb-3">{monthName}</h4>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-text-muted uppercase tracking-wide py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const isToday = day === today.getDate();
          const dayTasks = day ? (tasksByDay[day] || []) : [];
          return (
            <div
              key={i}
              className={`min-h-[60px] rounded-lg p-1.5 text-xs ${
                !day ? "bg-transparent" : isToday ? "bg-brand-50 border border-brand-300" : "bg-cream-50 border border-cream-200"
              }`}
            >
              {day && (
                <>
                  <span className={`font-bold block mb-0.5 ${isToday ? "text-brand-600" : "text-text-secondary"}`}>{day}</span>
                  {dayTasks.slice(0, 2).map((t) => (
                    <div key={t.id} className={`text-[10px] truncate rounded px-1 py-0.5 mb-0.5 ${t.done ? "bg-sage-100 text-sage-600 line-through" : "bg-brand-100 text-brand-700"}`}>
                      {t.name}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] text-text-muted font-semibold">+{dayTasks.length - 2}</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gantt View ───────────────────────────────────────────────────────────────
function GanttView({ tasks, sprintStart, sprintEnd }: { tasks: SprintTask[]; sprintStart: string; sprintEnd: string }) {
  const start = new Date(sprintStart).getTime();
  const end = new Date(sprintEnd).getTime();
  const totalDuration = Math.max(end - start, 1);
  const today = Date.now();
  const todayPct = Math.min(100, Math.max(0, ((today - start) / totalDuration) * 100));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 text-[11px] font-bold uppercase tracking-wide text-text-muted">
          <span className="w-40 shrink-0">Tarefa</span>
          <div className="flex-1 flex justify-between">
            <span>{new Date(sprintStart).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
            <span>{new Date(sprintEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
          </div>
        </div>

        {/* Today marker container */}
        <div className="relative">
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-brand-400 z-10 opacity-70"
            style={{ left: `calc(160px + ${todayPct}% * (100% - 160px) / 100)` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 text-[10px] font-bold text-brand-500 bg-brand-50 px-1 rounded">Hoje</span>
          </div>

          {/* Task bars */}
          <div className="space-y-2">
            {tasks.map((task) => {
              const taskEnd = new Date(task.dueDate).getTime();
              const taskDuration = Math.max(taskEnd - start, 0);
              const barWidth = Math.min(100, (taskDuration / totalDuration) * 100);

              return (
                <div key={task.id} className="flex items-center gap-3">
                  <span className={`w-40 shrink-0 text-sm truncate ${task.done ? "text-text-muted line-through" : "text-text-primary"}`}>
                    {task.name}
                  </span>
                  <div className="flex-1 h-7 bg-cream-200 rounded-full relative overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all ${task.done ? "bg-sage-400" : "bg-brand-400"}`}
                      style={{ width: `${barWidth}%` }}
                    />
                    {task.done && (
                      <CheckCircle className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({
  tasks, onToggle, justToggled,
}: { tasks: SprintTask[]; onToggle: (id: string) => void; justToggled: string | null }) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const isOverdue = !task.done && new Date(task.dueDate) < new Date();
        const isJustToggled = justToggled === task.id;
        return (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
              task.done ? "bg-brand-50/50" : isOverdue ? "bg-clay-50/50 border border-clay-200" : "bg-cream-50 hover:bg-cream-100"
            } ${isJustToggled ? "scale-[1.01] shadow-sm" : ""}`}
          >
            <button onClick={() => onToggle(task.id)} className="flex-shrink-0 transition-transform hover:scale-110">
              {task.done ? (
                <CheckCircle className="w-5 h-5 text-brand-500" />
              ) : (
                <Circle className="w-5 h-5 text-cream-500 hover:text-brand-400 transition-colors" />
              )}
            </button>
            <span className={`flex-1 text-body-sm transition-all duration-200 ${task.done ? "text-text-muted line-through" : "text-text-primary"}`}>
              {task.name}
            </span>
            <div className="flex items-center gap-2">
              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-clay-400" />}
              <span className={`text-caption flex items-center gap-1 ${isOverdue ? "text-clay-400 font-medium" : "text-text-muted"}`}>
                <CalendarDays className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SprintDetailPage() {
  const params = useParams();
  const sprintId = params.id as string;
  const hydrated = useHydration();
  const { toast } = useToast();

  const { getSprintById, getSprintProgress, toggleTask, addTask, pauseSprint, resumeSprint } = useSprintStore();
  const sprint = hydrated ? getSprintById(sprintId) : undefined;
  const progress = getSprintProgress(sprintId);

  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [justToggled, setJustToggled] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const daysLeft = sprint ? daysUntil(sprint.targetDate) : 0;

  const sortedTasks = useMemo(() => {
    if (!sprint) return [];
    return [...sprint.tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [sprint]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Zap className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-heading text-h3 text-text-primary mb-2">Sprint não encontrado</h2>
        <Link href="/sprints" className="text-brand-500 font-medium hover:underline">Voltar aos sprints</Link>
      </div>
    );
  }

  const completedCount = sprint.tasks.filter((t) => t.done).length;
  const overdue = sprint.tasks.filter((t) => !t.done && new Date(t.dueDate) < new Date()).length;

  const handleToggle = async (taskId: string) => {
    const task = sprint.tasks.find((item) => item.id === taskId);
    await toggleTask(sprintId, taskId);
    setJustToggled(taskId);
    if (task) {
      toast({
        title: task.done ? "Tarefa reaberta" : "Tarefa concluída",
        description: `${task.name} foi ${task.done ? "marcada como pendente" : "marcada como concluída"}.`,
        variant: task.done ? "info" : "success",
      });
    }
    setTimeout(() => setJustToggled(null), 600);
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    const taskName = newTaskName.trim();
    const id = `t_${Date.now()}`;
    const dueDate = sprint.targetDate;
    await addTask(sprintId, { id, name: taskName, done: false, dueDate });
    setNewTaskName("");
    setShowAddTask(false);
    toast({
      title: "Tarefa adicionada",
      description: `${taskName} entrou neste sprint.`,
      variant: "success",
    });
  };

  const handlePause = async () => {
    await pauseSprint(sprintId);
    toast({ title: "Sprint pausado", description: "Você pode retomar este sprint quando quiser.", variant: "info" });
  };

  const handleResume = async () => {
    await resumeSprint(sprintId);
    toast({ title: "Sprint retomado", description: "O sprint voltou para acompanhamento ativo.", variant: "success" });
  };

  const statusLabel = sprint.status === "completed" ? "Concluído" : sprint.status === "paused" ? "Planejado" : "Ativo";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref="/sprints"
        title={sprint.name}
        subtitle={`${statusLabel} • ${sprint.dimension}`}
        actions={sprint.status === "active" ? (
          <button onClick={handlePause} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors">
            <Pause className="w-4 h-4" /> Pausar
          </button>
        ) : sprint.status === "paused" ? (
          <button onClick={handleResume} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors">
            <Play className="w-4 h-4" /> Retomar
          </button>
        ) : null}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Progresso</p>
          <p className={`font-heading text-h2 ${progress === 100 ? "text-sage-500" : "text-brand-500"}`}>{progress}%</p>
          <Progress value={progress} variant="moss" size="sm" className="mt-2" />
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Tarefas</p>
          <p className="font-heading text-h2 text-text-primary">{completedCount}<span className="text-h4 text-text-muted">/{sprint.tasks.length}</span></p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Prazo</p>
          <p className={`font-heading text-h2 ${daysLeft <= 7 ? "text-clay-500" : daysLeft <= 30 ? "text-amber-500" : "text-text-primary"}`}>{daysLeft}</p>
          <p className="text-caption text-text-muted">dias</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Atrasadas</p>
          <p className={`font-heading text-h2 ${overdue > 0 ? "text-clay-500" : "text-sage-500"}`}>{overdue}</p>
          {overdue > 0 && <p className="text-caption text-clay-400">atenção!</p>}
        </div>
      </div>

      {/* Task Panel with View Switcher */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-heading text-h4 text-text-primary">Tarefas</h3>
          <div className="flex items-center gap-2">
            {/* View tabs */}
            <div className="flex bg-cream-100 rounded-lg p-0.5 border border-cream-300">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      viewMode === tab.id
                        ? "bg-white text-brand-600 shadow-sm border border-cream-300"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Task button */}
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium text-brand-500 hover:bg-brand-50 transition-colors border border-brand-200"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>

        {showAddTask && (
          <div className="flex gap-2 mb-4 animate-fade-in">
            <Input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Nome da nova tarefa..."
              autoFocus
              className="flex-1"
            />
            <button onClick={handleAddTask} className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors">
              Criar
            </button>
            <button onClick={() => setShowAddTask(false)} className="px-3 py-2.5 rounded-lg border border-cream-400 text-text-muted hover:bg-cream-100 transition-colors text-sm">
              Cancelar
            </button>
          </div>
        )}

        {sprint.tasks.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-body-sm">Nenhuma tarefa ainda. Adicione a primeira!</p>
          </div>
        ) : (
          <>
            {viewMode === "list" && (
              <ListView tasks={sortedTasks} onToggle={handleToggle} justToggled={justToggled} />
            )}
            {viewMode === "kanban" && (
              <KanbanView tasks={sortedTasks} onToggle={handleToggle} />
            )}
            {viewMode === "calendar" && (
              <CalendarView tasks={sortedTasks} />
            )}
            {viewMode === "gantt" && (
              <GanttView tasks={sortedTasks} sprintStart={sprint.createdAt || sprint.targetDate} sprintEnd={sprint.targetDate} />
            )}
          </>
        )}
      </div>

      {/* Impact Card */}
      <div className="card-surface p-6 border-l-4 border-brand-500">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-heading font-semibold text-text-primary">Impacto Projetado</h4>
            <p className="text-body-sm text-text-secondary mt-1">
              {progress === 100
                ? `Sprint concluído! Sua dimensão ${sprint.dimension} foi fortalecida significativamente.`
                : (() => {
                    const weight = DIMENSION_WEIGHT[sprint.dimension] ?? 20;
                    const remaining = 100 - progress;
                    const gain = Math.round(remaining * (weight / 100));
                    return `Ao concluir este sprint, sua prontidão na dimensão ${sprint.dimension} vai de ${progress}% → 100%. Impacto estimado no Score geral: +${gain} pts (peso ${weight}%).`;
                  })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
