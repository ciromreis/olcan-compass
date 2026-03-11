"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, FileText, MessageSquare, AlertTriangle, ArrowRight, Milestone as MilestoneIcon } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { daysUntil } from "@/lib/format";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: "Concluído", color: "bg-moss-500" },
  in_progress: { label: "Em progresso", color: "bg-moss-500" },
  pending: { label: "Pendente", color: "bg-cream-400" },
  blocked: { label: "Bloqueado", color: "bg-clay-400" },
};

export default function MilestoneDetailPage() {
  const { id, mid } = useParams<{ id: string; mid: string }>();
  const hydrated = useHydration();
  const { getRouteById, setMilestoneStatus } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);
  const milestone = useMemo(() => route?.milestones.find((m) => m.id === mid), [route, mid]);

  const deps = useMemo(() => {
    if (!route || !milestone?.dependsOn) return [];
    return milestone.dependsOn.map((dId) => route.milestones.find((m) => m.id === dId)).filter(Boolean);
  }, [route, milestone]);

  const days = milestone?.dueDate ? daysUntil(milestone.dueDate) : null;

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div><Skeleton className="h-40" /></div>;
  }

  if (!route || !milestone) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={MilestoneIcon} title="Milestone não encontrado" description="Verifique o ID da rota e do milestone." /></div>;
  }

  const st = STATUS_LABELS[milestone.status] ?? STATUS_LABELS.pending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}/milestones`} title={milestone.name} subtitle={milestone.group} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <p className="text-caption text-text-muted mb-1">Status</p>
          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${st.color}`} /><span className="text-body-sm font-medium text-text-primary">{st.label}</span></div>
        </div>
        <div className="card-surface p-4">
          <p className="text-caption text-text-muted mb-1">Prazo</p>
          <p className="text-body-sm font-medium text-text-primary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "Sem prazo"}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="text-caption text-text-muted mb-1">Dependências</p>
          {deps.length > 0 ? (
            <div className="space-y-1">
              {deps.map((d) => (
                <p key={d!.id} className="text-body-sm font-medium text-text-primary">
                  {d!.name} {d!.status === "completed" ? "✓" : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-text-muted">Nenhuma</p>
          )}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-3">Recursos Vinculados</h3>
        <div className="space-y-2">
          <Link href="/forge" className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-100 transition-colors">
            <FileText className="w-5 h-5 text-moss-500" />
            <div className="flex-1"><p className="text-body-sm font-medium text-text-primary">Documentos no Forge</p><p className="text-caption text-text-muted">Acesse o Forge para editar documentos relacionados</p></div>
            <ArrowRight className="w-4 h-4 text-text-muted" />
          </Link>
          <Link href="/marketplace" className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-100 transition-colors">
            <MessageSquare className="w-5 h-5 text-clay-500" />
            <div className="flex-1"><p className="text-body-sm font-medium text-text-primary">Revisão por especialista</p><p className="text-caption text-text-muted">Marketplace — contrate um profissional</p></div>
            <ArrowRight className="w-4 h-4 text-text-muted" />
          </Link>
        </div>
      </div>

      {days !== null && days <= 21 && days >= 0 && milestone.status !== "completed" && (
        <div className="card-surface p-6 border-l-4 border-clay-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-clay-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-body-sm font-heading font-semibold text-text-primary">Risco identificado</h4>
              <p className="text-body-sm text-text-secondary mt-1">
                O prazo para este milestone está a {days} dia{days !== 1 ? "s" : ""}. Priorize a conclusão.
              </p>
            </div>
          </div>
        </div>
      )}

      {milestone.status !== "completed" && (
        <div className="flex gap-3">
          <button onClick={() => setMilestoneStatus(id, mid, "completed")} className="flex-1 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Marcar como Concluído
          </button>
        </div>
      )}
    </div>
  );
}
