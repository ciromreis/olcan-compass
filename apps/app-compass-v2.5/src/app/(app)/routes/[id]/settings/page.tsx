"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Archive, Settings, ArrowRight, AlertTriangle, Clock, GitBranch, Route as RouteIcon } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { ConfirmationModal, EmptyState, PageHeader, Progress, Skeleton, useToast } from "@/components/ui";

export default function RouteSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { getRouteById, getRouteProgress, getNextMilestone, removeRoute } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);
  const progress = route ? getRouteProgress(id) : 0;
  const nextMilestone = route ? getNextMilestone(id) : null;
  const completedMilestones = route?.milestones.filter((milestone) => milestone.status === "completed").length ?? 0;
  const inProgressMilestones = route?.milestones.filter((milestone) => milestone.status === "in_progress").length ?? 0;
  const nearRiskMilestones = route?.milestones.filter(
    (milestone) => milestone.status !== "completed" && milestone.dueDate && new Date(milestone.dueDate) < new Date(Date.now() + 30 * 86400000)
  ).length ?? 0;
  const groupedMilestones = useMemo(() => {
    if (!route) return [];
    return Array.from(new Set(route.milestones.map((milestone) => milestone.group))).map((group) => ({
      group,
      milestones: route.milestones.filter((milestone) => milestone.group === group),
    }));
  }, [route]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>;
  }

  if (!route) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={Settings} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  const handleArchive = () => {
    toast({
      title: "Arquivamento indisponível no store atual",
      description: "Use o progresso e os milestones da rota para encerrar acompanhamento manualmente por enquanto.",
      variant: "info",
    });
  };

  const handleDelete = async () => {
    await removeRoute(id);
    toast({
      title: "Rota removida",
      description: "A rota foi excluída da sua área de planejamento.",
      variant: "warning",
    });
    router.push("/routes");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Configurações da Rota" subtitle="Visão operacional da rota com foco no que já existe no store hoje." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4 text-center">
          <RouteIcon className="mx-auto mb-2 h-5 w-5 text-brand-500" />
          <p className="font-heading text-h3 text-text-primary">{progress}%</p>
          <p className="text-caption text-text-muted">Progresso geral</p>
        </div>
        <div className="card-surface p-4 text-center">
          <GitBranch className="mx-auto mb-2 h-5 w-5 text-sage-500" />
          <p className="font-heading text-h3 text-text-primary">{inProgressMilestones}</p>
          <p className="text-caption text-text-muted">Milestones em andamento</p>
        </div>
        <div className="card-surface p-4 text-center">
          <AlertTriangle className={`mx-auto mb-2 h-5 w-5 ${nearRiskMilestones > 0 ? "text-clay-500" : "text-text-muted"}`} />
          <p className="font-heading text-h3 text-text-primary">{nearRiskMilestones}</p>
          <p className="text-caption text-text-muted">Riscos próximos</p>
        </div>
      </div>

      <div className="card-surface p-6 space-y-4">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">Resumo da rota</h3>
          <p className="text-body-sm text-text-secondary mt-1">Campos atualmente persistidos na rota e indicadores do plano gerado.</p>
        </div>

        <div className="grid gap-3 rounded-xl border border-cream-300 bg-cream-50 p-4 md:grid-cols-2">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Nome</p>
            <p className="text-body-sm text-text-primary">{route.name}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Tipo</p>
            <p className="text-body-sm text-text-primary">{route.type}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">País</p>
            <p className="text-body-sm text-text-primary">{route.country}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Timeline</p>
            <p className="text-body-sm text-text-primary">{route.timeline}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Budget</p>
            <p className="text-body-sm text-text-primary">{route.budget}</p>
          </div>
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Criada em</p>
            <p className="text-body-sm text-text-primary">{new Date(route.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-body-sm font-medium text-text-primary">Execução da rota</span>
            <span className="text-caption text-text-muted">{progress}%</span>
          </div>
          <Progress value={progress} size="sm" variant={progress >= 60 ? "moss" : "clay"} />
        </div>
      </div>

      <div className="card-surface p-6 space-y-4">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">Próximo foco operacional</h3>
          <p className="text-body-sm text-text-secondary mt-1">Use os milestones e os riscos da rota como centro da execução, já que estes são os dados realmente vivos no store atual.</p>
        </div>

        {nextMilestone ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-brand-600">Próxima milestone</p>
                <p className="mt-1 text-body-sm font-medium text-text-primary">{nextMilestone.name}</p>
                <p className="mt-1 text-caption text-text-muted">Etapa: {nextMilestone.group}</p>
                {nextMilestone.dueDate ? (
                  <p className="mt-1 text-caption text-text-muted">Prazo: {new Date(nextMilestone.dueDate).toLocaleDateString("pt-BR")}</p>
                ) : null}
              </div>
              <Link href={`/routes/${id}/milestones`} className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-3 py-2 text-body-sm font-medium text-brand-700 transition-colors hover:bg-brand-50">
                Ver milestones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-cream-300 bg-cream-50 p-4 text-body-sm text-text-secondary">
            Esta rota não tem uma próxima milestone ativa no momento.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <Link href={`/routes/${id}/milestones`} className="rounded-xl border border-cream-300 bg-cream-50 p-4 transition-colors hover:bg-cream-100">
            <GitBranch className="mb-2 h-5 w-5 text-brand-500" />
            <p className="text-body-sm font-medium text-text-primary">Milestones</p>
            <p className="mt-1 text-caption text-text-muted">{completedMilestones}/{route.milestones.length} concluídas</p>
          </Link>
          <Link href={`/routes/${id}/timeline`} className="rounded-xl border border-cream-300 bg-cream-50 p-4 transition-colors hover:bg-cream-100">
            <Clock className="mb-2 h-5 w-5 text-sage-500" />
            <p className="text-body-sm font-medium text-text-primary">Timeline</p>
            <p className="mt-1 text-caption text-text-muted">Visualizar sequência temporal da rota</p>
          </Link>
          <Link href={`/routes/${id}/risk`} className="rounded-xl border border-cream-300 bg-cream-50 p-4 transition-colors hover:bg-cream-100">
            <AlertTriangle className="mb-2 h-5 w-5 text-clay-500" />
            <p className="text-body-sm font-medium text-text-primary">Riscos</p>
            <p className="mt-1 text-caption text-text-muted">{nearRiskMilestones} checkpoint{nearRiskMilestones !== 1 ? "s" : ""} sensível{nearRiskMilestones !== 1 ? "eis" : ""}</p>
          </Link>
        </div>

        <div className="space-y-3">
          {groupedMilestones.map(({ group, milestones }) => (
            <div key={group} className="rounded-xl border border-cream-300 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm font-medium text-text-primary">{group}</p>
                  <p className="text-caption text-text-muted">{milestones.filter((milestone) => milestone.status === "completed").length}/{milestones.length} concluídas</p>
                </div>
                <span className="text-caption text-text-muted">{milestones.filter((milestone) => milestone.status === "in_progress").length} em andamento</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-6 border border-clay-200">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Zona de Perigo</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleArchive} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            <Archive className="w-4 h-4" /> Arquivar Rota
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-clay-300 text-clay-500 text-body-sm font-medium hover:bg-clay-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Excluir Rota
          </button>
        </div>
      </div>

      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="Excluir rota?"
        description="Esta ação remove a rota e todos os milestones persistidos localmente para ela. Não pode ser desfeita."
        confirmLabel="Excluir rota"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
