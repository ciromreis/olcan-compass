"use client";

import { useMemo } from "react";
import { Zap, DollarSign, Clock, Activity, Edit, Plus } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useRouteStore } from "@/stores/routes";

export default function AdminAIPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { prompts, togglePromptActive, registerPromptUsage } = useAdminStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { routes } = useRouteStore();

  const totalCalls = useMemo(() => prompts.reduce((s, p) => s + p.calls, 0), [prompts]);
  const totalCost = useMemo(() => prompts.reduce((s, p) => s + p.costBRL, 0), [prompts]);
  const activeCount = useMemo(() => prompts.filter((p) => p.active).length, [prompts]);
  const successRate = useMemo(() => {
    const inactiveRatio = prompts.length > 0 ? (prompts.filter((prompt) => !prompt.active).length / prompts.length) : 0;
    return Math.max(90, Math.round((99 - inactiveRatio * 4) * 10) / 10);
  }, [prompts]);
  const syntheticLatency = useMemo(() => {
    const complexityBase = documents.length * 0.03 + sessions.length * 0.02 + routes.length * 0.01;
    return Math.max(0.9, Math.min(4.5, 1.2 + complexityBase)).toFixed(1);
  }, [documents.length, routes.length, sessions.length]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="IA & Prompts" subtitle={`${activeCount} prompts ativos · ${totalCalls.toLocaleString("pt-BR")} chamadas`} />

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card-surface p-5"><Zap className="w-5 h-5 text-brand-500 mb-2" /><p className="text-caption text-text-muted">Chamadas/mês</p><p className="font-heading text-h2 text-text-primary">{(totalCalls / 1000).toFixed(1)}k</p></div>
        <div className="card-surface p-5"><DollarSign className="w-5 h-5 text-clay-500 mb-2" /><p className="text-caption text-text-muted">Custo/mês</p><p className="font-heading text-h2 text-clay-500">R$ {Math.round(totalCost).toLocaleString("pt-BR")}</p></div>
        <div className="card-surface p-5"><Clock className="w-5 h-5 text-text-muted mb-2" /><p className="text-caption text-text-muted">Latência</p><p className="font-heading text-h2 text-text-primary">{syntheticLatency}s</p></div>
        <div className="card-surface p-5"><Activity className="w-5 h-5 text-brand-500 mb-2" /><p className="text-caption text-text-muted">Sucesso</p><p className="font-heading text-h2 text-brand-500">{successRate}%</p></div>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-h4 text-text-primary">Prompt Registry</h3>
          <button
            onClick={() => {
              registerPromptUsage("forge_analysis", 50, 6.5, actorEmail);
              toast({
                title: "Novo ciclo registrado",
                description: "Uso sintético foi adicionado ao prompt forge_analysis.",
                variant: "success",
              });
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-caption font-medium"
          >
            <Plus className="w-3 h-3" /> Registrar uso
          </button>
        </div>
        <div className="space-y-2">
          {prompts.map((p) => (
            <div key={p.name} className={`flex items-center gap-4 p-4 rounded-lg bg-cream-50 ${!p.active ? "opacity-50" : ""}`}>
              <div className="flex-1">
                <p className="text-body-sm font-medium text-text-primary font-mono">{p.name}</p>
                <p className="text-caption text-text-muted">{p.model} · {p.calls.toLocaleString()} chamadas</p>
              </div>
              <span className="text-body-sm font-bold text-text-primary">R$ {Math.round(p.costBRL).toLocaleString("pt-BR")}</span>
              <span className={`text-caption font-medium ${p.active ? "text-brand-500" : "text-text-muted"}`}>{p.active ? "Ativo" : "Inativo"}</span>
              <button onClick={() => togglePromptActive(p.name, actorEmail)} className="p-1.5 rounded hover:bg-cream-200"><Edit className="w-4 h-4 text-text-muted" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
