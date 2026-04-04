"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Shield, ArrowRight } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useApplicationStore } from "@/stores/applications";
import { useHydration } from "@/hooks";
import { EmptyState, PageHeader, Progress, ProgressRing, Skeleton } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";

interface Risk {
  category: string;
  risk: string;
  probability: number;
  impact: "Crítico" | "Alto" | "Médio";
  mitigation: string;
  link: string;
  linkLabel: string;
}

function dimScore(sprints: ReturnType<typeof useSprintStore.getState>["sprints"], match: string): number {
  const normalizedMatch = normalizeForComparison(match);
  const m = sprints.filter((s) => normalizeForComparison(s.dimension).includes(normalizedMatch));
  if (m.length === 0) return 0;
  const total = m.reduce((s, sp) => s + sp.tasks.length, 0);
  if (total === 0) return 0;
  const done = m.reduce((s, sp) => s + sp.tasks.filter((t) => t.done).length, 0);
  return Math.round((done / total) * 100);
}

export default function ReadinessRiskPage() {
  const hydrated = useHydration();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { isComplete, getOverallScore } = usePsychStore();
  const { applications } = useApplicationStore();

  const risks = useMemo(() => {
    if (!hydrated) return [];
    const result: Risk[] = [];

    const finScore = dimScore(sprints, "financ");
    if (finScore < 50) {
      result.push({ category: "Financeiro", risk: "Reserva insuficiente para mudança", probability: Math.max(20, 80 - finScore), impact: finScore < 25 ? "Crítico" : "Alto", mitigation: "Inicie sprints financeiros e acompanhe o progresso na dimensão financeira.", link: "/sprints/new?template=financial", linkLabel: "Iniciar Sprint Financeiro" });
    }

    const docScore = dimScore(sprints, "document");
    const upcomingDeadlines = applications.filter((a) => {
      const d = new Date(a.deadline);
      const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff < 30 && a.status !== "submitted";
    });
    if (upcomingDeadlines.length > 0 && docScore < 70) {
      result.push({ category: "Documental", risk: `${upcomingDeadlines.length} deadline(s) em menos de 30 dias com docs pendentes`, probability: 60, impact: "Crítico", mitigation: "Priorize a finalização de documentos no Forge e revisão no Marketplace.", link: "/forge", linkLabel: "Ir ao Forge" });
    } else if (docScore < 50) {
      result.push({ category: "Documental", risk: "Documentação incompleta", probability: 40, impact: "Alto", mitigation: "Use o Forge para redigir e revisar documentos pendentes.", link: "/sprints/new?template=documental", linkLabel: "Iniciar Sprint Documental" });
    }

    if (!isComplete()) {
      result.push({ category: "Psicológico", risk: "Diagnóstico psicológico não realizado", probability: 50, impact: "Alto", mitigation: "Complete o diagnóstico para identificar pontos de atenção antes da mudança.", link: "/profile/psych", linkLabel: "Fazer Diagnóstico" });
    } else if (getOverallScore() < 40) {
      result.push({ category: "Psicológico", risk: "Score psicológico baixo — risco de desistência", probability: 45, impact: "Alto", mitigation: "Considere apoio profissional de psicólogo especializado em expatriação (Marketplace).", link: "/marketplace", linkLabel: "Ver Apoio" });
    }

    const routeProgress = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length) : 0;
    if (routeProgress < 30 && routes.length > 0) {
      result.push({ category: "Logístico", risk: "Rota com progresso muito baixo", probability: 35, impact: "Médio", mitigation: "Avance nos milestones da rota — moradia, visto, seguro saúde.", link: "/routes", linkLabel: "Ver Rotas" });
    }
    if (routes.length === 0) {
      result.push({ category: "Logístico", risk: "Nenhuma rota de mobilidade definida", probability: 40, impact: "Alto", mitigation: "Defina uma rota com país, tipo e prazo para ativar o plano de milestones.", link: "/routes/new", linkLabel: "Criar Rota" });
    }

    result.sort((a, b) => b.probability - a.probability);
    return result;
  }, [hydrated, sprints, routes, getRouteProgress, isComplete, getOverallScore, applications]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>;
  }

  const criticalCount = risks.filter((risk) => risk.impact === "Crítico").length;
  const avgProbability = risks.length > 0 ? Math.round(risks.reduce((sum, risk) => sum + risk.probability, 0) / risks.length) : 0;
  const nextRisk = risks[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title="Análise de Risco" subtitle="Riscos que podem impactar sua prontidão geral" />

      {risks.length === 0 ? (
        <EmptyState icon={Shield} title="Nenhum risco significativo" description="Seus indicadores estão dentro dos limites aceitáveis." />
      ) : (
        <>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-surface p-5 text-center">
            <ProgressRing value={avgProbability} size={104} strokeWidth={8} variant={avgProbability >= 50 ? "clay" : "moss"} className="mx-auto mb-3" />
            <p className="text-caption text-text-muted">Probabilidade média</p>
          </div>
          <div className="card-surface p-5 text-center">
            <p className="font-heading text-display text-clay-500">{criticalCount}</p>
            <p className="text-caption text-text-muted">Riscos críticos</p>
          </div>
          <div className="card-surface p-5 text-center">
            <p className="font-heading text-display text-text-primary">{risks.length}</p>
            <p className="text-caption text-text-muted">Riscos mapeados</p>
          </div>
        </div>

        <div className="card-surface p-5 bg-cream-100">
          <p className="text-caption text-text-muted mb-1">Próximo foco</p>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-clay-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-body-sm font-semibold text-text-primary">{nextRisk?.risk}</p>
              <p className="text-caption text-text-secondary mt-1">{nextRisk?.mitigation}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {risks.map((r, i) => (
            <div key={i} className="card-surface p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${r.impact === "Crítico" ? "bg-clay-50" : "bg-cream-200"}`}>
                  <AlertTriangle className={`w-5 h-5 ${r.impact === "Crítico" ? "text-clay-500" : "text-clay-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading text-h4 text-text-primary">{r.risk}</h3>
                    <span className={`text-caption px-2 py-0.5 rounded-full font-medium ${r.impact === "Crítico" ? "bg-clay-50 text-clay-500" : r.impact === "Alto" ? "bg-cream-200 text-clay-400" : "bg-sage-50 text-sage-500"}`}>{r.impact}</span>
                  </div>
                  <p className="text-caption text-text-muted mb-2">{r.category}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-body-sm text-text-secondary">Probabilidade:</span>
                    <div className="flex-1 max-w-[220px]">
                      <Progress value={r.probability} size="sm" variant={r.probability > 50 ? "clay" : "moss"} />
                    </div>
                    <span className="text-body-sm font-bold text-text-primary">{r.probability}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-cream-100 flex items-start gap-2 mb-3">
                    <Shield className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <p className="text-body-sm text-text-secondary"><strong>Mitigação:</strong> {r.mitigation}</p>
                  </div>
                  <Link href={r.link} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                    {r.linkLabel} <ArrowRight className="w-3.5 h-3.5" />
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
