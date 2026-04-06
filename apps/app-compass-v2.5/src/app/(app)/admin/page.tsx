"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, BarChart3, Shield, Settings, DollarSign, FileText, AlertTriangle,
  TrendingUp, Activity, Zap, ScrollText, Building2, Rocket, Globe2,
  ArrowUpRight, CheckCircle2, Circle, Brain, Map, Layers, ChevronRight,
} from "lucide-react";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useApplicationStore } from "@/stores/applications";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { Skeleton } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/lib/format";

const ADMIN_SECTIONS = [
  { href: "/admin/users", icon: Users, label: "Usuários", description: "Contas, roles e permissões" },
  { href: "/admin/organizations", icon: Building2, label: "Organizações", description: "Clientes B2B e limites" },
  { href: "/admin/providers", icon: Shield, label: "Provedores", description: "Aprovação e compliance" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", description: "Métricas e funis" },
  { href: "/admin/finance", icon: DollarSign, label: "Financeiro", description: "MRR, escrow e payouts" },
  { href: "/admin/content", icon: FileText, label: "Conteúdo", description: "Templates e prompts" },
  { href: "/admin/moderation", icon: AlertTriangle, label: "Moderação", description: "Reviews e disputas" },
  { href: "/admin/ai", icon: Zap, label: "IA & Prompts", description: "Prompt registry e custos" },
  { href: "/admin/observability", icon: Activity, label: "Observabilidade", description: "Erros e Web Vitals" },
  { href: "/admin/audit", icon: ScrollText, label: "Auditoria", description: "Log operacional" },
  { href: "/admin/settings", icon: Settings, label: "Configurações", description: "Feature flags e configs" },
];

type HealthTier = "green" | "amber" | "red";
function healthColor(tier: HealthTier) {
  return tier === "green" ? "bg-sage-400" : tier === "amber" ? "bg-amber-400" : "bg-clay-500";
}

export default function AdminDashboardPage() {
  const hydrated = useHydration();
  const { providers, bookings } = useMarketplaceStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { applications } = useApplicationStore();
  const { sprints } = useSprintStore();
  const { routes } = useRouteStore();
  const { auditLogs } = useAdminStore();
  const [activeTab, setActiveTab] = useState<"overview" | "modules">("overview");

  const kpis = useMemo(() => {
    if (!hydrated) return [];
    const totalRevenue = bookings.reduce((s, b) => s + b.price, 0);
    const activeProviders = providers.filter((p) => p.verified).length;
    const activeSprints = sprints.filter((s) => s.status === "active").length;
    const activeRoutes = routes.filter((r) => r.milestones.some((m) => m.status === "in_progress")).length;
    const pendingReviews = providers.flatMap((p) => p.reviews).length;

    return [
      {
        label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`,
        trend: "+18%", trendDir: "up", icon: DollarSign, color: "text-brand-500", tier: "green" as HealthTier,
      },
      {
        label: "Provedores Ativos", value: String(activeProviders),
        trend: `${providers.length} total`, trendDir: "up", icon: Shield, color: "text-clay-500", tier: activeProviders > 2 ? "green" : "amber" as HealthTier,
      },
      {
        label: "Contratações", value: String(bookings.length),
        trend: `${pendingReviews} reviews`, trendDir: "up", icon: Layers, color: "text-sage-600", tier: "green" as HealthTier,
      },
      {
        label: "Documentos Forge", value: String(documents.length),
        trend: `${sessions.length} entrevistas`, trendDir: "up", icon: FileText, color: "text-amber-600", tier: documents.length > 0 ? "green" : "amber" as HealthTier,
      },
      {
        label: "Candidaturas", value: String(applications.length),
        trend: "pipeline ativo", trendDir: "neutral", icon: TrendingUp, color: "text-brand-600", tier: "green" as HealthTier,
      },
      {
        label: "Sprints Ativos", value: String(activeSprints),
        trend: `${sprints.length} total`, trendDir: "up", icon: Zap, color: "text-purple-600", tier: activeSprints > 0 ? "green" : "amber" as HealthTier,
      },
      {
        label: "Rotas Ativas", value: String(activeRoutes || routes.length),
        trend: `${routes.length} configuradas`, trendDir: "up", icon: Map, color: "text-emerald-600", tier: routes.length > 0 ? "green" : "amber" as HealthTier,
      },
      {
        label: "Sessões de Aura", value: String(sessions.length),
        trend: "análise psic.", trendDir: "up", icon: Brain, color: "text-violet-600", tier: "green" as HealthTier,
      },
    ];
  }, [hydrated, providers, bookings, documents, sessions, applications, sprints, routes]);

  const recentActivity = useMemo(() => {
    if (!hydrated) return [];
    const items: Array<{ event: string; time: string; type: string }> = [];
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sortedBookings.slice(0, 2).forEach((b) => {
      items.push({ event: `Contratação: ${b.providerName} — ${b.serviceTitle} (${b.status})`, time: b.date, type: b.status === "cancelled" ? "dispute" : "provider" });
    });
    const allReviews = providers.flatMap((p) => p.reviews);
    const sortedReviews = [...allReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sortedReviews.slice(0, 2).forEach((r) => {
      items.push({ event: `Nova review: ${r.userName} avaliou com ${r.rating}★`, time: r.createdAt, type: "milestone" });
    });
    auditLogs.slice(0, 3).forEach((entry) => {
      items.push({ event: `Auditoria: ${entry.summary}`, time: entry.at, type: "audit" });
    });
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  }, [hydrated, bookings, providers, auditLogs]);

  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* God Mode Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001338] via-[#0a1a4a] to-[#152060] p-8 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] -ml-36 -mb-36" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-white/20 backdrop-blur-md">
              <Rocket className="w-3.5 h-3.5 text-brand-400" /> Startup CEO · Platinum God Mode
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Executive <span className="text-brand-300">Command</span> Center
            </h1>
            <p className="text-white/60 mt-2 text-base font-medium max-w-xl">
              Monitoramento sistêmico e governança em tempo real de todo o ecossistema Olcan Global.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Uptime Global</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-sm font-mono font-bold text-white/90">99.98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-cream-300">
        {(["overview", "modules"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {tab === "overview" ? "Visão Geral" : "Módulos Admin"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* KPI Matrix */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card-surface p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color.replace("text-", "bg-").replace("500", "100").replace("600", "100")}`}>
                    <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${healthColor(kpi.tier)}`} />
                  </div>
                </div>
                <p className="text-caption text-text-muted">{kpi.label}</p>
                <p className="font-heading text-h2 text-text-primary mt-0.5">{kpi.value}</p>
                <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${kpi.tier === "green" ? "text-sage-600" : kpi.tier === "amber" ? "text-amber-600" : "text-clay-600"}`}>
                  {kpi.trendDir === "up" ? <ArrowUpRight className="w-3 h-3" /> : null}
                  {kpi.trend}
                </p>
              </div>
            ))}
          </div>

          {/* System Health & Activity */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Health indicators */}
            <div className="lg:col-span-4 card-surface p-6 bg-white/40 backdrop-blur-xl border border-white/60">
              <h3 className="font-heading text-h4 text-text-primary mb-5 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-brand-500" /> Saúde do Ecossistema
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Marketing Site", status: "green" as HealthTier, detail: "V2.5 · Visuals Tuned", icon: Globe2 },
                  { label: "CMS Payload", status: "green" as HealthTier, detail: "Lexical & Postgres · Active", icon: FileText },
                  { label: "Compass Platform", status: "green" as HealthTier, detail: "Core V2.5 · Stable", icon: Rocket },
                  { label: "Canal de Comunidade", status: "green" as HealthTier, detail: "Payload Sync · Online", icon: Users },
                  { label: "Engine de Tarefas", status: "green" as HealthTier, detail: "Kanban/Gantt · Synced", icon: Layers },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/50 border border-white/60 shadow-sm hover:shadow-md transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-cream-100/50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-bold text-olcan-navy">{item.label}</p>
                      <p className="text-[11px] text-text-muted leading-none mt-1 uppercase tracking-tight">{item.detail}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-sage-100 ${healthColor(item.status)} shadow-[0_0_8px_rgba(52,211,153,0.4)]`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-8 card-surface p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-h4 text-text-primary flex items-center gap-2">
                  <ScrollText className="w-4.5 h-4.5 text-brand-500" /> Fluxo em Tempo Real
                </h3>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Ao Vivo</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50/50 border border-cream-100 hover:border-brand-200 hover:bg-white transition-all shadow-sm group">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-sm ${
                        item.type === "dispute" ? "bg-clay-500"
                        : item.type === "provider" ? "bg-brand-500 font-bold"
                        : item.type === "audit" ? "bg-text-muted"
                        : "bg-sage-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-text-primary font-medium leading-tight group-hover:text-brand-600 transition-colors truncate">{item.event}</p>
                        <span className="text-[10px] text-text-muted mt-1 inline-block uppercase tracking-wide">{formatDate(item.time)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Activity className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-20" />
                    <p className="text-body-sm text-text-muted font-medium">Iniciando varredura de atividade...</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xl relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg leading-tight">Relatório de Consolidação</h4>
                    <p className="text-white/70 text-xs mt-1">Gere um report detalhado da transição V2.5 para auditoria executiva.</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-50 transition-colors shadow-lg">Gerar Agora</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "modules" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ADMIN_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="card-surface p-5 group hover:-translate-y-0.5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                  <section.icon className="w-5 h-5 text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 transition-colors group-hover:translate-x-0.5" />
              </div>
              <h3 className="font-heading text-h4 text-text-primary group-hover:text-brand-600 transition-colors">{section.label}</h3>
              <p className="text-caption text-text-muted mt-1">{section.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
