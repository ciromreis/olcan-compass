"use client";

import Link from "next/link";
import { BarChart3, Crown, FileText, Mic, Route, Target } from "lucide-react";
import { useHydration } from "@/hooks";
import { useApplicationStore } from "@/stores/applications";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { useProfileStore } from "@/stores/profile";
import { PageHeader, Progress, Skeleton } from "@/components/ui";

const LIMITS = {
  free: { routes: 1, forge: 1, interviews: 2, sprints: 1, applications: 5 },
  pro: { routes: 3, forge: 999, interviews: 999, sprints: 4, applications: 25 },
  premium: { routes: 999, forge: 999, interviews: 999, sprints: 999, applications: 999 },
} as const;

export default function SubscriptionUsagePage() {
  const hydrated = useHydration();
  const { plan: currentPlan, subscriptionStatus } = useProfileStore();
  const { applications } = useApplicationStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { routes } = useRouteStore();
  const { sprints } = useSprintStore();

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  const usage = [
    { key: "routes", label: "Rotas ativas", icon: Route, used: routes.length, limit: LIMITS[currentPlan].routes },
    { key: "forge", label: "Documentos no Forge", icon: FileText, used: documents.length, limit: LIMITS[currentPlan].forge },
    { key: "interviews", label: "Sessões de entrevista", icon: Mic, used: sessions.length, limit: LIMITS[currentPlan].interviews },
    { key: "sprints", label: "Sprints ativos", icon: Target, used: sprints.length, limit: LIMITS[currentPlan].sprints },
    { key: "applications", label: "Candidaturas monitoradas", icon: BarChart3, used: applications.length, limit: LIMITS[currentPlan].applications },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        backHref="/subscription"
        title="Uso do Plano"
        subtitle={subscriptionStatus === "cancel_at_period_end"
          ? "Sua assinatura segue ativa até o fim do ciclo atual. Acompanhe o consumo antes do downgrade."
          : "Acompanhe seus limites e veja quando faz sentido expandir sua capacidade operacional"}
        actions={
          <Link href="/subscription" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors">
            <Crown className="w-4 h-4" /> Ver planos
          </Link>
        }
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {usage.map((item) => {
          const Icon = item.icon;
          const unlimited = item.limit >= 999;
          const pct = unlimited ? Math.min(100, item.used * 8) : Math.min(100, (item.used / Math.max(item.limit, 1)) * 100);
          const nearLimit = !unlimited && pct >= 75;

          return (
            <div key={item.key} className="card-surface p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-moss-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-moss-500" />
                </div>
                <span className={`text-caption px-2 py-1 rounded-full font-medium ${nearLimit ? "bg-clay-50 text-clay-500" : "bg-cream-100 text-text-secondary"}`}>
                  {unlimited ? "Sem limite rígido" : `${item.used}/${item.limit}`}
                </span>
              </div>

              <div>
                <h3 className="font-heading text-h4 text-text-primary">{item.label}</h3>
                <p className="text-body-sm text-text-secondary mt-1">
                  {unlimited ? "Seu plano acomoda expansão contínua nesta área." : "Capacidade atual do plano Navegador nesta dimensão."}
                </p>
              </div>

              <Progress value={pct} size="sm" variant={nearLimit ? "clay" : "moss"} showLabel label="Consumo" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
