"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Route, MapPin, Clock, DollarSign, ArrowRight, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useRouteStore } from "@/stores/routes";
import { useAuthStore } from "@/stores/auth";
import { useEffectivePlan } from "@/hooks/use-effective-plan";
import { canCreateRoute, maxRoutes } from "@/lib/entitlements";
import { useHydration } from "@/hooks/use-hydration";
import { EmptyState, Input, PageHeader, Progress, Skeleton } from "@/components/ui";

type RouteFilter = "all" | "active" | "completed";

export default function RoutesListPage() {
  const ready = useHydration();
  const { routes, getRouteProgress, syncFromApi } = useRouteStore();
  const { user } = useAuthStore();
  const plan = useEffectivePlan();

  // Sync routes from backend when authenticated
  useEffect(() => {
    if (user?.id) syncFromApi();
  }, [user?.id, syncFromApi]);
  const routeAllowed = canCreateRoute(plan, routes.length);
  const routeCap = maxRoutes(plan);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RouteFilter>("all");

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const progress = getRouteProgress(route.id);
      const term = search.trim().toLowerCase();
      const matchesSearch = !term
        || route.name.toLowerCase().includes(term)
        || route.country.toLowerCase().includes(term)
        || route.type.toLowerCase().includes(term);
      const matchesFilter = filter === "all"
        || (filter === "completed" ? progress === 100 : progress < 100);
      return matchesSearch && matchesFilter;
    });
  }, [routes, getRouteProgress, search, filter]);

  const summary = useMemo(() => {
    const completed = routes.filter((route) => getRouteProgress(route.id) === 100).length;
    const active = routes.length - completed;
    const avgProgress = routes.length > 0
      ? Math.round(routes.reduce((sum, route) => sum + getRouteProgress(route.id), 0) / routes.length)
      : 0;
    return { completed, active, avgProgress };
  }, [routes, getRouteProgress]);

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Minhas Rotas"
        subtitle="Gerencie seus caminhos de mobilidade"
        actions={
          routeAllowed ? (
            <Link href="/routes/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
              <Plus className="w-4 h-4" /> Nova Rota
            </Link>
          ) : (
            <Link href="/subscription" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-slate-500 bg-slate-50 text-slate-950 font-heading font-semibold text-body-sm hover:bg-slate-100 transition-colors">
              <Plus className="w-4 h-4" /> Upgrade para mais rotas
            </Link>
          )
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-text-primary">{routes.length}</p>
          <p className="text-caption text-text-muted">Total</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-brand-500">{summary.active}</p>
          <p className="text-caption text-text-muted">Em andamento</p>
        </div>
        <div className="card-surface p-5 text-center">
          <p className="font-heading text-h2 text-text-primary">{summary.avgProgress}%</p>
          <p className="text-caption text-text-muted">Progresso médio</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar rotas..." aria-label="Buscar rotas" icon={<Search className="w-4 h-4" />} className="flex-1" />
        <button onClick={() => { setSearch(""); setFilter("all"); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Filter className="w-4 h-4" /> Limpar
        </button>
      </div>

      {!routeAllowed && routes.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-body-sm text-slate-950">
          Seu plano permite até {Number.isFinite(routeCap) ? routeCap : "∞"} rotas.
          <Link href="/subscription" className="ml-1 font-semibold text-brand-700 underline underline-offset-2">
            Fazer upgrade
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${filter === "all" ? "bg-brand-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>Todas</button>
        <button onClick={() => setFilter("active")} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${filter === "active" ? "bg-brand-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>Em andamento</button>
        <button onClick={() => setFilter("completed")} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${filter === "completed" ? "bg-brand-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>Concluídas</button>
      </div>

      {routes.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Nenhuma rota criada"
          description="Comece criando sua primeira rota de mobilidade."
          action={<Link href="/routes/new" className="text-brand-500 font-medium hover:underline">Criar primeira rota →</Link>}
        />
      ) : filteredRoutes.length === 0 ? (
        <EmptyState icon={Search} title="Nenhuma rota encontrada" description="Tente ajustar sua busca ou filtro atual." />
      ) : (
        <div className="grid gap-4">
          {filteredRoutes.map((route) => {
            const progress = getRouteProgress(route.id);
            const completedCount = route.milestones.filter((m) => m.status === "completed").length;
            return (
              <Link key={route.id} href={`/routes/${route.id}`} className="card-surface p-6 group hover:-translate-y-0.5 transition-transform">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Route className="w-6 h-6 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-h4 text-text-primary truncate">{route.name}</h3>
                      <span className="text-caption px-2 py-0.5 rounded-full bg-cream-200 text-text-muted flex-shrink-0">{route.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-body-sm text-text-secondary">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{route.country}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{route.timeline}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{route.budget}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-heading font-bold text-text-primary">{progress}%</p>
                      <p className="text-caption text-text-muted">{completedCount}/{route.milestones.length} milestones</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
                <Progress value={progress} size="sm" variant={progress >= 100 ? "moss" : "clay"} className="mt-4" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
