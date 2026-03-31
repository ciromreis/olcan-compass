"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Calendar, ShieldCheck, AlertTriangle, Trash2 } from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useSubmissionGateStore } from "@/stores/submission-gate";
import { useHydration } from "@/hooks";
import { ConfirmationModal, PageHeader, Progress, ProgressRing, Skeleton, useToast } from "@/components/ui";
import { normalizeForComparison } from "@/lib/text-normalize";
import { mapGateAttemptsToHistory } from "@/lib/readiness-history";

function dimScoreFromSprints(sprints: ReturnType<typeof useSprintStore.getState>["sprints"], match: string): number {
  const normalizedMatch = normalizeForComparison(match);
  const m = sprints.filter((s) => normalizeForComparison(s.dimension).includes(normalizedMatch));
  if (m.length === 0) return 0;
  const total = m.reduce((s, sp) => s + sp.tasks.length, 0);
  if (total === 0) return 0;
  const done = m.reduce((s, sp) => s + sp.tasks.filter((t) => t.done).length, 0);
  return Math.round((done / total) * 100);
}

export default function ReadinessHistoryPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { isComplete, getOverallScore } = usePsychStore();
  const { attempts, clearAttempts } = useSubmissionGateStore();
  const [clearOpen, setClearOpen] = useState(false);

  const snapshot = useMemo(() => {
    if (!hydrated) return null;
    const financial = dimScoreFromSprints(sprints, "financ");
    const documental = dimScoreFromSprints(sprints, "document");
    const linguistic = dimScoreFromSprints(sprints, "linguist");
    const psychological = isComplete() ? getOverallScore() : 0;
    const logistical = routes.length > 0 ? Math.min(100, Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length)) : 0;
    const overall = Math.round(financial * 0.3 + documental * 0.25 + linguistic * 0.2 + psychological * 0.15 + logistical * 0.1);
    return { date: new Date().toISOString().split("T")[0], overall, financial, documental, linguistic, psychological, logistical };
  }, [hydrated, sprints, routes, getRouteProgress, isComplete, getOverallScore]);

  if (!hydrated || !snapshot) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-48" /></div>;
  }

  const entries = [
    {
      id: `snapshot_${snapshot.date}`,
      date: snapshot.date,
      overall: snapshot.overall,
      source: "snapshot" as const,
      status: snapshot.overall >= 60 ? ("approved" as const) : ("blocked" as const),
      metCount: undefined,
      criteriaCount: undefined,
      appLabel: "Snapshot automático",
      missingCriteria: [],
    },
    ...mapGateAttemptsToHistory(attempts),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/readiness" title="Histórico de Prontidão" subtitle="Evolução do seu Score ao longo do tempo" />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Snapshot Atual</h3>
          <span className="flex items-center gap-1 text-body-sm font-bold text-brand-500"><TrendingUp className="w-4 h-4" /> Score: {snapshot.overall}</span>
        </div>
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-6 items-center">
          <div className="flex justify-center">
            <ProgressRing value={snapshot.overall} size={144} strokeWidth={10} variant="auto" />
          </div>
          <div className="space-y-4">
            {[
              { label: "Financeira", value: snapshot.financial },
              { label: "Documental", value: snapshot.documental },
              { label: "Linguística", value: snapshot.linguistic },
              { label: "Psicológica", value: snapshot.psychological },
              { label: "Logística", value: snapshot.logistical },
            ].map((d) => (
              <Progress
                key={d.label}
                value={d.value}
                size="sm"
                showLabel
                label={d.label}
                variant={d.value >= 60 ? "moss" : "clay"}
              />
            ))}
          </div>
        </div>
        <p className="text-caption text-text-muted text-center mt-3">O snapshot atual combina dados de sprints, rotas e diagnóstico.</p>
      </div>

      <div className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-h4 text-text-primary">Histórico Operacional</h3>
          <button
            onClick={() => setClearOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-clay-300 px-3 py-1.5 text-caption font-medium text-clay-500 hover:bg-clay-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar tentativas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-2 text-text-muted font-medium">Data</th>
                <th className="text-left py-2 text-text-muted font-medium">Origem</th>
                <th className="text-center py-2 text-text-muted font-medium">Geral</th>
                <th className="text-center py-2 text-text-muted font-medium">Status</th>
                <th className="text-center py-2 text-text-muted font-medium">Critérios</th>
                <th className="text-left py-2 text-text-muted font-medium">Contexto</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-cream-200">
                  <td className="py-2.5 text-text-primary flex items-center gap-1"><Calendar className="w-3 h-3 text-text-muted" />{new Date(entry.date).toLocaleDateString("pt-BR")}</td>
                  <td className="py-2.5 text-text-secondary">{entry.source === "snapshot" ? "Snapshot" : "Gate"}</td>
                  <td className="py-2.5 text-center font-bold text-text-primary">{entry.overall}</td>
                  <td className="py-2.5 text-center">
                    {entry.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 text-brand-500 text-caption font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Aprovado</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-clay-500 text-caption font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Bloqueado</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-text-muted">
                    {typeof entry.metCount === "number" && typeof entry.criteriaCount === "number"
                      ? `${entry.metCount}/${entry.criteriaCount}`
                      : "—"}
                  </td>
                  <td className="py-2.5 text-text-secondary">{entry.appLabel || "Visão geral da prontidão"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearAttempts();
          toast({
            title: "Histórico limpo",
            description: "As tentativas de gate foram removidas do histórico.",
            variant: "warning",
          });
        }}
        title="Limpar tentativas do gate?"
        description="Essa ação remove somente as tentativas persistidas de gate, sem afetar sprints, rotas ou diagnóstico."
        confirmLabel="Limpar tentativas"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
