"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, CheckCircle, X, ArrowRight, Lock } from "lucide-react";
import { useApplicationStore } from "@/stores/applications";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useForgeStore } from "@/stores/forge";
import { useSubmissionGateStore } from "@/stores/submission-gate";
import { useHydration } from "@/hooks";
import { PageHeader, Progress, ProgressRing, Skeleton, useToast } from "@/components/ui";
import { evaluateSubmissionGate } from "@/lib/readiness-gate";
import { formatDate } from "@/lib/format";

export default function SubmissionGatePage() {
  const hydrated = useHydration();
  const router = useRouter();
  const [appId, setAppId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { getById, setStatus } = useApplicationStore();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { isComplete, getOverallScore } = usePsychStore();
  const { documents } = useForgeStore();
  const { attempts, recordAttempt, summarizeMissing } = useSubmissionGateStore();
  const app = appId ? getById(appId) : undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("appId") || undefined;
    setAppId(value);
  }, []);

  const { criteria, metCount, canSubmit, totalScore } = useMemo(() => {
    if (!hydrated) return { criteria: [], metCount: 0, canSubmit: false, totalScore: 0 };

    const routeProgress = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + getRouteProgress(r.id), 0) / routes.length) : 0;
    const psychScore = isComplete() ? getOverallScore() : 0;

    const evaluation = evaluateSubmissionGate({
      sprints,
      psychComplete: isComplete(),
      psychScore,
      avgRouteProgress: routeProgress,
      forgeDocumentsCount: documents.length,
    });
    return {
      criteria: evaluation.criteria,
      metCount: evaluation.metCount,
      canSubmit: evaluation.canSubmit,
      totalScore: evaluation.totalScore,
    };
  }, [hydrated, sprints, routes, getRouteProgress, isComplete, getOverallScore, documents]);

  const recentAttempts = useMemo(() => {
    const target = attempts.filter((attempt) => !appId || attempt.appId === appId);
    return target.slice(0, 5);
  }, [attempts, appId]);

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-48" /><Skeleton className="h-64" /></div>;
  }

  const completionRate = (metCount / Math.max(criteria.length, 1)) * 100;
  const remainingCount = criteria.length - metCount;

  const handleGateSubmission = async () => {
    const missing = summarizeMissing(criteria);
    recordAttempt({
      appId,
      appLabel: app?.program,
      canSubmit,
      totalScore,
      metCount,
      criteriaCount: criteria.length,
      missingCriteria: missing,
    });

    if (!canSubmit) {
      toast({
        title: "Gate ainda bloqueado",
        description: `Faltam ${missing.length} critério(s) para liberar a submissão.`,
        variant: "warning",
      });
      return;
    }

    if (appId && app && app.status !== "submitted" && app.status !== "accepted" && app.status !== "rejected") {
      await setStatus(appId, "submitted");
      toast({
        title: "Candidatura submetida",
        description: `${app.program} foi marcada como enviada.`,
        variant: "success",
      });
      router.push(`/applications/${appId}`);
      return;
    }

    toast({
      title: "Gate aprovado",
      description: "Critérios atendidos. Você já pode submeter candidaturas elegíveis.",
      variant: "success",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={appId ? `/applications/${appId}` : "/readiness"} title="Submission Gate" subtitle={app ? `Critérios mínimos para enviar: ${app.program}` : "Critérios mínimos para submeter sua candidatura"} />

      <div className={`card-surface p-6 ${canSubmit ? "border-2 border-brand-500" : "border-2 border-clay-300"}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-center">
            <ProgressRing value={completionRate} size={132} strokeWidth={10} variant={canSubmit ? "moss" : "clay"} className="mx-auto" />
            <p className="text-caption text-text-muted mt-2">{metCount} / {criteria.length} critérios</p>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4 ${canSubmit ? "bg-brand-50" : "bg-clay-50"}`}>
              {canSubmit ? <ShieldCheck className="w-8 h-8 text-brand-500" /> : <Lock className="w-8 h-8 text-clay-400" />}
            </div>
            <h2 className="font-heading text-h3 text-text-primary mb-2">
              {canSubmit ? "Gate Aberto — Você pode submeter!" : "Gate Fechado"}
            </h2>
            <p className="text-body text-text-secondary mb-4">
              Score atual: <strong>{totalScore}</strong>. {metCount} de {criteria.length} critérios atendidos.
            </p>
            <Progress value={completionRate} size="sm" showLabel label="Critérios atendidos" variant={canSubmit ? "moss" : "clay"} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <p className={`font-heading text-display ${totalScore >= 60 ? "text-brand-500" : "text-clay-500"}`}>{totalScore}</p>
          <p className="text-caption text-text-muted">Score de prontidão</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className={`font-heading text-display ${remainingCount === 0 ? "text-brand-500" : "text-clay-500"}`}>{remainingCount}</p>
          <p className="text-caption text-text-muted">Critérios restantes</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-caption text-text-muted mb-1">Próximo foco</p>
          <p className="text-body-sm font-semibold text-text-primary line-clamp-2">{criteria.find((c) => !c.met)?.label ?? "Tudo pronto para submeter"}</p>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Critérios</h3>
        <div className="space-y-3">
          {criteria.map((c) => (
            <div key={c.label} className={`flex items-center gap-3 p-3 rounded-lg ${c.met ? "bg-brand-50/50" : "bg-cream-50"}`}>
              {c.met ? <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" /> : <X className="w-5 h-5 text-clay-400 flex-shrink-0" />}
              <div className="flex-1">
                <p className={`text-body-sm font-medium ${c.met ? "text-text-primary" : "text-text-secondary"}`}>{c.label}</p>
              </div>
              <span className={`text-caption font-medium ${c.met ? "text-brand-500" : "text-clay-500"}`}>{c.current}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/readiness/gaps" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
          <AlertTriangle className="w-4 h-4" /> Ver Gaps
        </Link>
        <button onClick={() => void handleGateSubmission()} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-white font-heading font-semibold hover:bg-brand-600 transition-colors">
          {canSubmit ? "Submeter Candidatura" : "Registrar Tentativa"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Histórico de Tentativas</h3>
        {recentAttempts.length === 0 ? (
          <p className="text-body-sm text-text-muted">Nenhuma tentativa registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="rounded-lg bg-cream-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className={`text-body-sm font-medium ${attempt.canSubmit ? "text-brand-500" : "text-clay-500"}`}>
                    {attempt.canSubmit ? "Gate aprovado" : "Gate bloqueado"} · {attempt.metCount}/{attempt.criteriaCount}
                  </p>
                  <span className="text-caption text-text-muted">{formatDate(attempt.createdAt)}</span>
                </div>
                <p className="text-caption text-text-muted">Score {attempt.totalScore} {attempt.appLabel ? `· ${attempt.appLabel}` : ""}</p>
                {!attempt.canSubmit && attempt.missingCriteria.length > 0 && (
                  <p className="mt-1 text-caption text-clay-500">Pendências: {attempt.missingCriteria.join(" • ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
