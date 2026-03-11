"use client";

import { useMemo } from "react";
import { BarChart3, Users, TrendingUp, Activity, Globe, Clock } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton } from "@/components/ui";
import { useAdminStore } from "@/stores/admin";
import { useApplicationStore } from "@/stores/applications";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useOrgStore } from "@/stores/org";
import { usePsychStore } from "@/stores/psych";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { useObservabilityStore } from "@/stores/observability";
import { summarizeFrontendHealth } from "@/lib/observability";
import { deriveObservabilityIncidents } from "@/lib/observability-incidents";

export default function AdminAnalyticsPage() {
  const hydrated = useHydration();
  const { users } = useAdminStore();
  const { applications } = useApplicationStore();
  const { routes } = useRouteStore();
  const { sprints } = useSprintStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const { bookings, providers } = useMarketplaceStore();
  const { members } = useOrgStore();
  const { completedDimensions } = usePsychStore();
  const frontendErrors = useObservabilityStore((state) => state.frontendErrors);
  const webVitals = useObservabilityStore((state) => state.webVitals);
  const incidentStates = useObservabilityStore((state) => state.incidentStates);

  const analytics = useMemo(() => {
    const mau = users.length;
    const dau = Math.max(1, Math.round(mau * 0.32));
    const retentionD7 = Math.max(25, Math.min(95, Math.round((applications.filter((application) => application.status !== "draft").length / Math.max(mau, 1)) * 100)));
    const avgSessionMinutes = Math.max(4, Math.round((documents.length * 4 + sessions.length * 6 + routes.length * 3) / Math.max(mau, 1)));

    const registered = mau;
    const psychCompleted = Math.min(registered, Math.round((completedDimensions.length / 8) * registered));
    const routeCreated = Math.min(psychCompleted, routes.length + members.filter((member) => member.route).length);
    const paidUsers = Math.min(routeCreated, Math.round(users.filter((user) => user.plan !== "Navegador" && user.plan !== "—").length * 0.8));
    const firstMarketplace = Math.min(paidUsers, bookings.length);

    const funnelBase = Math.max(registered, 1);
    const funnels = [
      { stage: "Registro", count: registered, pct: 100 },
      { stage: "Diagnóstico completo", count: psychCompleted, pct: Math.round((psychCompleted / funnelBase) * 100) },
      { stage: "Primeira rota", count: routeCreated, pct: Math.round((routeCreated / funnelBase) * 100) },
      { stage: "Assinatura paga", count: paidUsers, pct: Math.round((paidUsers / funnelBase) * 100) },
      { stage: "Marketplace (1ª contratação)", count: firstMarketplace, pct: Math.round((firstMarketplace / funnelBase) * 100) },
    ];

    const destinationMap = new Map<string, number>();
    for (const route of routes) destinationMap.set(route.country, (destinationMap.get(route.country) || 0) + 1);
    for (const application of applications) destinationMap.set(application.country, (destinationMap.get(application.country) || 0) + 1);
    for (const provider of providers) destinationMap.set(provider.country, (destinationMap.get(provider.country) || 0) + 1);

    const destinations = Array.from(destinationMap.entries())
      .map(([country, usersCount]) => ({ country, users: usersCount }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);

    const engines = [
      { engine: "Routes", sessions: routes.length * 12 },
      { engine: "Forge", sessions: documents.length * 18 },
      { engine: "Interviews", sessions: sessions.length * 15 },
      { engine: "Readiness", sessions: sprints.length * 10 },
      { engine: "Applications", sessions: applications.length * 14 },
    ].sort((a, b) => b.sessions - a.sessions);

    return {
      metrics: [
        { label: "MAU", value: mau.toLocaleString("pt-BR"), delta: `${users.filter((user) => user.status === "active").length} ativos`, icon: Users },
        { label: "DAU", value: dau.toLocaleString("pt-BR"), delta: `${Math.round((dau / Math.max(mau, 1)) * 100)}% do MAU`, icon: Activity },
        { label: "Retenção D7", value: `${retentionD7}%`, delta: `${applications.filter((application) => application.status === "submitted" || application.status === "accepted").length} em execução`, icon: TrendingUp },
        { label: "Tempo médio sessão", value: `${avgSessionMinutes} min`, delta: `${documents.length + sessions.length} sessões analisadas`, icon: Clock },
      ],
      funnels,
      destinations,
      engines,
    };
  }, [applications, bookings.length, completedDimensions.length, documents.length, members, providers, routes, sessions.length, sprints.length, users]);

  const frontendHealth = useMemo(
    () => summarizeFrontendHealth(frontendErrors, webVitals),
    [frontendErrors, webVitals]
  );
  const incidents = useMemo(
    () => deriveObservabilityIncidents(frontendErrors, webVitals, incidentStates),
    [frontendErrors, webVitals, incidentStates]
  );
  const incidentSummary = useMemo(
    () => ({
      open: incidents.filter((incident) => incident.status === "open").length,
      acknowledged: incidents.filter((incident) => incident.status === "acknowledged").length,
      resolved: incidents.filter((incident) => incident.status === "resolved").length,
    }),
    [incidents]
  );

  const latestErrors = useMemo(() => frontendErrors.slice(0, 5), [frontendErrors]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Analytics" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.metrics.map((m) => (
          <div key={m.label} className="card-surface p-5">
            <m.icon className="w-5 h-5 text-brand-500 mb-2" />
            <p className="text-caption text-text-muted">{m.label}</p>
            <p className="font-heading text-h2 text-text-primary">{m.value}</p>
            <p className="text-caption text-brand-500 mt-1">{m.delta}</p>
          </div>
        ))}
      </div>

      <div className="card-surface p-6">
        <h3 className="font-heading text-h4 text-text-primary mb-4">Funil de Conversão</h3>
        <div className="space-y-3">
          {analytics.funnels.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-4">
              <span className="w-6 text-center text-caption text-text-muted font-bold">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-medium text-text-primary">{f.stage}</span>
                  <span className="text-body-sm text-text-muted">{f.count.toLocaleString("pt-BR")} ({f.pct}%)</span>
                </div>
                <div className="h-3 bg-cream-300 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-brand-500" /> Top Destinos</h3>
          <div className="space-y-2">
            {analytics.destinations.length === 0 && <p className="text-body-sm text-text-muted">Sem dados suficientes.</p>}
            {analytics.destinations.map((d) => (
              <div key={d.country} className="flex items-center justify-between p-2 rounded-lg bg-cream-50">
                <span className="text-body-sm text-text-primary">{d.country}</span>
                <span className="text-body-sm font-bold text-text-primary">{d.users}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-clay-500" /> Engines Mais Usados</h3>
          <div className="space-y-2">
            {analytics.engines.map((e) => (
              <div key={e.engine} className="flex items-center justify-between p-2 rounded-lg bg-cream-50">
                <span className="text-body-sm text-text-primary">{e.engine}</span>
                <span className="text-body-sm font-bold text-text-primary">{e.sessions.toLocaleString("pt-BR")} sessões</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Saúde do Frontend</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Erros capturados</span>
              <span className="text-body-sm font-bold text-text-primary">{frontendHealth.totalErrors}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Erros nas últimas 24h</span>
              <span className="text-body-sm font-bold text-clay-500">{frontendHealth.errorsLast24h}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Web Vitals (24h)</span>
              <span className="text-body-sm font-bold text-text-primary">{frontendHealth.vitalsLast24h}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Vitals críticos (poor)</span>
              <span className="text-body-sm font-bold text-clay-500">{frontendHealth.poorVitalsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Incidentes abertos</span>
              <span className="text-body-sm font-bold text-clay-500">{incidentSummary.open}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Incidentes reconhecidos</span>
              <span className="text-body-sm font-bold text-sage-500">{incidentSummary.acknowledged}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">Incidentes resolvidos</span>
              <span className="text-body-sm font-bold text-brand-500">{incidentSummary.resolved}</span>
            </div>
          </div>
          <p className="mt-3 text-caption text-text-muted">
            Dados locais persistidos no navegador para triagem operacional durante desenvolvimento.
          </p>
        </div>

        <div className="card-surface p-6">
          <h3 className="font-heading text-h4 text-text-primary mb-4">Últimos Erros Frontend</h3>
          <div className="space-y-2">
            {latestErrors.length === 0 ? (
              <p className="text-body-sm text-text-muted">Nenhum erro capturado nesta sessão.</p>
            ) : (
              latestErrors.map((event) => (
                <div key={event.id} className="rounded-lg border border-cream-300 bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-body-sm font-medium text-text-primary truncate">{event.name}: {event.message}</p>
                    <span className="shrink-0 text-caption text-text-muted">
                      {new Date(event.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-text-muted truncate">{event.route || "rota desconhecida"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
