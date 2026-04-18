"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Clock,
  DollarSign,
  Settings,
  CheckCircle,
  Circle,
  Route as RouteIcon,
  AlertTriangle,
  GitBranch,
  Calendar,
} from "lucide-react";
import { useRouteStore, type MilestoneStatus } from "@/stores/routes";
import { useCommunityStore } from "@/stores/community";
import { buildRouteArtifactDraft } from "@/lib/community-artifacts";
import { useCommunityArtifactSave, useHydration } from "@/hooks";
import { CommunityContextSection, SaveToCommunityButton, Skeleton } from "@/components/ui";
import { DetailPageShell, routeDetailTabs } from "@/components/layout/DetailPageShell";
import { RouteMetadataSidebar } from "@/components/routes/RouteMetadataSidebar";

function MilestoneIcon({ status }: { status: MilestoneStatus }) {
  if (status === "completed") return <CheckCircle className="w-5 h-5 text-brand-500" />;
  if (status === "in_progress")
    return (
      <div className="w-5 h-5 rounded-full border-2 border-brand-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
      </div>
    );
  if (status === "blocked") return <AlertTriangle className="w-5 h-5 text-clay-400" />;
  return <Circle className="w-5 h-5 text-cream-500" />;
}

export default function RouteOverviewPage() {
  const params = useParams();
  const routeId = params.id as string;
  const hydrated = useHydration();
  const { getRouteById, getRouteProgress, getNextMilestone, toggleMilestone } = useRouteStore();
  const { items } = useCommunityStore();
  const { saveCommunityArtifact } = useCommunityArtifactSave({ kind: "routes" });
  const route = hydrated ? getRouteById(routeId) : undefined;
  const progress = getRouteProgress(routeId);
  const nextMilestone = hydrated ? getNextMilestone(routeId) : null;
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const contextualItems = useMemo(() => {
    if (!route) return [];
    const routeTopicMap: Record<string, Array<string>> = {
      scholarship: ["scholarship", "narrative", "readiness"],
      employment: ["career", "interview", "community"],
      research: ["narrative", "readiness", "community"],
      startup: ["career", "community", "readiness"],
      exchange: ["visa", "community", "readiness"],
    };
    const normalizedType = route.type.toLowerCase();
    const matchedTopics = Object.entries(routeTopicMap).find(([key]) => normalizedType.includes(key))?.[1] || ["readiness", "visa"];
    return items
      .filter((item) => matchedTopics.includes(item.topic))
      .sort((a, b) => (b.savedCount + b.likeCount) - (a.savedCount + a.likeCount))
      .slice(0, 3);
  }, [items, route]);

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <RouteIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-heading text-h3 text-text-primary mb-2">Rota não encontrada</h2>
        <Link href="/routes" className="text-brand-500 font-medium hover:underline">Voltar às rotas</Link>
      </div>
    );
  }

  const completedMilestones = route.milestones.filter((m) => m.status === "completed").length;
  const inProgressCount = route.milestones.filter((m) => m.status === "in_progress").length;
  const pendingCount = route.milestones.filter((m) => m.status === "pending").length;

  const probabilityScore = Math.min(95, Math.round(40 + progress * 0.55));
  const riskCount = route.milestones.filter(
    (m) => m.status !== "completed" && m.dueDate && new Date(m.dueDate) < new Date(Date.now() + 30 * 86400000)
  ).length;
  const blockedCount = route.milestones.filter((m) => m.dependsOn?.length).length;

  const groups = Array.from(new Set(route.milestones.map((m) => m.group)));

  const handleToggle = async (milestoneId: string) => {
    await toggleMilestone(routeId, milestoneId);
    setJustToggled(milestoneId);
    setTimeout(() => setJustToggled(null), 500);
  };

  const handleSaveToCommunity = () => {
    if (!route) return;
    const draft = buildRouteArtifactDraft({
      route,
      progress,
      riskCount,
      nextMilestone,
    });
    saveCommunityArtifact(draft);
  };

  // Subtitle with route metadata
  const subtitle = (
    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
      <span className="flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {route.country}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {route.timeline}
      </span>
      <span className="flex items-center gap-1">
        <DollarSign className="h-3.5 w-3.5" />
        {route.budget}
      </span>
    </div>
  );

  // Action buttons
  const actions = (
    <>
      <SaveToCommunityButton onClick={handleSaveToCommunity} />
      <Link
        href={`/routes/${routeId}/settings`}
        className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-cream-200"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </>
  );

  return (
    <DetailPageShell
      backHref="/routes"
      backLabel="Rotas"
      title={route.name}
      subtitle={subtitle}
      tabs={routeDetailTabs(routeId)}
      sidebar={
        <RouteMetadataSidebar
          route={route}
          progress={progress}
          completedMilestones={completedMilestones}
          inProgressCount={inProgressCount}
          pendingCount={pendingCount}
          probabilityScore={probabilityScore}
          riskCount={riskCount}
          blockedCount={blockedCount}
          nextMilestone={nextMilestone}
          onToggleMilestone={handleToggle}
        />
      }
      actions={actions}
    >
      {/* Quick nav cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Link
          href={`/routes/${routeId}/milestones`}
          className="card-surface p-4 text-center transition-colors hover:bg-cream-100"
        >
          <GitBranch className="mx-auto mb-1 h-5 w-5 text-brand-500" />
          <span className="text-sm font-medium text-text-primary">Milestones</span>
        </Link>
        <Link
          href={`/routes/${routeId}/graph`}
          className="card-surface p-4 text-center transition-colors hover:bg-cream-100"
        >
          <GitBranch className="mx-auto mb-1 h-5 w-5 text-sage-500" />
          <span className="text-sm font-medium text-text-primary">Grafo DAG</span>
        </Link>
        <Link
          href={`/routes/${routeId}/timeline`}
          className="card-surface p-4 text-center transition-colors hover:bg-cream-100"
        >
          <Calendar className="mx-auto mb-1 h-5 w-5 text-clay-500" />
          <span className="text-sm font-medium text-text-primary">Timeline</span>
        </Link>
        <Link
          href={`/routes/${routeId}/risk`}
          className="card-surface p-4 text-center transition-colors hover:bg-cream-100"
        >
          <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-clay-400" />
          <span className="text-sm font-medium text-text-primary">Riscos</span>
        </Link>
      </div>

      {/* Community Context */}
      {contextualItems.length > 0 && (
        <CommunityContextSection
          title="Referências úteis para esta rota"
          description={`Conteúdo e perguntas que podem acelerar decisões de execução para ${route.country}.`}
          ctaLabel="Abrir Conteúdo"
          items={contextualItems}
          columns={3}
        />
      )}

      {/* Milestones by group */}
      <div className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-text-primary">Milestones</h3>
          <span className="text-xs text-text-muted">
            {inProgressCount} em andamento · {pendingCount} pendentes
          </span>
        </div>
        <div className="space-y-6">
          {groups.map((group) => {
            const groupMilestones = route.milestones.filter((m) => m.group === group);
            const groupDone = groupMilestones.every((m) => m.status === "completed");
            return (
              <div key={group}>
                <div className="mb-3 flex items-center gap-2">
                  <h4
                    className={`text-sm font-semibold ${
                      groupDone ? "text-sage-500" : "text-text-secondary"
                    }`}
                  >
                    {group}
                  </h4>
                  {groupDone && <CheckCircle className="h-3.5 w-3.5 text-sage-500" />}
                  <span className="text-xs text-text-muted">
                    {groupMilestones.filter((m) => m.status === "completed").length}/
                    {groupMilestones.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupMilestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => void handleToggle(m.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
                        m.status === "completed"
                          ? "bg-brand-50/50"
                          : m.status === "in_progress"
                          ? "border border-brand-200 bg-cream-100"
                          : "bg-cream-50 hover:bg-cream-100"
                      } ${justToggled === m.id ? "scale-[1.01] shadow-sm" : ""}`}
                    >
                      <MilestoneIcon status={m.status} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            m.status === "completed"
                              ? "text-text-muted line-through"
                              : "text-text-primary"
                          }`}
                        >
                          {m.name}
                        </p>
                        {m.dependsOn?.length ? (
                          <p className="text-xs text-text-muted">
                            Depende de {m.dependsOn.length} etapa{m.dependsOn.length !== 1 ? "s" : ""}{" "}
                            anterior{m.dependsOn.length !== 1 ? "es" : ""}
                          </p>
                        ) : null}
                        {m.dueDate && (
                          <p className="text-xs text-text-muted">
                            {new Date(m.dueDate).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      {m.status === "in_progress" && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-500">
                          Em andamento
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DetailPageShell>
  );
}
