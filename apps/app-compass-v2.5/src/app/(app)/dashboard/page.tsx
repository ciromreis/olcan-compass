"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Orbit,
  Trophy
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useApplicationStore } from "@/stores/applications";
import { useInterviewStore } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";
import { 
  useAuraStore, 
  useAura 
} from "@/stores/auraStore";
import { Progress, Skeleton } from "@/components/ui";
import { EvolutionStageCard } from "@/components/domain/EvolutionStageCard";
import { RoutePresencePanel } from "@/components/presence/RoutePresencePanel";
import { useHydration } from "@/hooks/use-hydration";
import { deriveGuidanceCards, deriveLifecycleStage } from "@/lib/journey";
import { derivePresencePhenotype, deriveRoutePresenceSignals } from "@/lib/presence-phenotype";
import { AuraAvatar, EvolutionBadge } from "@/components/aura/AuraVisual";

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
  const { sessions, getStats: getInterviewStats } = useInterviewStore();
  const { documents, getStats: getForgeStats } = useForgeStore();
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

    const completedInterviews = sessions.filter((s) => s.status === "completed");
    const latestCompleted = [...completedInterviews].sort((a, b) => {
      const aTime = new Date(a.completedAt || a.startedAt).getTime();
      const bTime = new Date(b.completedAt || b.startedAt).getTime();
      return bTime - aTime;
    })[0];

    if (completedInterviews.length === 0) {
      return {
        title: "Comece treinando entrevistas",
        description: "Faça sua primeira simulação e receba feedback em tempo real para ajustar sua narrativa.",
        href: "/interviews/new",
        cta: "Iniciar Simulação",
      };
    }

    if ((interviewStats.avgScore || 0) < 60 && latestCompleted) {
      const params = new URLSearchParams();
      params.set("type", latestCompleted.type);
      params.set("target", latestCompleted.target);
      params.set("language", latestCompleted.language);
      params.set("difficulty", latestCompleted.difficulty);
      if (latestCompleted.sourceDocumentId) {
        params.set("documentId", latestCompleted.sourceDocumentId);
        params.set("documentTitle", latestCompleted.sourceDocumentTitle || latestCompleted.target);
      }

      return {
        title: "Repetir com foco no seu alvo",
        description: `Sua última simulação teve score ${interviewStats.avgScore}. Refaça com o mesmo alvo para evoluir sua resposta.`,
        href: `/interviews/new?${params.toString()}`,
        cta: "Refazer Simulação",
      };
    }

    return {
      title: "Pratique para suas entrevistas",
      description: "O simulador de entrevistas te ajuda a evoluir sua prontidão com feedback em tempo real.",
      href: "/interviews/new",
      cta: "Iniciar Simulação",
    };
  }, [nextTask, appStats, applications, routes, sessions, interviewStats]);

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

  const routeSignals = useMemo(
    () => deriveRoutePresenceSignals(routes, documents, sessions, getRouteProgress),
    [routes, documents, sessions, getRouteProgress]
  );

  const effectiveRouteId = routes[0]?.id || null;
  const activeRouteSignal = routeSignals.find((signal) => signal.routeId === effectiveRouteId) || routeSignals[0] || null;
  const activePhenotype = useMemo(
    () => derivePresencePhenotype(routeSignals, effectiveRouteId || undefined),
    [routeSignals, effectiveRouteId]
  );

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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">
            {getGreeting()}, <span className="text-brand-600">{firstName}</span>
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Aqui está o panorama operacional da sua mobilidade internacional.
          </p>
        </div>
        <Link
          href="/readiness"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-50 text-brand-700 text-body-sm font-heading font-semibold hover:bg-brand-100 transition-all shadow-sm border border-brand-200/50"
        >
          <Gauge className="w-4 h-4" />
          PRONTIDÃO
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr,1fr]">
        <div className="card-surface p-6 border-2 border-brand-200/40 bg-gradient-to-br from-white via-brand-50/20 to-silver-50/50 shadow-glass-sm rounded-[2rem]">
          <div className="flex items-center gap-2 mb-4 text-brand-600">
            <Compass className="w-4 h-4" />
            <p className="text-caption font-semibold uppercase tracking-wide">Etapa prioritária</p>
          </div>
          <h2 className="font-display text-h3 text-ink-950 tracking-tight">{lifecycle.label}</h2>
          <p className="mt-3 text-body-sm text-text-secondary leading-relaxed max-w-2xl">{lifecycle.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 flex-1 bg-brand-100 rounded-full overflow-hidden">
               <div className="h-full bg-brand-500 w-[65%]" />
            </div>
            <p className="text-caption font-semibold text-brand-600 uppercase tracking-wider whitespace-nowrap">{lifecycle.progressLabel}</p>
          </div>
          <Link href={lifecycle.href} className="mt-6 inline-flex items-center gap-2 text-body-sm font-semibold text-brand-600 hover:text-brand-950 transition-all uppercase tracking-tight group">
            {lifecycle.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {focusCards.map((card) => (
          <Link key={card.title} href={card.href} className="card-surface p-6 hover:-translate-y-1 transition-all duration-300 rounded-[2rem] border border-bone-500/20 shadow-sm hover:shadow-xl group">
            <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone === "clay" ? "bg-clay-50" : "bg-sage-50"} group-hover:scale-110 transition-transform`}>
              {card.tone === "clay" ? <ShieldAlert className="h-6 h-6 text-clay-500" /> : <Layers3 className="h-6 h-6 text-sage-500" />}
            </div>
            <p className="text-body font-heading font-semibold text-ink-950 tracking-tight">{card.title}</p>
            <p className="mt-3 text-body-sm text-text-secondary leading-relaxed">{card.description}</p>
            <div className="mt-auto pt-4 flex items-center justify-between">
               <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest">{card.meta}</p>
               <span className="inline-flex items-center gap-1 text-caption font-semibold text-brand-600 uppercase tracking-tight">
                {card.cta}
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Aura Status Card — Premium Metamodern Entry */}
      <AuraStatusCard />

      {/* Next Domino — Primary Action Card */}
      <div className="card-surface p-8 lg:p-10 border-none bg-ink-950 text-white relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 opacity-60">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <p className="text-caption font-semibold uppercase tracking-wide text-gold-400">
                Próximo Salto Operacional
              </p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter text-white">
              {domino.title}
            </h2>
            <p className="text-lg text-white/60 font-medium max-w-xl leading-relaxed">
              {domino.description}
            </p>
            <p className="text-xs text-white/30 font-semibold uppercase tracking-widest">
              O ecossistema Aura sincroniza sua execução para maximizar avanço real.
            </p>
          </div>
          <Link
            href={domino.href}
            className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gold-500 text-ink-950 font-semibold text-sm uppercase tracking-tight hover:bg-white hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            {domino.cta}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Certainty Score */}
        <div className="card-surface p-8 group hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white border border-bone-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm">
              <Target className="w-6 h-6 text-brand-600 group-hover:text-white" />
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest">
                Clareza de Direção
              </p>
              <p className="text-sm font-semibold text-ink-950 tracking-tight mt-1">Consistência da Rota</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-6xl text-ink-950 leading-none tracking-tighter">
              <AnimatedNumber value={certaintyScore} suffix="%" />
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3">
             <div className="h-1.5 flex-1 bg-bone-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${certaintyScore}%` }}
                  className="h-full bg-brand-600 rounded-full"
                />
             </div>
          </div>
        </div>

        {/* COI — Ticking Odometer */}
        <div className="card-surface p-8 group hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white border border-bone-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-clay-50 flex items-center justify-center group-hover:bg-clay-500 group-hover:text-white transition-all shadow-sm">
              <TrendingUp className="w-6 h-6 text-clay-600 group-hover:text-white" />
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest">
                Inação Operacional
              </p>
              <p className="text-sm font-semibold text-ink-950 tracking-tight mt-1">Custo de Retenção</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="font-display text-5xl text-clay-600 leading-none tracking-tighter">
              R$ <AnimatedNumber value={coiPerDay} />
            </p>
            <span className="text-xs font-semibold text-ink-200 uppercase mb-1">/dia</span>
          </div>
          <p className="text-body-sm text-clay-500 font-semibold uppercase tracking-widest mt-6">
            R$ {coiMonth.toLocaleString("pt-BR")} deficit potencial/mês
          </p>
        </div>

        {/* Readiness Score */}
        <div className="card-surface p-8 group hover:-translate-y-1 transition-all rounded-[2.5rem] bg-white border border-bone-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 flex items-center justify-center group-hover:bg-sage-500 group-hover:text-white transition-all shadow-sm">
              <Gauge className="w-6 h-6 text-sage-600 group-hover:text-white" />
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-300 uppercase tracking-widest">
                Manifesto Executivo
              </p>
              <p className="text-sm font-semibold text-ink-950 tracking-tight mt-1">Sincronia de Entrega</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-display text-6xl text-ink-950 leading-none tracking-tighter">
              <AnimatedNumber value={readinessScore} suffix="%" />
            </p>
            <div className="bg-amber-100 px-3 py-1 rounded-full text-caption font-semibold text-amber-900 border border-amber-200">
              {pendingTasks} PENDENTES
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 h-1">
             {[...Array(10)].map((_, i) => (
               <div key={i} className={`flex-1 rounded-full ${i < readinessScore / 10 ? 'bg-sage-500' : 'bg-bone-100'}`} />
             ))}
          </div>
        </div>
      </div>

      {/* Two-column grid: Timeline + Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Timeline / Upcoming */}
        <div className="lg:col-span-3 card-surface p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading text-xl font-semibold text-ink-950 uppercase tracking-tight">Fluxo Operacional</h3>
            <Link href="/sprints" className="text-caption font-semibold text-brand-600 hover:text-ink-950 uppercase tracking-widest transition-colors flex items-center gap-2">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {timeline.length > 0 ? timeline.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-bone-50/50 hover:bg-white border border-transparent hover:border-bone-500/20 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${
                  item.status === "urgent" ? "bg-red-50" : item.status === "scheduled" ? "bg-blue-50" : "bg-cream-200"
                }`}>
                  {item.status === "urgent" ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : item.status === "scheduled" ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-ink-950 tracking-tight truncate">{item.label}</p>
                  <p className={`text-body-sm font-semibold uppercase tracking-wider mt-1 ${item.status === "urgent" ? "text-red-500" : "text-ink-300"}`}>
                    {item.time} {item.status === "urgent" && "• Prioritário"}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            )) : (
              <div className="text-center py-12 bg-sage-50/30 rounded-[2rem] border border-dashed border-sage-500/30">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-sage-400 opacity-50" />
                <p className="text-lg font-semibold text-ink-950">Frequência Limpa</p>
                <p className="mt-1 text-sm text-ink-300 font-medium">Seu fluxo está em harmonia hoje.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Aura Presence */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[3rem] overflow-hidden border border-bone-500/20 shadow-sm">
            <RoutePresencePanel
              signals={routeSignals}
              activeRouteId={effectiveRouteId}
              onSelectRoute={() => {}} // Internalized in signals logic for now
              title="Sinais de Presença"
              compact
            />
          </div>

          <div className="rounded-[3rem] overflow-hidden shadow-sm">
             <EvolutionStageCard onClickUpgrade={() => {}} />
          </div>
        </div>
      </div>

      {/* Grid Quick Actions */}
      <div className="space-y-6">
          <h3 className="font-heading text-xl font-semibold text-ink-950 uppercase tracking-tight">Atalhos Estratégicos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Route, label: "Rotas", href: "/routes", color: "bg-brand-50 text-brand-600" },
            { icon: FileEdit, label: "Forge", href: "/forge", color: "bg-sage-50 text-sage-600" },
            { icon: MessageSquare, label: "Treino", href: "/interviews/new", color: "bg-blue-50 text-blue-600" },
            { icon: Zap, label: "Sprints", href: "/sprints", color: "bg-amber-50 text-amber-600" },
            { icon: Store, label: "Loja", href: "/marketplace", color: "bg-clay-50 text-clay-600" },
            { icon: Calendar, label: "Apps", href: "/applications", color: "bg-purple-50 text-purple-600" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-surface p-6 group hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col items-center text-center gap-4 rounded-[2rem] border border-bone-500/10"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${action.color} group-hover:scale-110 transition-transform shadow-glass-sm`}>
                <action.icon className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-ink-950 uppercase tracking-tight">
                {action.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuraStatusCard() {
  const aura = useAura();
  const { fetchAura } = useAuraStore();

  useEffect(() => {
    fetchAura();
  }, [fetchAura]);

  if (!aura) return null;

  const needsCare = aura.energy < 30 || aura.happiness < 50;

  return (
    <Link 
      href="/aura" 
      className="block group"
    >
      <div className="card-surface p-8 rounded-[3rem] bg-white border border-bone-500/20 shadow-glass-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <AuraAvatar evolutionStage={aura.evolutionStage} size="lg" showLevel level={aura.level} />
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-4xl text-ink-950 tracking-tight">{aura.name}</h3>
                <EvolutionBadge stage={aura.evolutionStage} />
              </div>
              <p className="text-body-sm font-medium text-ink-300 mt-1 uppercase tracking-widest leading-none">
                Sua Identidade Digital Manifesta
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full grid grid-cols-2 gap-8">
            {/* Energy */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-caption font-semibold uppercase tracking-widest text-ink-300 leading-none">Energia</span>
                <span className="text-sm font-semibold text-ink-950 leading-none">{Math.round(aura.energy)}%</span>
              </div>
              <div className="h-1.5 bg-ink-950/5 rounded-full overflow-hidden p-0.5 border border-bone-400/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(aura.energy / aura.maxEnergy) * 100}%` }}
                  className={`h-full rounded-full transition-all ${aura.energy < 30 ? 'bg-red-500' : 'bg-gold-500'}`}
                />
              </div>
            </div>

            {/* Sync Progress */}
             <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-caption font-semibold uppercase tracking-widest text-ink-300 leading-none">Sincronia</span>
                <span className="text-sm font-semibold text-ink-950 leading-none">{Math.round((aura.experiencePoints / aura.xpToNextLevel) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-ink-950/5 rounded-full overflow-hidden p-0.5 border border-bone-400/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(aura.experiencePoints / aura.xpToNextLevel) * 100}%` }}
                  className="h-full rounded-full bg-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {needsCare && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-caption font-semibold text-amber-900 uppercase tracking-tight animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Aura Dissonante
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-ink-950 flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:text-ink-950 transition-all shadow-lg group-hover:scale-110">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
