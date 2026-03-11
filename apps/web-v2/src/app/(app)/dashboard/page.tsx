"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Target,
  FileEdit,
  Calendar,
  Gauge,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Route,
  MessageSquare,
  Store,
  Zap,
  Compass,
  ShieldAlert,
  Layers3,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useApplicationStore } from "@/stores/applications";
import { useInterviewStore } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";
import { Progress, Skeleton } from "@/components/ui";
import { useHydration } from "@/hooks/use-hydration";
import { deriveGuidanceCards, deriveLifecycleStage } from "@/lib/journey";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}{suffix}</>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const ready = useHydration();
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] || "viajante";

  const { sprints, getSprintProgress, getTotalPendingTasks, getNextTask } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { applications, getStats: getAppStats } = useApplicationStore();
  const { getStats: getInterviewStats } = useInterviewStore();
  const { getStats: getForgeStats } = useForgeStore();
  const forgeStats = getForgeStats();

  const pendingTasks = getTotalPendingTasks();
  const nextTask = getNextTask();
  const appStats = getAppStats();
  const interviewStats = getInterviewStats();

  // Compute real Certainty Score from route progress + sprint progress
  const avgRouteProgress = useMemo(() => {
    if (routes.length === 0) return 0;
    return Math.round(routes.reduce((sum, r) => sum + getRouteProgress(r.id), 0) / routes.length);
  }, [routes, getRouteProgress]);

  const avgSprintProgress = useMemo(() => {
    const active = sprints.filter((s) => s.status !== "paused");
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, s) => sum + getSprintProgress(s.id), 0) / active.length);
  }, [sprints, getSprintProgress]);

  const certaintyScore = Math.min(98, Math.round(avgRouteProgress * 0.4 + avgSprintProgress * 0.3 + (interviewStats.avgScore || 0) * 0.3));
  const readinessScore = Math.min(98, Math.round(avgSprintProgress * 0.5 + avgRouteProgress * 0.3 + (appStats.submitted / Math.max(1, appStats.total)) * 100 * 0.2));

  // COI: higher when certainty is low — urgency driver
  const coiPerDay = Math.round(350 * (1 - certaintyScore / 100));
  const coiMonth = coiPerDay * 30;

  // Compute real Next Domino from stores
  const domino = useMemo(() => {
    if (nextTask) {
      return {
        title: nextTask.task.name,
        description: `Sprint "${nextTask.sprint.name}" — complete esta tarefa para avançar sua dimensão ${nextTask.sprint.dimension}.`,
        href: `/sprints/${nextTask.sprint.id}`,
        cta: "Ir ao Sprint",
      };
    }
    if (appStats.urgentCount > 0) {
      const urgent = applications.find(
        (a) => a.status !== "submitted" && a.status !== "accepted" && a.status !== "rejected" &&
          new Date(a.deadline).getTime() < Date.now() + 14 * 86400000
      );
      if (urgent) {
        return {
          title: `Deadline se aproxima: ${urgent.program}`,
          description: `Faltam poucos dias para o prazo. Verifique seus documentos e finalize a candidatura.`,
          href: `/applications/${urgent.id}`,
          cta: "Ver Candidatura",
        };
      }
    }
    if (routes.length === 0) {
      return {
        title: "Defina sua primeira rota",
        description: "Escolha um destino e tipo de mobilidade para gerar seu plano personalizado.",
        href: "/routes",
        cta: "Explorar Rotas",
      };
    }
    return {
      title: "Pratique para suas entrevistas",
      description: "O simulador de entrevistas te ajuda a se preparar com feedback em tempo real.",
      href: "/interviews/new",
      cta: "Iniciar Simulação",
    };
  }, [nextTask, appStats, applications, routes]);

  // Build real timeline from upcoming tasks/deadlines
  const timeline = useMemo(() => {
    const items: { time: string; label: string; status: string; href: string }[] = [];

    // Sprint tasks due soon
    sprints
      .filter((s) => s.status === "active")
      .forEach((sprint) => {
        sprint.tasks
          .filter((t) => !t.done)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 2)
          .forEach((task) => {
            const days = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000);
            const time = days <= 0 ? "Atrasado" : days === 1 ? "Amanhã" : days <= 7 ? `Em ${days} dias` : new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            items.push({
              time,
              label: `${task.name} (${sprint.dimension})`,
              status: days <= 0 ? "urgent" : days <= 3 ? "urgent" : "pending",
              href: `/sprints/${sprint.id}`,
            });
          });
      });

    // Application deadlines
    applications
      .filter((a) => a.status !== "submitted" && a.status !== "accepted" && a.status !== "rejected")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 2)
      .forEach((app) => {
        const days = Math.ceil((new Date(app.deadline).getTime() - Date.now()) / 86400000);
        items.push({
          time: days <= 0 ? "Vencido" : days <= 7 ? `Em ${days} dias` : new Date(app.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          label: `Deadline: ${app.program}`,
          status: days <= 14 ? "urgent" : "scheduled",
          href: `/applications/${app.id}`,
        });
      });

    return items
      .sort((a, b) => {
        if (a.status === "urgent" && b.status !== "urgent") return -1;
        if (b.status === "urgent" && a.status !== "urgent") return 1;
        return 0;
      })
      .slice(0, 5);
  }, [sprints, applications]);

  // Real progress per area
  const docProgress = useMemo(() => {
    // Combine application doc readiness + forge document scores
    const allAppDocs = applications.flatMap((a) => a.documents);
    const appDocReady = allAppDocs.length > 0
      ? (allAppDocs.filter((d) => d.status === "ready").length / allAppDocs.length) * 100
      : 0;
    const forgeAvg = forgeStats.avgScore || 0;
    // Weight: 50% app docs readiness + 50% forge quality
    if (allAppDocs.length === 0 && forgeStats.total === 0) return 0;
    if (allAppDocs.length === 0) return forgeAvg;
    if (forgeStats.total === 0) return Math.round(appDocReady);
    return Math.round(appDocReady * 0.5 + forgeAvg * 0.5);
  }, [applications, forgeStats]);

  const interviewProgress = Math.min(100, (interviewStats.totalSessions || 0) * 20);

  const appProgress = useMemo(() => {
    if (applications.length === 0) return 0;
    return Math.round((appStats.submitted / applications.length) * 100);
  }, [applications, appStats]);

  const lifecycle = useMemo(() => deriveLifecycleStage({
    hasRoutes: routes.length > 0,
    avgSprintProgress,
    pendingTasks,
    docProgress,
    interviewProgress,
    submittedApplications: appStats.submitted,
    urgentApplications: appStats.urgentCount,
  }), [routes.length, avgSprintProgress, pendingTasks, docProgress, interviewProgress, appStats.submitted, appStats.urgentCount]);

  const focusCards = useMemo(() => deriveGuidanceCards({
    hasRoutes: routes.length > 0,
    avgSprintProgress,
    pendingTasks,
    docProgress,
    interviewProgress,
    submittedApplications: appStats.submitted,
    urgentApplications: appStats.urgentCount,
  }, lifecycle), [routes.length, avgSprintProgress, pendingTasks, docProgress, interviewProgress, appStats.submitted, appStats.urgentCount, lifecycle]);

  if (!ready) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-48" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">
            {getGreeting()}, <span className="text-brand-500">{firstName}</span>
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Aqui está o panorama da sua jornada de mobilidade.
          </p>
        </div>
        <Link
          href="/readiness"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-50 text-brand-600 text-body-sm font-heading font-semibold hover:bg-brand-100 transition-colors"
        >
          <Gauge className="w-4 h-4" />
          Ver Prontidão
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr,1fr]">
        <div className="card-surface p-6 border border-brand-200/70 bg-gradient-to-br from-white to-brand-50/40">
          <div className="flex items-center gap-2 mb-3 text-brand-500">
            <Compass className="w-4 h-4" />
            <p className="text-caption font-heading font-semibold uppercase tracking-wider">Etapa da jornada</p>
          </div>
          <h2 className="font-heading text-h3 text-text-primary">{lifecycle.label}</h2>
          <p className="mt-2 text-body text-text-secondary max-w-2xl">{lifecycle.description}</p>
          <p className="mt-3 text-body-sm text-text-muted">{lifecycle.progressLabel}</p>
          <Link href={lifecycle.href} className="mt-5 inline-flex items-center gap-2 text-body-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            {lifecycle.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {focusCards.map((card) => (
          <Link key={card.title} href={card.href} className="card-surface p-5 hover:-translate-y-0.5 transition-transform">
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.tone === "clay" ? "bg-clay-50" : "bg-sage-50"}`}>
              {card.tone === "clay" ? <ShieldAlert className="h-5 w-5 text-clay-500" /> : <Layers3 className="h-5 w-5 text-sage-500" />}
            </div>
            <p className="text-body-sm font-heading font-semibold text-text-primary">{card.title}</p>
            <p className="mt-2 text-body-sm text-text-secondary">{card.description}</p>
            <p className="mt-3 text-caption text-text-muted">{card.meta}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-brand-600">
              {card.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Next Domino — Primary Action Card */}
      <div className="card-surface p-6 lg:p-8 border-l-4 border-brand-500 relative overflow-hidden noise-overlay">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <p className="text-caption font-heading font-semibold uppercase tracking-wider text-brand-400">
                Próximo Dominó
              </p>
            </div>
            <h2 className="font-heading text-h3 text-text-primary mb-2">
              {domino.title}
            </h2>
            <p className="text-body text-text-secondary max-w-lg">
              {domino.description}
            </p>
          </div>
          <Link
            href={domino.href}
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors shadow-sm"
          >
            {domino.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Certainty Score */}
        <div className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <Target className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-body-sm font-heading font-semibold text-text-secondary">
                Score de Certeza
              </p>
              <p className="text-caption text-text-muted">Probabilidade global</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="font-heading text-h1 text-text-primary leading-none">
              <AnimatedNumber value={certaintyScore} suffix="%" />
            </p>
          </div>
          <Progress value={certaintyScore} variant="moss" size="sm" className="mt-3" />
        </div>

        {/* COI — Ticking Odometer */}
        <div className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-clay-50 flex items-center justify-center group-hover:bg-clay-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-clay-500" />
            </div>
            <div>
              <p className="text-body-sm font-heading font-semibold text-text-secondary">
                Custo de Inação
              </p>
              <p className="text-caption text-text-muted">Potencial perdido por dia</p>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <p className="font-heading text-h1 text-clay-600 leading-none">
              R$ <AnimatedNumber value={coiPerDay} />
            </p>
            <span className="text-body text-text-muted mb-0.5">/dia</span>
          </div>
          <p className="text-caption text-clay-500 font-medium mt-2">
            R$ {coiMonth.toLocaleString("pt-BR")} perdidos este mês
          </p>
        </div>

        {/* Readiness Score */}
        <div className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center group-hover:bg-sage-100 transition-colors">
              <Gauge className="w-5 h-5 text-sage-500" />
            </div>
            <div>
              <p className="text-body-sm font-heading font-semibold text-text-secondary">
                Prontidão
              </p>
              <p className="text-caption text-text-muted">Documentação e preparação</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="font-heading text-h1 text-text-primary leading-none">
              <AnimatedNumber value={readinessScore} suffix="%" />
            </p>
            <span className="text-caption text-amber-600 font-medium mb-1">{pendingTasks} tarefas pendentes</span>
          </div>
          <Progress value={readinessScore} variant={readinessScore >= 60 ? "moss" : "clay"} size="sm" className="mt-3" />
        </div>
      </div>

      {/* Two-column grid: Timeline + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline / Upcoming */}
        <div className="lg:col-span-3 card-surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-h4 text-text-primary">Próximos Passos</h3>
            <Link href="/sprints" className="text-caption text-brand-500 hover:text-brand-600 font-medium transition-colors">
              Ver tudo →
            </Link>
          </div>
          <div className="space-y-3">
            {timeline.length > 0 ? timeline.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream-100 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.status === "urgent" ? "bg-red-50" : item.status === "scheduled" ? "bg-blue-50" : "bg-cream-200"
                }`}>
                  {item.status === "urgent" ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : item.status === "scheduled" ? (
                    <Clock className="w-4 h-4 text-blue-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary truncate">{item.label}</p>
                  <p className={`text-caption ${item.status === "urgent" ? "text-red-500 font-medium" : "text-text-muted"}`}>
                    {item.time} {item.status === "urgent" && "— Urgente"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </Link>
            )) : (
              <div className="text-center py-6 text-text-muted">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-sage-400" />
                <p className="text-body-sm">Nenhuma tarefa urgente. Bom trabalho!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading text-h4 text-text-primary">Ações Rápidas</h3>
          <div className="space-y-3">
            {[
              { icon: Route, label: "Explorar Rotas", href: "/routes", description: `${routes.length} rotas ativas`, color: "bg-brand-50 text-brand-500" },
              { icon: FileEdit, label: "Forge", href: "/forge", description: `${forgeStats.total} docs · Score ${forgeStats.avgScore || "—"}`, color: "bg-sage-50 text-sage-500" },
              { icon: MessageSquare, label: "Simular Entrevista", href: "/interviews/new", description: `Score médio: ${interviewStats.avgScore || "—"}`, color: "bg-blue-50 text-blue-500" },
              { icon: Zap, label: "Sprints", href: "/sprints", description: `${pendingTasks} tarefas pendentes`, color: "bg-amber-50 text-amber-500" },
              { icon: Store, label: "Marketplace", href: "/marketplace", description: "Encontre especialistas", color: "bg-clay-50 text-clay-500" },
              { icon: Calendar, label: "Candidaturas", href: "/applications", description: `${appStats.total} candidaturas`, color: "bg-purple-50 text-purple-500" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card-surface p-4 group hover:-translate-y-0.5 transition-all flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color.split(" ")[0]} group-hover:scale-105 transition-transform`}>
                  <action.icon className={`w-5 h-5 ${action.color.split(" ")[1]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-heading font-semibold text-text-primary">
                    {action.label}
                  </p>
                  <p className="text-caption text-text-muted">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Overview Strip */}
      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-5">Progresso por Área</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Progress label="Rotas" value={avgRouteProgress} variant={avgRouteProgress >= 50 ? "moss" : "clay"} showLabel size="md" />
          <Progress label="Documentação" value={docProgress} variant={docProgress >= 50 ? "moss" : "clay"} showLabel size="md" />
          <Progress label="Entrevistas" value={interviewProgress} variant={interviewProgress >= 50 ? "moss" : "clay"} showLabel size="md" />
          <Progress label="Candidaturas" value={appProgress} variant={appProgress >= 50 ? "moss" : "clay"} showLabel size="md" />
        </div>
      </div>
    </div>
  );
}
