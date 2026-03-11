"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, Sliders, GitBranch } from "lucide-react";
import { useRouteStore } from "@/stores/routes";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function RouteIteratePage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydration();
  const { getRouteById, getRouteProgress } = useRouteStore();

  const route = useMemo(() => hydrated ? getRouteById(id) : undefined, [hydrated, getRouteById, id]);

  const [budget, setBudget] = useState(() => route?.budget?.replace(/\D/g, "") || "18000");
  const [timeline, setTimeline] = useState(() => route?.timeline?.replace(/\D/g, "") || "12");

  const progress = useMemo(() => hydrated ? getRouteProgress(id) : 0, [hydrated, getRouteProgress, id]);
  const totalMs = route?.milestones.length ?? 0;
  const blocked = route?.milestones.filter((m) => m.status === "blocked").length ?? 0;

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div>;
  }

  if (!route) {
    return <div className="max-w-3xl mx-auto"><EmptyState icon={GitBranch} title="Rota não encontrada" description="Verifique o ID da rota." /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader backHref={`/routes/${id}`} title="Iterar Rota" subtitle="Ajuste parâmetros e veja como a rota recalcula" />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Sliders className="w-5 h-5 text-moss-500" /> Parâmetros</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Orçamento (BRL)</label>
            <input type="range" min="5000" max="100000" step="1000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full accent-moss-500" />
            <div className="flex justify-between text-caption text-text-muted mt-1"><span>R$ 5.000</span><span className="font-bold text-text-primary">R$ {Number(budget).toLocaleString("pt-BR")}</span><span>R$ 100.000</span></div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Prazo (meses)</label>
            <input type="range" min="3" max="36" step="1" value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full accent-moss-500" />
            <div className="flex justify-between text-caption text-text-muted mt-1"><span>3 meses</span><span className="font-bold text-text-primary">{timeline} meses</span><span>36 meses</span></div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">País de destino</label>
            <select defaultValue={route.country} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
              <option>Alemanha</option><option>Canadá</option><option>Irlanda</option><option>Holanda</option><option>Portugal</option><option>Reino Unido</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Impacto da Iteração</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-caption text-text-muted mb-1">Progresso</p><p className="font-heading text-h2 text-moss-500">{Math.round(progress)}%</p></div>
          <div><p className="text-caption text-text-muted mb-1">Milestones</p><p className="font-heading text-h2 text-text-primary">{totalMs}</p></div>
          <div><p className="text-caption text-text-muted mb-1">Bloqueados</p><p className="font-heading text-h2 text-clay-400">{blocked}</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          <RefreshCw className="w-4 h-4" /> Recalcular Rota
        </button>
      </div>
    </div>
  );
}
