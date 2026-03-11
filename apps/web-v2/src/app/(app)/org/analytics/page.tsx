"use client";

import { useMemo } from "react";
import { BarChart3, Users, TrendingUp, Globe, Download, Target } from "lucide-react";
import { useHydration } from "@/hooks";
import { useApplicationStore } from "@/stores/applications";
import { useOrgStore } from "@/stores/org";
import { usePsychStore } from "@/stores/psych";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { PageHeader, Skeleton } from "@/components/ui";
import { downloadCsv } from "@/lib/file-export";
import { normalizeForComparison } from "@/lib/text-normalize";

function computeDimensionScore(sprints: ReturnType<typeof useSprintStore.getState>["sprints"], dimension: string): number {
  const normalizedDimension = normalizeForComparison(dimension);
  const matching = sprints.filter((sprint) =>
    normalizeForComparison(sprint.dimension).includes(normalizedDimension)
  );
  if (matching.length === 0) return 0;
  const totalTasks = matching.reduce((sum, sprint) => sum + sprint.tasks.length, 0);
  if (totalTasks === 0) return 0;
  const doneTasks = matching.reduce((sum, sprint) => sum + sprint.tasks.filter((task) => task.done).length, 0);
  return Math.round((doneTasks / totalTasks) * 100);
}

function monthLabel(date: Date): string {
  const name = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function isSameMonth(candidate: string, base: Date): boolean {
  if (!candidate) return false;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return false;
  return date.getMonth() === base.getMonth() && date.getFullYear() === base.getFullYear();
}

function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

export default function OrgAnalyticsPage() {
  const hydrated = useHydration();
  const { members } = useOrgStore();
  const { applications } = useApplicationStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { sprints } = useSprintStore();
  const { getOverallScore, isComplete } = usePsychStore();

  const analytics = useMemo(() => {
    const activeMembers = members.filter((member) => member.status === "active").length;
    const scoredMembers = members.filter((member) => typeof member.score === "number");
    const avgScore = scoredMembers.length > 0
      ? Math.round(scoredMembers.reduce((sum, member) => sum + (member.score || 0), 0) / scoredMembers.length)
      : isComplete() ? getOverallScore() : 0;

    const applicationsWithProgress = applications.filter((application) => application.status !== "draft");
    const approvedApplications = applicationsWithProgress.filter((application) => application.status === "accepted").length;
    const approvalRate = applicationsWithProgress.length > 0
      ? Math.round((approvedApplications / applicationsWithProgress.length) * 100)
      : 0;

    const routeProgress = routes.length > 0
      ? Math.round(routes.reduce((sum, route) => sum + getRouteProgress(route.id), 0) / routes.length)
      : 0;
    const professionalScore = applicationsWithProgress.length > 0
      ? Math.round(
        (approvedApplications / applicationsWithProgress.length) * 100 * 0.6 +
        (applicationsWithProgress.reduce((sum, application) => sum + application.match, 0) / applicationsWithProgress.length) * 0.4
      )
      : 0;

    const dimensions = [
      { name: "Financeira", avg: computeDimensionScore(sprints, "financ"), target: 65 },
      { name: "Documental", avg: computeDimensionScore(sprints, "document"), target: 70 },
      { name: "Linguística", avg: computeDimensionScore(sprints, "linguist"), target: 70 },
      { name: "Psicológica", avg: isComplete() ? getOverallScore() : 0, target: 60 },
      { name: "Profissional", avg: professionalScore, target: 60 },
      { name: "Logística", avg: Math.min(routeProgress, 100), target: 55 },
    ].map((dimension) => ({
      ...dimension,
      delta: formatDelta(Math.max(-20, Math.min(20, dimension.avg - dimension.target))),
    }));

    const destinationCount = new Map<string, number>();
    for (const route of routes) {
      destinationCount.set(route.country, (destinationCount.get(route.country) || 0) + 1);
    }
    for (const application of applications) {
      destinationCount.set(application.country, (destinationCount.get(application.country) || 0) + 1);
    }
    const destinations = Array.from(destinationCount.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const now = new Date();
    const months = Array.from({ length: 3 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (2 - index), 1);
      return {
        month: monthLabel(date),
        newMembers: members.filter((member) => isSameMonth(member.joinedAt, date)).length,
        completedSprints: sprints.filter((sprint) => sprint.status === "completed" && (isSameMonth(sprint.targetDate, date) || isSameMonth(sprint.createdAt, date))).length,
      };
    });

    return {
      activeMembers,
      avgScore,
      approvalRate,
      dimensions,
      destinations,
      months,
    };
  }, [applications, getOverallScore, getRouteProgress, isComplete, members, routes, sprints]);

  const handleExport = () => {
    const rows = [
      ["Métrica", "Valor"],
      ["Membros ativos", analytics.activeMembers],
      ["Score médio", analytics.avgScore],
      ["Taxa de aprovação", `${analytics.approvalRate}%`],
      [],
      ["Dimensão", "Score", "Delta"],
      ...analytics.dimensions.map((dimension) => [dimension.name, dimension.avg, dimension.delta]),
      [],
      ["Destino", "Membros"],
      ...analytics.destinations.map((destination) => [destination.country, destination.count]),
      [],
      ["Mês", "Novos membros", "Sprints concluídos"],
      ...analytics.months.map((month) => [month.month, month.newMembers, month.completedSprints]),
    ];
    downloadCsv(rows, "relatorios-org.csv");
  };

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid sm:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/org" title="Relatórios" actions={
        <button onClick={handleExport} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      } />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <Users className="w-5 h-5 text-moss-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Membros Ativos</p>
          <p className="font-heading text-h2 text-text-primary">{analytics.activeMembers}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <TrendingUp className="w-5 h-5 text-moss-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Score Médio</p>
          <p className="font-heading text-h2 text-moss-500">{analytics.avgScore}</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Target className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="text-caption text-text-muted">Taxa de Aprovação</p>
          <p className="font-heading text-h2 text-text-primary">{analytics.approvalRate}%</p>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-moss-500" /> Scores por Dimensão (média)</h3>
        <div className="space-y-3">
          {analytics.dimensions.map((d) => (
            <div key={d.name} className="flex items-center gap-4">
              <span className="w-28 text-body-sm text-text-primary font-medium">{d.name}</span>
              <div className="flex-1 h-3 bg-cream-300 rounded-full overflow-hidden">
                <div className="h-full bg-moss-500 rounded-full" style={{ width: `${d.avg}%` }} />
              </div>
              <span className="w-10 text-body-sm font-bold text-text-primary text-right">{d.avg}</span>
              <span className="w-10 text-caption text-moss-500">{d.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-clay-500" /> Destinos Populares</h3>
          <div className="space-y-2">
            {analytics.destinations.length === 0 && (
              <p className="text-body-sm text-text-muted">Sem dados de destinos ainda.</p>
            )}
            {analytics.destinations.map((d) => (
              <div key={d.country} className="flex items-center justify-between p-2 rounded-lg bg-cream-50">
                <span className="text-body-sm text-text-primary">{d.country}</span>
                <span className="text-body-sm font-bold text-text-primary">{d.count} membros</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Progresso Mensal</h3>
          <div className="space-y-2">
            {analytics.months.map((m) => (
              <div key={m.month} className="flex items-center justify-between p-2 rounded-lg bg-cream-50">
                <span className="text-body-sm text-text-primary">{m.month}</span>
                <div className="flex gap-4 text-caption text-text-muted">
                  <span>{m.newMembers > 0 ? "+" : ""}{m.newMembers} membros</span>
                  <span>{m.completedSprints} sprints concluídos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
