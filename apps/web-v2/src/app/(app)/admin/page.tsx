"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users, BarChart3, Shield, Settings, DollarSign, FileText, AlertTriangle, TrendingUp, Activity, Zap, ScrollText, Building2 } from "lucide-react";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useApplicationStore } from "@/stores/applications";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/lib/format";

const SECTIONS = [
  { href: "/admin/users", icon: Users, label: "Usuários", description: "Gerenciar contas, roles e permissões" },
  { href: "/admin/organizations", icon: Building2, label: "Organizações", description: "Gerenciar clientes B2B (Membros, Limites)" },
  { href: "/admin/providers", icon: Shield, label: "Provedores", description: "Aprovação, PEI e compliance" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", description: "Métricas, cohorts e funis" },
  { href: "/admin/finance", icon: DollarSign, label: "Financeiro", description: "MRR, escrow, payouts e disputas" },
  { href: "/admin/content", icon: FileText, label: "Conteúdo", description: "Templates, prompts e question bank" },
  { href: "/admin/moderation", icon: AlertTriangle, label: "Moderação", description: "Reviews, reports e disputes" },
  { href: "/admin/ai", icon: Zap, label: "IA & Prompts", description: "Prompt registry, jobs e custos" },
  { href: "/admin/observability", icon: Activity, label: "Observabilidade", description: "Erros frontend e Web Vitals" },
  { href: "/admin/audit", icon: ScrollText, label: "Auditoria", description: "Log operacional e trilha de ações" },
  { href: "/admin/settings", icon: Settings, label: "Configurações", description: "Feature flags, limites e configs" },
];

export default function AdminDashboardPage() {
  const hydrated = useHydration();
  const { providers, bookings } = useMarketplaceStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { applications } = useApplicationStore();
  const { sprints } = useSprintStore();
  const { routes } = useRouteStore();
  const { auditLogs } = useAdminStore();

  const stats = useMemo(() => {
    if (!hydrated) return [];
    const totalBookingRevenue = bookings.reduce((s, b) => s + b.price, 0);
    const activeProviders = providers.filter((p) => p.verified).length;
    return [
      { label: "Provedores", value: String(providers.length), delta: `${activeProviders} verificados`, icon: Shield, color: "text-clay-500" },
      { label: "Contratações", value: String(bookings.length), delta: `R$ ${totalBookingRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-moss-500" },
      { label: "Documentos Forge", value: String(documents.length), delta: `${sessions.length} entrevistas`, icon: FileText, color: "text-sage-500" },
      { label: "Candidaturas", value: String(applications.length), delta: `${sprints.length} sprints · ${routes.length} rotas`, icon: TrendingUp, color: "text-moss-500" },
    ];
  }, [hydrated, providers, bookings, documents, sessions, applications, sprints, routes]);

  const allReviews = useMemo(() => providers.flatMap((p) => p.reviews), [providers]);

  const recentActivity = useMemo(() => {
    if (!hydrated) return [];
    const items: Array<{ event: string; time: string; type: string }> = [];

    const sortedBookings = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sortedBookings.slice(0, 2).forEach((b) => {
      items.push({ event: `Contratação: ${b.providerName} — ${b.serviceTitle} (${b.status})`, time: b.date, type: b.status === "cancelled" ? "dispute" : "provider" });
    });

    const sortedReviews = [...allReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sortedReviews.slice(0, 2).forEach((r) => {
      items.push({ event: `Nova review: ${r.userName} avaliou com ${r.rating}★`, time: r.createdAt, type: "milestone" });
    });

    auditLogs.slice(0, 3).forEach((entry) => {
      items.push({
        event: `Auditoria: ${entry.summary}`,
        time: entry.at,
        type: "audit",
      });
    });

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  }, [hydrated, bookings, allReviews, auditLogs]);

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Visão geral da plataforma Olcan Compass" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-surface p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-caption text-text-muted">{stat.label}</p>
            <p className="font-heading text-h2 text-text-primary">{stat.value}</p>
            <p className={`text-caption ${stat.color} mt-1`}>{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="card-surface p-5 group hover:-translate-y-0.5 transition-transform">
            <section.icon className="w-6 h-6 text-moss-500 mb-3" />
            <h3 className="font-heading text-h4 text-text-primary group-hover:text-moss-500 transition-colors">{section.label}</h3>
            <p className="text-caption text-text-muted mt-1">{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-moss-500" /> Atividade Recente</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === "dispute" ? "bg-clay-500" : item.type === "provider" ? "bg-moss-500" : item.type === "audit" ? "bg-text-muted" : "bg-sage-400"}`} />
              <p className="text-body-sm text-text-primary flex-1">{item.event}</p>
              <span className="text-caption text-text-muted flex-shrink-0">{formatDate(item.time)}</span>
            </div>
          )) : (
            <p className="text-body-sm text-text-muted text-center py-4">Nenhuma atividade recente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
