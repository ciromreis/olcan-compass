"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Save, Trash2, Archive, Settings, ArrowRight, FileCheck, Route as RouteIcon, StickyNote } from "lucide-react";
import { useApplicationStore, type AppStatus } from "@/stores/applications";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { usePsychStore } from "@/stores/psych";
import { useForgeStore } from "@/stores/forge";
import { evaluateSubmissionGate } from "@/lib/readiness-gate";
import { evaluateApplicationSubmissionEligibility } from "@/lib/application-submission";
import { useHydration } from "@/hooks";
import { ConfirmationModal, EmptyState, Input, PageHeader, Progress, Skeleton, Textarea, useToast } from "@/components/ui";

const STATUS_OPTIONS: { value: AppStatus; label: string }[] = [
  { value: "draft", label: "Rascunho" },
  { value: "in_progress", label: "Em andamento" },
  { value: "submitted", label: "Enviada" },
  { value: "accepted", label: "Aceita" },
  { value: "rejected", label: "Rejeitada" },
  { value: "waitlisted", label: "Lista de espera / Arquivada" },
];

export default function ApplicationSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { getById, updateApplication, removeApplication } = useApplicationStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { sprints } = useSprintStore();
  const { isComplete, getOverallScore } = usePsychStore();
  const { documents } = useForgeStore();

  const app = useMemo(() => hydrated ? getById(id) : undefined, [hydrated, getById, id]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<AppStatus>("draft");
  const [notes, setNotes] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const readyDocs = app?.documents.filter((doc) => doc.status === "ready").length ?? 0;
  const documentProgress = app?.documents.length ? Math.round((readyDocs / app.documents.length) * 100) : 0;
  const completedTimelineEvents = app?.timeline.filter((event) => event.done).length ?? 0;
  const timelineProgress = app?.timeline.length ? Math.round((completedTimelineEvents / app.timeline.length) * 100) : 0;

  const suggestedRoutes = useMemo(() => {
    if (!app) return [];
    return routes
      .filter((route) => route.country === app.country || route.type.toLowerCase().includes(app.type.toLowerCase()))
      .slice(0, 3);
  }, [app, routes]);

  const gate = useMemo(() => {
    const avgRouteProgress = routes.length > 0
      ? Math.round(routes.reduce((sum, route) => sum + getRouteProgress(route.id), 0) / routes.length)
      : 0;
    return evaluateSubmissionGate({
      sprints,
      psychComplete: isComplete(),
      psychScore: isComplete() ? getOverallScore() : 0,
      avgRouteProgress,
      forgeDocumentsCount: documents.length,
    });
  }, [documents.length, getOverallScore, getRouteProgress, isComplete, routes, sprints]);

  useEffect(() => {
    if (!app) return;
    setName(app.program);
    setStatus(app.status);
    setNotes(app.notes || "");
  }, [app]);

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>;
  }

  if (!app) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={Settings} title="Candidatura não encontrada" description="Verifique o ID da candidatura." /></div>;
  }

  const handleSave = async () => {
    if (status === "submitted" && app.status !== "submitted") {
      const eligibility = evaluateApplicationSubmissionEligibility(app, gate);
      if (!eligibility.eligible) {
        toast({
          title: "Submissão bloqueada",
          description: eligibility.reason || "Esta candidatura ainda não está elegível para envio.",
          variant: "warning",
        });
        return;
      }
    }
    await updateApplication(id, { program: name.trim() || app.program, status, notes: notes.trim() || undefined });
    toast({
      title: "Candidatura atualizada",
      description: "As alterações foram salvas com sucesso.",
      variant: "success",
    });
  };

  const handleDelete = async () => {
    await removeApplication(id);
    toast({
      title: "Candidatura removida",
      description: "A candidatura foi excluída da sua lista.",
      variant: "warning",
    });
    router.push("/applications");
  };

  const handleArchive = async () => {
    await updateApplication(id, { status: "waitlisted" });
    setStatus("waitlisted");
    toast({
      title: "Candidatura arquivada",
      description: "A candidatura foi movida para a lista de espera / acompanhamento.",
      variant: "info",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/applications/${id}`} title="Configurações da Candidatura" subtitle="Ajuste campos persistidos e revise o estado operacional da aplicação." />

      {status === "submitted" && app.status !== "submitted" && (
        <div className={`card-surface p-4 border-l-4 ${gate.canSubmit ? "border-brand-500" : "border-clay-500"}`}>
          <p className={`text-body-sm font-medium ${gate.canSubmit ? "text-brand-600" : "text-clay-600"}`}>
            {gate.canSubmit
              ? "Gate aprovado para submissão."
              : "Gate de submissão ainda bloqueado. Salvar com status Enviada será impedido até atender os critérios."}
          </p>
          {!gate.canSubmit && (
            <Link href={`/readiness/gate?appId=${id}`} className="inline-flex items-center gap-1 mt-2 text-body-sm font-medium text-brand-500 hover:text-brand-600">
              Ir para Submission Gate <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4 text-center">
          <FileCheck className="mx-auto mb-2 h-5 w-5 text-brand-500" />
          <p className="font-heading text-h3 text-text-primary">{readyDocs}/{app.documents.length}</p>
          <p className="text-caption text-text-muted">Documentos prontos</p>
        </div>
        <div className="card-surface p-4 text-center">
          <StickyNote className="mx-auto mb-2 h-5 w-5 text-sage-500" />
          <p className="font-heading text-h3 text-text-primary">{app.notes?.trim() ? "Sim" : "Não"}</p>
          <p className="text-caption text-text-muted">Notas salvas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <RouteIcon className="mx-auto mb-2 h-5 w-5 text-clay-500" />
          <p className="font-heading text-h3 text-text-primary">{suggestedRoutes.length}</p>
          <p className="text-caption text-text-muted">Rotas relacionadas</p>
        </div>
      </div>

      <div className="card-surface p-6 space-y-4">
        <Input label="Nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as AppStatus)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Notas operacionais</label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Registre riscos, follow-ups, dependências, observações sobre documentos ou próximos passos desta candidatura."
          />
        </div>
        <button onClick={() => void handleSave()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>

      <div className="card-surface p-6 space-y-5">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">Saúde operacional</h3>
          <p className="text-body-sm text-text-secondary mt-1">Resumo rápido do quanto essa candidatura já está estruturada no sistema.</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-sm font-medium text-text-primary">Checklist documental</span>
              <span className="text-caption text-text-muted">{documentProgress}%</span>
            </div>
            <Progress value={documentProgress} size="sm" variant={documentProgress >= 60 ? "moss" : "clay"} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-sm font-medium text-text-primary">Timeline executada</span>
              <span className="text-caption text-text-muted">{timelineProgress}%</span>
            </div>
            <Progress value={timelineProgress} size="sm" variant={timelineProgress >= 60 ? "moss" : "clay"} />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-cream-300 bg-cream-50 p-4 md:grid-cols-2">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Tipo</p>
            <p className="text-body-sm text-text-primary">{app.type}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">País</p>
            <p className="text-body-sm text-text-primary">{app.country}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Deadline</p>
            <p className="text-body-sm text-text-primary">{new Date(app.deadline).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Criada em</p>
            <p className="text-body-sm text-text-primary">{new Date(app.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <div className="card-surface p-6 space-y-4">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">Rotas relacionadas</h3>
          <p className="text-body-sm text-text-secondary mt-1">Sugestões com base em país e tipo já existentes no seu workspace.</p>
        </div>

        {suggestedRoutes.length === 0 ? (
          <div className="rounded-xl border border-cream-300 bg-cream-50 p-4 text-body-sm text-text-secondary">
            Nenhuma rota relacionada encontrada ainda. Se fizer sentido, gere uma rota derivada a partir da comunidade ou crie uma nova rota manualmente.
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedRoutes.map((route) => (
              <Link key={route.id} href={`/routes/${route.id}`} className="flex items-center justify-between rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 transition-colors hover:bg-cream-100">
                <div>
                  <p className="text-body-sm font-medium text-text-primary">{route.name}</p>
                  <p className="text-caption text-text-muted">{route.type} • {route.country} • {route.timeline}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card-surface p-6 border border-clay-200">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Zona de Perigo</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void handleArchive()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            <Archive className="w-4 h-4" /> Arquivar
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      </div>

      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="Excluir candidatura?"
        description="Esta ação remove a candidatura da sua lista e não pode ser desfeita."
        confirmLabel="Excluir candidatura"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
