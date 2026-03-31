"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { GitBranch, Info } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function RouteGraphPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { getRouteById } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);

  const stats = useMemo(() => {
    if (!route) return { nodes: 0, edges: 0, blocked: 0 };
    const nodes = route.milestones.length;
    const edges = route.milestones.reduce((s, m) => s + (m.dependsOn?.length ?? 0), 0);
    const blocked = route.milestones.filter((m) => m.status === "blocked").length;
    return { nodes, edges, blocked };
  }, [route]);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-16" /><Skeleton className="h-[500px]" /></div>;
  }

  if (!route) {
    return <div className="max-w-5xl mx-auto"><EmptyState icon={GitBranch} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Grafo de Dependências" subtitle={`Visualização DAG da rota ${route.name}`} />

      <div className="card-surface p-4 flex items-center gap-3 bg-cream-100">
        <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />
        <p className="text-body-sm text-text-secondary">O grafo mostra as dependências entre milestones. Nodes cinzas foram podados por restrições do seu perfil.</p>
      </div>

      <div className="card-surface p-8 min-h-[400px]">
        <div className="space-y-4">
          {Array.from(new Set(route.milestones.map((m) => m.group))).map((group) => {
            const groupMs = route.milestones.filter((m) => m.group === group);
            return (
              <div key={group}>
                <h4 className="font-heading text-caption text-text-muted uppercase tracking-wider mb-2">{group}</h4>
                <div className="flex flex-wrap gap-3">
                  {groupMs.map((m) => {
                    const statusColor = m.status === "completed" ? "bg-brand-500 text-white" : m.status === "in_progress" ? "border-2 border-brand-500 text-brand-500" : m.status === "blocked" ? "bg-clay-300 opacity-50 text-white" : "bg-cream-300 text-text-secondary";
                    const deps = m.dependsOn?.map((dId) => route.milestones.find((x) => x.id === dId)?.name).filter(Boolean) ?? [];
                    return (
                      <div key={m.id} className={`px-4 py-2 rounded-lg text-body-sm font-medium ${statusColor}`} title={deps.length > 0 ? `Depende de: ${deps.join(", ")}` : undefined}>
                        {m.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-body-sm mt-6 pt-4 border-t border-cream-300">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-500" /> Completo</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-brand-500" /> Em progresso</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cream-400" /> Pendente</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-clay-300 opacity-50" /> Bloqueado</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h2 text-brand-500">{stats.nodes}</p>
          <p className="text-caption text-text-muted">Nodes ativos</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h2 text-text-primary">{stats.edges}</p>
          <p className="text-caption text-text-muted">Arestas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading text-h2 text-clay-400">{stats.blocked}</p>
          <p className="text-caption text-text-muted">Bloqueados</p>
        </div>
      </div>
    </div>
  );
}
