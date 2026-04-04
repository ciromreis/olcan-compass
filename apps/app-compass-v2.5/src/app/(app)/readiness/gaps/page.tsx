"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useHydration } from "@/hooks";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";

interface Gap {
  rank: number;
  dimension: string;
  gap: string;
  impact: "Alto" | "Médio" | "Baixo";
  detail: string;
  action: string;
  link: string;
}

export default function GapsRankedPage() {
  const hydrated = useHydration();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { isComplete, getOverallScore } = usePsychStore();

  const gaps = useMemo(() => {
    if (!hydrated) return [];
    const result: Gap[] = [];

    const dimConfigs = [
      { id: "financial", label: "Financeira", match: "financ", weight: 30, link: "/readiness/financial", sprintTemplate: "financial" },
      { id: "documental", label: "Documental", match: "document", weight: 25, link: "/readiness/documental", sprintTemplate: "documental" },
      { id: "linguistic", label: "Linguística", match: "linguist", weight: 20, link: "/readiness/linguistic", sprintTemplate: "linguistic" },
    ];

    dimConfigs.forEach((dim) => {
      const normalizedMatch = normalizeForComparison(dim.match);
      const matching = sprints.filter((s) =>
        normalizeForComparison(s.dimension).includes(normalizedMatch)
      );
      if (matching.length === 0) {
        result.push({
          rank: 0,
          dimension: dim.label,
          gap: `Nenhum sprint de ${dim.label.toLowerCase()} iniciado`,
          impact: dim.weight >= 25 ? "Alto" : "Médio" as "Alto" | "Médio" | "Baixo",
          detail: `Esta dimensão vale ${dim.weight}% da sua nota de prontidão e está em zero sem nenhum sprint ativo.`,
          action: "Iniciar Sprint",
          link: `/sprints/new?template=${dim.sprintTemplate}`,
        });
        return;
      }
      const pending = matching.flatMap((s) => s.tasks.filter((t) => !t.done));
      pending.forEach((task) => {
        result.push({
          rank: 0,
          dimension: dim.label,
          gap: task.name,
          impact: dim.weight >= 25 ? "Alto" : "Médio",
          detail: `Sprint pendente na dimensão ${dim.label}. Peso: ${dim.weight}% da nota geral.`,
          action: "Ver dimensão",
          link: dim.link,
        });
      });
    });

    const routeProgress = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length) : 0;
    if (routeProgress < 60) {
      const pendingMilestones = routes.flatMap((r) => r.milestones.filter((m) => m.status !== "completed"));
      pendingMilestones.slice(0, 3).forEach((m) => {
        result.push({ rank: 0, dimension: "Logística", gap: m.name, impact: "Médio", detail: "Milestone pendente na sua rota de mobilidade.", action: "Ver rotas", link: "/routes" });
      });
    }

    if (!isComplete()) {
      result.push({ rank: 0, dimension: "Psicológica", gap: "Diagnóstico psicológico incompleto", impact: "Alto", detail: "Sem diagnóstico, o score psicológico é 0. Isso impacta 15% da nota geral.", action: "Iniciar diagnóstico", link: "/profile/psych" });
    } else if (getOverallScore() < 50) {
      result.push({ rank: 0, dimension: "Psicológica", gap: "Score psicológico baixo", impact: "Médio", detail: `Score atual: ${getOverallScore()}. Considere refazer o diagnóstico ou buscar apoio.`, action: "Ver diagnóstico", link: "/profile/psych/results" });
    }

    const impactOrder = { Alto: 0, Médio: 1, Baixo: 2 };
    result.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
    return result.map((g, i) => ({ ...g, rank: i + 1 }));
  }, [hydrated, sprints, routes, getRouteProgress, isComplete, getOverallScore]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  const highImpactCount = gaps.filter((gap) => gap.impact === "Alto").length;
  const mediumImpactCount = gaps.filter((gap) => gap.impact === "Médio").length;
  const nextGap = gaps[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title="Gaps Ranqueados" subtitle={`${gaps.length} gap${gaps.length !== 1 ? "s" : ""} identificado${gaps.length !== 1 ? "s" : "s"}, ordenados por impacto`} />

      {gaps.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Nenhum gap identificado" description="Parabéns! Todas as tarefas e indicadores estão em dia." />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-surface p-5 text-center">
              <p className="font-heading text-display text-clay-500">{highImpactCount}</p>
              <p className="text-caption text-text-muted">Gaps de alto impacto</p>
            </div>
            <div className="card-surface p-5 text-center">
              <p className="font-heading text-display text-text-primary">{mediumImpactCount}</p>
              <p className="text-caption text-text-muted">Gaps médios</p>
            </div>
            <div className="card-surface p-5">
              <p className="text-caption text-text-muted mb-1">Próxima prioridade</p>
              <p className="text-body-sm font-semibold text-text-primary line-clamp-2">{nextGap?.gap}</p>
              <p className="text-caption text-text-muted mt-1">{nextGap?.dimension}</p>
            </div>
          </div>

          <div className="space-y-4">
            {gaps.map((gap) => (
              <div key={`${gap.dimension}-${gap.rank}`} className={`card-surface p-6 border-l-4 ${gap.impact === "Alto" ? "border-clay-500" : gap.impact === "Médio" ? "border-clay-300" : "border-sage-400"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-bold text-body-sm text-text-primary">#{gap.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-heading text-h4 text-text-primary">{gap.gap}</h3>
                      <span className={`text-caption px-2 py-0.5 rounded-full font-medium ${gap.impact === "Alto" ? "bg-clay-50 text-clay-500" : gap.impact === "Médio" ? "bg-cream-200 text-clay-400" : "bg-sage-50 text-sage-500"}`}>{gap.impact}</span>
                    </div>
                    <p className="text-caption text-text-muted mb-2">{gap.dimension}</p>
                    <p className="text-body-sm text-text-secondary mb-3">{gap.detail}</p>
                    <Link href={gap.link} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                      {gap.action === "Iniciar Sprint" ? <Zap className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      {gap.action}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
