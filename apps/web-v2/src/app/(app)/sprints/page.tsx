"use client";

import Link from "next/link";
import { Plus, Zap, Clock, CheckCircle, ArrowRight, Target, TrendingUp, Pause } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useHydration } from "@/hooks/use-hydration";
import { EmptyState, PageHeader, Progress, Skeleton } from "@/components/ui";

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function SprintsPage() {
  const ready = useHydration();
  const { sprints, getSprintProgress, getTotalPendingTasks } = useSprintStore();

  const activeSprints = sprints.filter((s) => s.status === "active");
  const completedSprints = sprints.filter((s) => s.status === "completed");
  const pendingTasks = getTotalPendingTasks();

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Sprints de Prontidão"
        subtitle="Planos de ação focados para fechar gaps rapidamente"
        actions={
          <Link href="/sprints/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
            <Plus className="w-4 h-4" /> Novo Sprint
          </Link>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <Zap className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{activeSprints.length}</p>
          <p className="text-caption text-text-muted">Sprints ativos</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Target className="w-5 h-5 text-clay-500 mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{pendingTasks}</p>
          <p className="text-caption text-text-muted">Tarefas pendentes</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingUp className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="font-heading text-h2 text-text-primary">{completedSprints.length}</p>
          <p className="text-caption text-text-muted">Concluídos</p>
        </div>
      </div>

      {sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="Nenhum sprint criado"
          description="Crie um sprint para organizar ações focadas na sua prontidão."
          action={<Link href="/sprints/new" className="text-brand-500 font-medium hover:underline">Criar sprint →</Link>}
        />
      ) : (
      <div className="space-y-4">
        {sprints.map((sprint) => {
          const progress = getSprintProgress(sprint.id);
          const completedCount = sprint.tasks.filter((t) => t.done).length;
          const dl = daysUntil(sprint.targetDate);
          return (
            <Link key={sprint.id} href={`/sprints/${sprint.id}`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform block">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  sprint.status === "completed" ? "bg-sage-50" : sprint.status === "paused" ? "bg-amber-50" : "bg-brand-50"
                }`}>
                  {sprint.status === "paused" ? (
                    <Pause className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Zap className={`w-6 h-6 ${sprint.status === "completed" ? "text-sage-500" : "text-brand-500"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-h4 text-text-primary">{sprint.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-body-sm text-text-secondary">
                    <span className="px-2 py-0.5 rounded-full bg-cream-200 text-caption">{sprint.dimension}</span>
                    {sprint.status === "active" ? (
                      <span className={`flex items-center gap-1 ${dl <= 14 ? "text-clay-500" : "text-brand-500"}`}>
                        <Clock className="w-3.5 h-3.5" />{dl} dias restantes
                      </span>
                    ) : sprint.status === "paused" ? (
                      <span className="flex items-center gap-1 text-amber-500"><Pause className="w-3.5 h-3.5" />Pausado</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sage-500"><CheckCircle className="w-3.5 h-3.5" />Concluído</span>
                    )}
                    <span className="text-text-muted">{completedCount}/{sprint.tasks.length} tarefas</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-20">
                    <p className="text-body-sm font-bold text-text-primary text-right mb-1">{progress}%</p>
                    <Progress value={progress} size="sm" variant={sprint.status === "completed" ? "moss" : sprint.status === "paused" ? "clay" : "moss"} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
