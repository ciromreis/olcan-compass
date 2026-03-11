"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Zap, CheckCircle, Circle, Plus, Trash2,
  Pause, Play, AlertTriangle, TrendingUp, CalendarDays,
} from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useHydration } from "@/hooks";
import { Input, PageHeader, Progress, Skeleton, useToast } from "@/components/ui";

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

const DIMENSION_WEIGHT: Record<string, number> = {
  Financeira: 30,
  Documental: 25,
  Linguística: 20,
  Psicológica: 15,
  Logística: 10,
};

export default function SprintDetailPage() {
  const params = useParams();
  const sprintId = params.id as string;
  const hydrated = useHydration();
  const { toast } = useToast();

  const { getSprintById, getSprintProgress, toggleTask, addTask, removeTask, pauseSprint, resumeSprint } = useSprintStore();
  const sprint = hydrated ? getSprintById(sprintId) : undefined;
  const progress = getSprintProgress(sprintId);

  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [justToggled, setJustToggled] = useState<string | null>(null);

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

  const handleToggle = (taskId: string) => {
    const task = sprint.tasks.find((item) => item.id === taskId);
    toggleTask(sprintId, taskId);
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

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    const taskName = newTaskName.trim();
    const id = `t_${Date.now()}`;
    const dueDate = sprint.targetDate;
    addTask(sprintId, { id, name: taskName, done: false, dueDate });
    setNewTaskName("");
    setShowAddTask(false);
    toast({
      title: "Tarefa adicionada",
      description: `${taskName} entrou neste sprint com prazo alinhado ao objetivo atual.`,
      variant: "success",
    });
  };

  const handlePause = () => {
    pauseSprint(sprintId);
    toast({
      title: "Sprint pausado",
      description: "Você pode retomar este sprint quando quiser.",
      variant: "info",
    });
  };

  const handleResume = () => {
    resumeSprint(sprintId);
    toast({
      title: "Sprint retomado",
      description: "O sprint voltou para acompanhamento ativo.",
      variant: "success",
    });
  };

  const handleRemoveTask = (taskId: string, taskName: string) => {
    removeTask(sprintId, taskId);
    toast({
      title: "Tarefa removida",
      description: `${taskName} foi removida deste sprint.`,
      variant: "warning",
    });
  };

  const statusLabel = sprint.status === "completed" ? "Concluído" : sprint.status === "paused" ? "Pausado" : "Ativo";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref="/sprints"
        title={sprint.name}
        subtitle={`${statusLabel} • ${sprint.dimension}`}
        actions={sprint.status === "active" ? (
          <button
            onClick={handlePause}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors"
          >
            <Pause className="w-4 h-4" /> Pausar
          </button>
        ) : sprint.status === "paused" ? (
          <button
            onClick={handleResume}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors"
          >
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

      {/* Task List */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Tarefas</h3>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium text-brand-500 hover:bg-brand-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
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
          </div>
        )}

        <div className="space-y-2">
          {sortedTasks.map((task) => {
            const isOverdue = !task.done && new Date(task.dueDate) < new Date();
            const isJustToggled = justToggled === task.id;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  task.done
                    ? "bg-brand-50/50"
                    : isOverdue
                    ? "bg-clay-50/50 border border-clay-200"
                    : "bg-cream-50 hover:bg-cream-100"
                } ${isJustToggled ? "scale-[1.01] shadow-sm" : ""}`}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className="flex-shrink-0 transition-transform hover:scale-110"
                >
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
                  {isOverdue && (
                    <AlertTriangle className="w-3.5 h-3.5 text-clay-400" />
                  )}
                  <span className={`text-caption flex items-center gap-1 ${isOverdue ? "text-clay-400 font-medium" : "text-text-muted"}`}>
                    <CalendarDays className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <button
                    onClick={() => handleRemoveTask(task.id, task.name)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-cream-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-clay-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
