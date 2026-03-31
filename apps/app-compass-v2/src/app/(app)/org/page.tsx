"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users, BarChart3, Settings, TrendingUp, Shield, ArrowRight, UserPlus } from "lucide-react";
import { useHydration } from "@/hooks";
import { useApplicationStore } from "@/stores/applications";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { useOrgStore } from "@/stores/org";
import { PageHeader, Skeleton } from "@/components/ui";
import { formatRelativeTime } from "@/lib/format";

export default function OrgDashboardPage() {
  const hydrated = useHydration();
  const { organization, members, activity } = useOrgStore();
  const { applications } = useApplicationStore();
  const { routes } = useRouteStore();
  const { sprints } = useSprintStore();

  const stats = useMemo(() => {
    const activeMembers = members.filter((member) => member.status === "active").length;
    const scoredMembers = members.filter((member) => typeof member.score === "number") as Array<typeof members[number] & { score: number }>;
    const avgScore = scoredMembers.length > 0
      ? Math.round(scoredMembers.reduce((sum, member) => sum + member.score, 0) / scoredMembers.length)
      : 0;
    const approvedApplications = applications.filter((application) => application.status === "accepted").length;
    const acceptedRate = applications.length > 0
      ? Math.round((approvedApplications / applications.length) * 100)
      : 0;

    return {
      activeMembers,
      avgScore,
      routesCount: routes.length,
      approvedApplications,
      acceptedRate,
      activeSprints: sprints.filter((sprint) => sprint.status === "active").length,
    };
  }, [applications, members, routes.length, sprints]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Portal Organizacional" subtitle={organization?.name || "Carregando..."} actions={
        <Link href="/org/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Settings className="w-4 h-4" /> Configurações
        </Link>
      } />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <Users className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Membros</p>
          <p className="font-heading text-h2 text-text-primary">{stats.activeMembers}</p>
          <p className="text-caption text-brand-500 mt-1">{members.length} no total</p>
        </div>
        <div className="card-surface p-5">
          <TrendingUp className="w-5 h-5 text-clay-500 mb-2" />
          <p className="text-caption text-text-muted">Score Médio</p>
          <p className="font-heading text-h2 text-text-primary">{stats.avgScore}</p>
          <p className="text-caption text-brand-500 mt-1">{stats.activeSprints} sprints ativos</p>
        </div>
        <div className="card-surface p-5">
          <BarChart3 className="w-5 h-5 text-sage-500 mb-2" />
          <p className="text-caption text-text-muted">Rotas Ativas</p>
          <p className="font-heading text-h2 text-text-primary">{stats.routesCount}</p>
        </div>
        <div className="card-surface p-5">
          <Shield className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-caption text-text-muted">Aprovados</p>
          <p className="font-heading text-h2 text-brand-500">{stats.approvedApplications}</p>
          <p className="text-caption text-text-muted mt-1">{stats.acceptedRate}% das candidaturas</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/org/members" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <Users className="w-6 h-6 text-brand-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Membros</h3><p className="text-body-sm text-text-secondary">Ver e gerenciar membros da organização</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
        <Link href="/org/analytics" className="card-surface p-5 flex items-center gap-4 hover:bg-cream-100 transition-colors">
          <BarChart3 className="w-6 h-6 text-clay-500" />
          <div className="flex-1"><h3 className="font-heading text-h4 text-text-primary">Relatórios</h3><p className="text-body-sm text-text-secondary">Analytics agregados e cohorts</p></div>
          <ArrowRight className="w-5 h-5 text-text-muted" />
        </Link>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Atividade Recente</h3>
          <Link href="/org/members" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-caption font-medium"><UserPlus className="w-3 h-3" /> Convidar</Link>
        </div>
        <div className="space-y-3">
          {activity.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50">
              <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
              <p className="text-body-sm text-text-primary flex-1">{item.event}</p>
              <span className="text-caption text-text-muted flex-shrink-0">{formatRelativeTime(item.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
