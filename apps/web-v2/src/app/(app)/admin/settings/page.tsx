"use client";

import { useEffect, useState } from "react";
import { Settings, ToggleRight, ToggleLeft, Save } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, useToast } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";

export default function AdminSettingsPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { featureFlags, platformLimits, toggleFeatureFlag, updatePlatformLimits } = useAdminStore();
  const [limitsDraft, setLimitsDraft] = useState(platformLimits);

  useEffect(() => {
    setLimitsDraft(platformLimits);
  }, [platformLimits]);

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Configurações da Plataforma" />

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-moss-500" /> Feature Flags</h3>
        <div className="space-y-2">
          {featureFlags.map((flag) => (
            <button key={flag.key} onClick={() => toggleFeatureFlag(flag.key, actorEmail)} className="w-full flex items-center justify-between p-4 rounded-lg bg-cream-50 hover:bg-cream-100 transition-colors text-left">
              <div>
                <p className="text-body-sm font-medium text-text-primary">{flag.label}</p>
                <p className="text-caption text-text-muted font-mono">{flag.key}</p>
              </div>
              {flag.enabled ? <ToggleRight className="w-6 h-6 text-moss-500" /> : <ToggleLeft className="w-6 h-6 text-text-muted" />}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Limites Globais</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Max rotas por usuário (free)</label>
            <input type="number" value={limitsDraft.freeRoutes} onChange={(event) => setLimitsDraft((state) => ({ ...state, freeRoutes: Number(event.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Max rotas por usuário (pro)</label>
            <input type="number" value={limitsDraft.proRoutes} onChange={(event) => setLimitsDraft((state) => ({ ...state, proRoutes: Number(event.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">AI calls/dia (free)</label>
            <input type="number" value={limitsDraft.freeAICallsDay} onChange={(event) => setLimitsDraft((state) => ({ ...state, freeAICallsDay: Number(event.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400" />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">AI calls/dia (pro)</label>
            <input type="number" value={limitsDraft.proAICallsDay} onChange={(event) => setLimitsDraft((state) => ({ ...state, proAICallsDay: Number(event.target.value) || 0 }))} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400" />
          </div>
        </div>
        <button
          onClick={() => {
            updatePlatformLimits(limitsDraft, actorEmail);
            toast({
              title: "Configurações salvas",
              description: "Feature flags e limites globais atualizados.",
              variant: "success",
            });
          }}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors"
        >
          <Save className="w-4 h-4" /> Salvar Configurações
        </button>
      </div>
    </div>
  );
}
