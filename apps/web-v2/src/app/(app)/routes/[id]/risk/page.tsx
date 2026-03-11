"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Shield, Clock, AlertTriangle, type LucideIcon } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { daysUntil } from "@/lib/format";

type Severity = "high" | "medium" | "low";
interface Risk { severity: Severity; title: string; description: string; icon: LucideIcon; mitigation: string }

export default function RiskAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { getRouteById } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);

  const risks = useMemo<Risk[]>(() => {
    if (!route) return [];
    const items: Risk[] = [];
    const pending = route.milestones.filter((m) => m.status !== "completed");
    const blocked = route.milestones.filter((m) => m.status === "blocked");

    // Tight deadlines
    pending.forEach((m) => {
      if (!m.dueDate) return;
      const days = daysUntil(m.dueDate);
      if (days <= 7 && days >= 0) {
        items.push({ severity: "high", title: `Prazo apertado: ${m.name}`, description: `Faltam apenas ${days} dia${days !== 1 ? "s" : ""} para o prazo deste milestone.`, icon: Clock, mitigation: `Priorize "${m.name}" imediatamente.` });
      } else if (days <= 21 && days > 7) {
        items.push({ severity: "medium", title: `Prazo se aproximando: ${m.name}`, description: `Faltam ${days} dias para o prazo. Planeje-se para concluir a tempo.`, icon: Clock, mitigation: `Agende tempo para "${m.name}" nas próximas semanas.` });
      }
    });

    // Blocked milestones
    blocked.forEach((m) => {
      items.push({ severity: "high", title: `Milestone bloqueado: ${m.name}`, description: `Este milestone está bloqueado por dependências não cumpridas.`, icon: AlertTriangle, mitigation: `Conclua as dependências para desbloquear "${m.name}".` });
    });

    // Low progress
    const progress = route.milestones.length > 0 ? route.milestones.filter((m) => m.status === "completed").length / route.milestones.length : 0;
    if (progress < 0.3 && route.milestones.length > 3) {
      items.push({ severity: "medium", title: "Progresso abaixo do esperado", description: `Apenas ${Math.round(progress * 100)}% dos milestones foram concluídos.`, icon: AlertTriangle, mitigation: "Revise seu planejamento e foque nos milestones prioritários." });
    }

    if (items.length === 0) {
      items.push({ severity: "low", title: "Rota em bom ritmo", description: "Nenhum risco significativo identificado no momento.", icon: Shield, mitigation: "Continue acompanhando seus milestones regularmente." });
    }

    return items.sort((a, b) => { const o: Record<Severity, number> = { high: 0, medium: 1, low: 2 }; return o[a.severity] - o[b.severity]; });
  }, [route]);

  const counts = useMemo(() => ({
    high: risks.filter((r) => r.severity === "high").length,
    medium: risks.filter((r) => r.severity === "medium").length,
    low: risks.filter((r) => r.severity === "low").length,
  }), [risks]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!route) {
    return <div className="max-w-4xl mx-auto"><EmptyState icon={AlertTriangle} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Análise de Risco" subtitle={`${route.name} — ${risks.length} risco${risks.length !== 1 ? "s" : ""} identificado${risks.length !== 1 ? "s" : ""}`} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center border-t-4 border-clay-500">
          <p className="font-heading text-h1 text-clay-500">{counts.high}</p>
          <p className="text-caption text-text-muted">Alto Risco</p>
        </div>
        <div className="card-surface p-4 text-center border-t-4 border-clay-300">
          <p className="font-heading text-h1 text-clay-400">{counts.medium}</p>
          <p className="text-caption text-text-muted">Médio Risco</p>
        </div>
        <div className="card-surface p-4 text-center border-t-4 border-sage-400">
          <p className="font-heading text-h1 text-sage-500">{counts.low}</p>
          <p className="text-caption text-text-muted">Baixo Risco</p>
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk, i) => (
          <div key={i} className={`card-surface p-6 border-l-4 ${risk.severity === "high" ? "border-clay-500" : risk.severity === "medium" ? "border-clay-300" : "border-sage-400"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${risk.severity === "high" ? "bg-clay-50" : risk.severity === "medium" ? "bg-cream-200" : "bg-sage-50"}`}>
                <risk.icon className={`w-5 h-5 ${risk.severity === "high" ? "text-clay-500" : risk.severity === "medium" ? "text-clay-400" : "text-sage-500"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-h4 text-text-primary">{risk.title}</h3>
                  <span className={`text-caption px-2 py-0.5 rounded-full font-medium ${risk.severity === "high" ? "bg-clay-50 text-clay-500" : risk.severity === "medium" ? "bg-cream-200 text-clay-400" : "bg-sage-50 text-sage-500"}`}>
                    {risk.severity === "high" ? "Alto" : risk.severity === "medium" ? "Médio" : "Baixo"}
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary mb-3">{risk.description}</p>
                <div className="p-3 rounded-lg bg-cream-100">
                  <p className="text-body-sm text-text-primary flex items-start gap-2">
                    <Shield className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Mitigação:</strong> {risk.mitigation}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
