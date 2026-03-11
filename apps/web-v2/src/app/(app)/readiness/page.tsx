"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Gauge, TrendingUp, AlertTriangle, Target, Calculator, History, ArrowRight, DollarSign, FileText, Languages, Brain, Truck, Zap } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useCommunityStore } from "@/stores/community";
import { useHydration } from "@/hooks";
import { CommunityContextSection, PageHeader, Progress, ProgressRing, RadarChart, Skeleton, type RadarDataPoint } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";

interface ReadinessDimension {
  id: string;
  label: string;
  icon: typeof DollarSign;
  weight: number;
  score: number;
  sprintDimension: string;
}

function computeDimensionScore(sprints: ReturnType<typeof useSprintStore.getState>["sprints"], dimension: string): number {
  const normalizedDimension = normalizeForComparison(dimension);
  const matching = sprints.filter((s) =>
    normalizeForComparison(s.dimension).includes(normalizedDimension)
  );
  if (matching.length === 0) return 0;
  const totalTasks = matching.reduce((s, sp) => s + sp.tasks.length, 0);
  if (totalTasks === 0) return 0;
  const doneTasks = matching.reduce((s, sp) => s + sp.tasks.filter((t) => t.done).length, 0);
  return Math.round((doneTasks / totalTasks) * 100);
}

export default function ReadinessOverviewPage() {
  const hydrated = useHydration();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { getOverallScore, isComplete } = usePsychStore();
  const { items } = useCommunityStore();

  const dimensions: ReadinessDimension[] = useMemo(() => {
    if (!hydrated) return [];
    const psychScore = isComplete() ? getOverallScore() : 0;

    const routeProgress = routes.length > 0
      ? Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length)
      : 0;

    return [
      { id: "financial", label: "Financeira", icon: DollarSign, weight: 30, score: computeDimensionScore(sprints, "financ"), sprintDimension: "Financeira" },
      { id: "documental", label: "Documental", icon: FileText, weight: 25, score: computeDimensionScore(sprints, "document"), sprintDimension: "Documental" },
      { id: "linguistic", label: "Linguística", icon: Languages, weight: 20, score: computeDimensionScore(sprints, "linguist"), sprintDimension: "Linguística" },
      { id: "psychological", label: "Psicológica", icon: Brain, weight: 15, score: psychScore, sprintDimension: "Psicológica" },
      { id: "logistical", label: "Logística", icon: Truck, weight: 10, score: Math.min(routeProgress, 100), sprintDimension: "Logística" },
    ];
  }, [hydrated, sprints, routes, getRouteProgress, getOverallScore, isComplete]);

  const totalScore = useMemo(() => {
    if (dimensions.length === 0) return 0;
    return Math.round(dimensions.reduce((s, d) => s + d.score * (d.weight / 100), 0));
  }, [dimensions]);

  const weakest = useMemo(() => {
    if (dimensions.length === 0) return null;
    return [...dimensions].sort((a, b) => a.score - b.score)[0];
  }, [dimensions]);

  const contextualItems = useMemo(() => {
    if (!weakest) return [];
    const topicMap: Record<string, Array<string>> = {
      financial: ["readiness"],
      documental: ["narrative", "readiness"],
      linguistic: ["interview", "community"],
      psychological: ["community", "readiness"],
      logistical: ["visa", "readiness"],
    };
    const topics = topicMap[weakest.id] || ["readiness"];
    return items
      .filter((item) => topics.includes(item.topic))
      .sort((a, b) => (b.savedCount + b.likeCount) - (a.savedCount + a.likeCount))
      .slice(0, 3);
  }, [items, weakest]);

  const totalPending = useMemo(() => {
    return sprints
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.tasks.filter((t) => !t.done).length, 0);
  }, [sprints]);

  const radarData: RadarDataPoint[] = useMemo(
    () => dimensions.map((d) => ({ label: d.label, value: d.score, max: 100 })),
    [dimensions]
  );

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Prontidão" subtitle="Quão preparado você está para embarcar" />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-6 md:col-span-1">
          <div className="text-center">
            <Gauge className="w-8 h-8 text-moss-500 mx-auto mb-2" />
            <p className="text-caption font-heading font-semibold text-text-muted mb-1">Score Geral</p>
            <ProgressRing value={totalScore} size={120} strokeWidth={9} variant="auto" className="mx-auto" />
            <p className="text-caption text-text-muted mt-2">de 100</p>
            <p className="text-caption text-text-muted mt-1">{totalPending} tarefa{totalPending !== 1 ? "s" : ""} pendente{totalPending !== 1 ? "s" : ""}</p>
            <div className="mt-4">
              <Progress value={Math.min(100, 100 - totalPending * 5)} size="sm" showLabel label="Momentum operacional" variant={totalScore >= 60 ? "moss" : "clay"} />
            </div>
          </div>
        </div>
        <div className="card-surface p-6 md:col-span-2">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Mapa Dimensional</h3>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-center">
            <div className="flex justify-center">
              <RadarChart data={radarData} size={280} showValues />
            </div>
            <div className="space-y-4">
            {dimensions.map((d) => (
              <Link key={d.id} href={`/readiness/${d.id}`} className="block group">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-body-sm font-medium text-text-primary group-hover:text-moss-500 transition-colors flex items-center gap-1.5">
                    <d.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-moss-500 transition-colors" />
                    {d.label}
                  </span>
                  <span className="text-caption text-text-muted">Sprint {d.sprintDimension}</span>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-caption text-text-muted">Peso {d.weight}%</span>
                  <span className={`text-body-sm font-bold ${d.score >= 60 ? "text-moss-500" : d.score > 0 ? "text-clay-500" : "text-text-muted"}`}>{d.score}</span>
                </div>
                <Progress
                  value={d.score}
                  size="sm"
                  showLabel
                  label="Progresso"
                  variant={d.score >= 60 ? "moss" : "clay"}
                />
              </Link>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/readiness/gaps" className="card-surface p-4 text-center hover:bg-cream-100 transition-colors">
          <AlertTriangle className="w-5 h-5 text-clay-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Gaps Ranqueados</span>
        </Link>
        <Link href="/readiness/risk" className="card-surface p-4 text-center hover:bg-cream-100 transition-colors">
          <Target className="w-5 h-5 text-clay-400 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Análise de Risco</span>
        </Link>
        <Link href="/readiness/history" className="card-surface p-4 text-center hover:bg-cream-100 transition-colors">
          <History className="w-5 h-5 text-sage-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Histórico</span>
        </Link>
        <Link href="/readiness/simulation" className="card-surface p-4 text-center hover:bg-cream-100 transition-colors">
          <Calculator className="w-5 h-5 text-moss-500 mx-auto mb-1" /><span className="text-body-sm font-medium text-text-primary">Simulação</span>
        </Link>
      </div>

      {weakest && (
        <div className="card-surface p-6 border-l-4 border-moss-500">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-moss-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-h4 text-text-primary mb-1">Próximo Passo Recomendado</h3>
              <p className="text-body text-text-secondary">
                Sua dimensão <strong>{weakest.label.toLowerCase()}</strong> é o maior gargalo ({weakest.score}%).
                {weakest.score === 0
                  ? " Inicie um sprint nesta área para melhorar sua prontidão."
                  : " Continue avançando nas tarefas pendentes ou use o simulador para recalcular cenários."}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link href={`/readiness/${weakest.id}`} className="inline-flex items-center gap-1 text-body-sm font-medium text-moss-500 hover:text-moss-600 transition-colors">
                  Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {weakest.score === 0 && weakest.id !== "logistical" && (
                  <Link href={`/sprints/new?template=${weakest.id === "financial" ? "financial" : weakest.id === "documental" ? "documental" : weakest.id === "linguistic" ? "linguistic" : weakest.id === "psychological" ? "psychological" : "relocation"}`} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-white bg-moss-500 px-3 py-1.5 rounded-lg hover:bg-moss-600 transition-colors">
                    <Zap className="w-3.5 h-3.5" /> Iniciar Sprint
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {weakest && contextualItems.length > 0 && (
        <CommunityContextSection
          title={`Contexto recomendado para destravar ${weakest.label.toLowerCase()}`}
          description="Use referências e perguntas da comunidade como apoio operacional para sua próxima decisão."
          items={contextualItems}
          columns={3}
        />
      )}
    </div>
  );
}
