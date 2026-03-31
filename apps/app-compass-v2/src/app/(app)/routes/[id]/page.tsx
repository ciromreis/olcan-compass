"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin, Clock, DollarSign, Target, TrendingUp, GitBranch,
  Calendar, AlertTriangle, Settings, CheckCircle, Circle, Route as RouteIcon, ArrowRight, Sparkles, Zap,
} from "lucide-react";
import { useRouteStore, type MilestoneStatus } from "@/stores/routes";
import { useCommunityStore } from "@/stores/community";
import { buildRouteArtifactDraft } from "@/lib/community-artifacts";
import { useCommunityArtifactSave, useHydration } from "@/hooks";
import { CommunityContextSection, Progress, SaveToCommunityButton, Skeleton } from "@/components/ui";

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-1">Rota Ativa</p>
          <h1 className="font-heading text-h2 text-text-primary">{route.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-body-sm text-text-secondary">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{route.country}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{route.timeline}</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{route.budget}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SaveToCommunityButton onClick={handleSaveToCommunity} />
          <Link href={`/routes/${routeId}/settings`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm hover:bg-cream-200 transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-brand-500" /><span className="text-body-sm font-medium text-text-secondary">Progresso</span></div>
          <p className="font-heading text-h2 text-text-primary">{progress}%</p>
          <Progress value={progress} variant="moss" size="sm" className="mt-2" />
          <p className="text-caption text-text-muted mt-1">{completedMilestones}/{route.milestones.length} milestones</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-brand-500" /><span className="text-body-sm font-medium text-text-secondary">Probabilidade</span></div>
          <p className={`font-heading text-h2 ${probabilityScore >= 60 ? "text-brand-500" : "text-amber-500"}`}>{probabilityScore}%</p>
          <p className="text-caption text-text-muted mt-1">Baseada no seu perfil e progresso</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className={`w-4 h-4 ${riskCount > 0 ? "text-clay-500" : "text-sage-500"}`} /><span className="text-body-sm font-medium text-text-secondary">Riscos</span></div>
          <p className={`font-heading text-h2 ${riskCount > 0 ? "text-clay-500" : "text-sage-500"}`}>{riskCount}</p>
          <p className="text-caption text-text-muted mt-1">{riskCount > 0 ? "Deadlines próximos" : "Sem riscos imediatos"}</p>
        </div>
      </div>

      {nextMilestone && (
        <div className="card-surface p-6 border-l-4 border-brand-500">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-brand-500">
                <Sparkles className="w-4 h-4" />
                <p className="text-caption font-heading font-semibold uppercase tracking-wider">Foco atual da rota</p>
              </div>
              <h2 className="font-heading text-h3 text-text-primary">{nextMilestone.name}</h2>
              <p className="mt-2 text-body text-text-secondary">
                Esta é a próxima alavanca da sua rota em <strong>{route.country}</strong>. Ao concluir este item, você destrava a sequência operacional seguinte.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-body-sm text-text-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">Etapa: {nextMilestone.group}</span>
                {nextMilestone.dueDate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
                    Prazo: {new Date(nextMilestone.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
                  Dependências mapeadas: {blockedCount}
                </span>
              </div>
            </div>
            <button onClick={() => void handleToggle(nextMilestone.id)} className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-500 px-5 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-brand-600">
              Avançar milestone
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid md:grid-cols-4 gap-3">
        <Link href={`/routes/${routeId}/milestones`} className="card-surface p-4 text-center hover:bg-cream-100 transition-colors"><GitBranch className="w-5 h-5 text-brand-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Milestones</span></Link>
        <Link href={`/routes/${routeId}/graph`} className="card-surface p-4 text-center hover:bg-cream-100 transition-colors"><GitBranch className="w-5 h-5 text-sage-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Grafo DAG</span></Link>
        <Link href={`/routes/${routeId}/timeline`} className="card-surface p-4 text-center hover:bg-cream-100 transition-colors"><Calendar className="w-5 h-5 text-clay-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Timeline</span></Link>
        <Link href={`/routes/${routeId}/risk`} className="card-surface p-4 text-center hover:bg-cream-100 transition-colors"><AlertTriangle className="w-5 h-5 text-clay-400 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Riscos</span></Link>
      </div>

      {progress < 60 && (
        <div className="card-surface p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-brand-200">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-text-primary text-body-sm">Reforce a execução logística</p>
            <p className="text-caption text-text-muted mt-0.5">Crie um sprint de relocation para converter milestones pendentes em tarefas acionáveis.</p>
          </div>
          <Link
            href="/sprints/new?template=relocation"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Criar Sprint <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Milestones</h3>
          <span className="text-caption text-text-muted">{inProgressCount} em andamento · {pendingCount} pendentes</span>
        </div>
        <div className="space-y-6">
          {groups.map((group) => {
            const groupMilestones = route.milestones.filter((m) => m.group === group);
            const groupDone = groupMilestones.every((m) => m.status === "completed");
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className={`text-body-sm font-semibold ${groupDone ? "text-sage-500" : "text-text-secondary"}`}>{group}</h4>
                  {groupDone && <CheckCircle className="w-3.5 h-3.5 text-sage-500" />}
                  <span className="text-caption text-text-muted">
                    {groupMilestones.filter((m) => m.status === "completed").length}/{groupMilestones.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupMilestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => void handleToggle(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        m.status === "completed"
                          ? "bg-brand-50/50"
                          : m.status === "in_progress"
                          ? "bg-cream-100 border border-brand-200"
                          : "bg-cream-50 hover:bg-cream-100"
                      } ${justToggled === m.id ? "scale-[1.01] shadow-sm" : ""}`}
                    >
                      <MilestoneIcon status={m.status} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-body-sm font-medium ${m.status === "completed" ? "text-text-muted line-through" : "text-text-primary"}`}>
                          {m.name}
                        </p>
                        {m.dependsOn?.length ? (
                          <p className="text-caption text-text-muted">Depende de {m.dependsOn.length} etapa{m.dependsOn.length !== 1 ? "s" : ""} anterior{m.dependsOn.length !== 1 ? "es" : ""}</p>
                        ) : null}
                        {m.dueDate && (
                          <p className="text-caption text-text-muted">
                            {new Date(m.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      {m.status === "in_progress" && (
                        <span className="text-caption font-medium text-brand-500 px-2 py-0.5 rounded-full bg-brand-50">Em andamento</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
