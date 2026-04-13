"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin, CheckCircle, Circle, AlertTriangle,
  Upload, Settings, FileCheck, Send, Loader2, Pencil,
} from "lucide-react";
import { useSprintStore } from "@/stores/sprints";
import { useRouteStore } from "@/stores/routes";
import { usePsychStore } from "@/stores/psych";
import { useForgeStore } from "@/stores/forge";
import { useApplicationStore, type AppStatus } from "@/stores/applications";
import { useCommunityStore } from "@/stores/community";
import { buildApplicationArtifactDraft } from "@/lib/community-artifacts";
import { evaluateSubmissionGate } from "@/lib/readiness-gate";
import { evaluateApplicationSubmissionEligibility } from "@/lib/application-submission";
import { useCommunityArtifactSave } from "@/hooks";
import { CommunityContextSection, PageHeader, Progress, SaveToCommunityButton, useToast } from "@/components/ui";

function useCountdown(targetDate: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return remaining;
}

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "text-text-muted", bg: "bg-cream-200" },
  in_progress: { label: "Em andamento", color: "text-brand-500", bg: "bg-brand-50" },
  submitted: { label: "Enviada", color: "text-sage-500", bg: "bg-sage-50" },
  accepted: { label: "Aceita!", color: "text-brand-600", bg: "bg-brand-50" },
  rejected: { label: "Rejeitada", color: "text-clay-500", bg: "bg-clay-50" },
  waitlisted: { label: "Lista de espera", color: "text-amber-500", bg: "bg-amber-50" },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = params.id as string;
  const { toast } = useToast();
  const { getById, toggleDocument, toggleTimelineEvent, setStatus } = useApplicationStore();
  const { sprints } = useSprintStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { isComplete, getOverallScore } = usePsychStore();
  const { documents: forgeDocuments } = useForgeStore();
  const { items } = useCommunityStore();
  const { saveCommunityArtifact } = useCommunityArtifactSave({ kind: "applications" });
  const app = getById(appId);
  const countdown = useCountdown(app?.deadline ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isUrgent = !!app && countdown.days <= 14 && app.status !== "submitted" && app.status !== "accepted";
  const contextualItems = useMemo(() => {
    const topics = isUrgent ? ["narrative", "readiness", "community"] : ["narrative", "scholarship", "career"];
    return items
      .filter((item) => topics.includes(item.topic))
      .sort((a, b) => (b.savedCount + b.replyCount) - (a.savedCount + a.replyCount))
      .slice(0, 3);
  }, [isUrgent, items]);

  const gate = useMemo(() => {
    const avgRouteProgress = routes.length > 0
      ? Math.round(routes.reduce((sum, route) => sum + getRouteProgress(route.id), 0) / routes.length)
      : 0;
    return evaluateSubmissionGate({
      sprints,
      psychComplete: isComplete(),
      psychScore: isComplete() ? getOverallScore() : 0,
      avgRouteProgress,
      forgeDocumentsCount: forgeDocuments.length,
    });
  }, [forgeDocuments.length, getOverallScore, getRouteProgress, isComplete, routes, sprints]);

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <FileCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-heading text-h3 text-text-primary mb-2">Candidatura não encontrada</h2>
        <Link href="/applications" className="text-brand-500 font-medium hover:underline">Voltar às candidaturas</Link>
      </div>
    );
  }

  const readyDocs = app.documents.filter((d) => d.status === "ready").length;
  const docProgress = app.documents.length > 0 ? Math.round((readyDocs / app.documents.length) * 100) : 0;
  const st = STATUS_CONFIG[app.status];
  const probabilityScore = Math.min(95, Math.round(app.match * 0.7 + docProgress * 0.3));
  const submissionEligibility = evaluateApplicationSubmissionEligibility(app, gate);

  const handleSubmit = async () => {
    if (!submissionEligibility.eligible) {
      toast({
        title: "Submissão bloqueada",
        description: submissionEligibility.reason || "A candidatura ainda não está elegível para envio.",
        variant: "warning",
      });
      return;
    }
    setSubmitting(true);
    await setStatus(appId, "submitted");
    setSubmitting(false);
    toast({
      title: "Candidatura enviada",
      description: "Sua candidatura foi marcada como enviada com sucesso.",
      variant: "success",
    });
  };

  const handleToggleDocument = async (docId: string, docName: string) => {
    await toggleDocument(appId, docId);
    toast({
      title: "Status do documento atualizado",
      description: `${docName} foi atualizado na sua checklist.`,
      variant: "success",
    });
  };

  const handleMockUpload = (docName: string) => {
    toast({
      title: "Upload indisponível no protótipo",
      description: `Conecte ${docName} ao Forge ou à futura área de uploads para concluir este passo.`,
      variant: "info",
    });
  };

  const handleSaveToCommunity = () => {
    if (!app) return;
    const draft = buildApplicationArtifactDraft(app);
    saveCommunityArtifact(draft);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref="/applications"
        title={app.program}
        subtitle={`${app.type} • ${app.country} • ${st.label}`}
        actions={
          <div className="flex items-center gap-2">
            <SaveToCommunityButton onClick={handleSaveToCommunity} />
            <Link href={`/applications/${appId}/settings`} className="p-2 rounded-lg border border-cream-500 hover:bg-cream-200 transition-colors">
              <Settings className="w-5 h-5 text-text-muted" />
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 text-body-sm text-text-secondary">
        <span className="px-2 py-0.5 rounded-full bg-cream-200 text-caption">{app.type}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.country}</span>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.bg} ${st.color} text-caption font-medium`}>{st.label}</span>
      </div>

      {/* Urgency banner */}
      {isUrgent && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-clay-50 border border-clay-200">
          <AlertTriangle className="w-5 h-5 text-clay-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-clay-600">Deadline se aproxima!</p>
            <p className="text-caption text-clay-500">Faltam {countdown.days} dias, {countdown.hours}h e {countdown.minutes}min para o prazo.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Deadline</p>
          <p className={`font-heading text-h3 ${countdown.days <= 14 ? "text-clay-500" : "text-text-primary"}`}>
            {new Date(app.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </p>
          <p className={`text-caption ${countdown.days <= 7 ? "text-clay-500 font-medium" : "text-text-muted"}`}>
            {countdown.days}d {countdown.hours}h restantes
          </p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Documentos</p>
          <p className="font-heading text-h3 text-text-primary">{readyDocs}/{app.documents.length}</p>
          <Progress value={docProgress} variant="moss" size="sm" className="mt-1" />
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Match Score</p>
          <p className={`font-heading text-h3 ${app.match >= 75 ? "text-brand-500" : "text-amber-500"}`}>{app.match}%</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted mb-1">Probabilidade</p>
          <p className={`font-heading text-h3 ${probabilityScore >= 60 ? "text-brand-500" : "text-amber-500"}`}>{probabilityScore}%</p>
        </div>
      </div>

      {/* Documents */}
      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Documentos Necessários</h3>
        <div className="space-y-3">
          {app.documents.map((doc) => (
            <div key={doc.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              doc.status === "ready" ? "bg-brand-50/50" : doc.status === "in_progress" ? "bg-cream-100" : "bg-cream-50"
            }`}>
              <button onClick={() => void handleToggleDocument(doc.id, doc.name)} className="flex-shrink-0 hover:scale-110 transition-transform">
                {doc.status === "ready" ? (
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                ) : doc.status === "in_progress" ? (
                  <Pencil className="w-5 h-5 text-brand-400" />
                ) : (
                  <Circle className="w-5 h-5 text-cream-500 hover:text-brand-400 transition-colors" />
                )}
              </button>
              <span className={`flex-1 text-body-sm ${doc.status === "ready" ? "text-text-primary" : "text-text-secondary"}`}>
                {doc.name}
              </span>
              <div className="flex items-center gap-2">
                {doc.status === "in_progress" && (
                  <span className="text-caption text-brand-400 font-medium">Em progresso</span>
                )}
                {doc.forgeLink && (
                  <Link href={doc.forgeLink} className="text-caption text-brand-500 font-medium hover:underline">Forge</Link>
                )}
                {!doc.forgeLink && doc.status === "pending" && (
                  <button onClick={() => handleMockUpload(doc.name)} className="text-caption text-brand-500 font-medium flex items-center gap-1 hover:underline">
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Timeline</h3>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-cream-400" />
          {app.timeline.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTimelineEvent(appId, t.id)}
              className="relative pb-6 last:pb-0 w-full text-left group block"
            >
              <div className={`absolute left-[-21px] w-3 h-3 rounded-full transition-colors ${
                t.done ? "bg-brand-500" : "bg-cream-400 group-hover:bg-brand-300"
              }`} />
              <div className="flex items-center justify-between">
                <p className={`text-body-sm transition-colors ${t.done ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"}`}>
                  {t.event}
                </p>
                <span className="text-caption text-text-muted">
                  {new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {contextualItems.length > 0 && (
        <CommunityContextSection
          title="Apoio contextual para esta candidatura"
          description="Use referências e discussões para reduzir risco e melhorar a qualidade da submissão."
          ctaLabel="Abrir Conteúdo"
          items={contextualItems}
          columns={3}
        />
      )}

      {/* Status actions */}
      {app.status !== "submitted" && app.status !== "accepted" && app.status !== "rejected" && (
        <div className="flex gap-3">
          <Link href={`/readiness/gate?appId=${appId}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-cream-500 text-text-secondary font-medium hover:bg-cream-200 transition-colors">
            <AlertTriangle className="w-4 h-4" /> Verificar Gate
          </Link>
          <button
            onClick={() => void handleSubmit()}
            disabled={!submissionEligibility.eligible || submitting}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-semibold transition-colors ${
              submissionEligibility.eligible
                ? "bg-brand-500 text-white hover:bg-brand-600"
                : "bg-cream-300 text-text-muted cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-4 h-4" /> {!submissionEligibility.allDocumentsReady ? `${submissionEligibility.pendingDocumentCount} docs pendentes` : submissionEligibility.eligible ? "Submeter Candidatura" : "Gate bloqueado"}</>
            )}
          </button>
        </div>
      )}

      {app.status === "submitted" && (
        <div className="card-surface p-5 border-l-4 border-sage-500 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-sage-500 flex-shrink-0" />
          <div>
            <p className="text-body-sm font-semibold text-text-primary">Candidatura enviada!</p>
            <p className="text-caption text-text-secondary">Aguardando resultado. Boa sorte!</p>
          </div>
        </div>
      )}
    </div>
  );
}
