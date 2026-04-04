"use client";

import { useMemo, useState } from "react";
import { Users, GraduationCap, ChevronRight, Activity, Search } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function OrgCohortsPage() {
  const hydrated = useHydration();

  const [cohorts] = useState([
    { id: "c1", name: "Engenharia 2024.1", members: 45, routes: 12, avgScore: 78, status: "active" },
    { id: "c2", name: "Business School 2024.1", members: 60, routes: 15, avgScore: 82, status: "active" },
    { id: "c3", name: "Medicina USP - Exchange", members: 15, routes: 5, avgScore: 91, status: "planning" },
  ]);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return cohorts;
    return cohorts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, cohorts]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/org" title="Cohorts (Grupos)" subtitle={`${cohorts.length} cohorts ativos`} />

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cohort por nome..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? filtered.map((c) => (
          <div key={c.id} className="card-surface p-5 flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-brand-500" />
              </div>
              <span className={`text-caption px-2 py-1 rounded-full font-medium ${c.status === 'active' ? 'bg-brand-50 text-brand-600' : 'bg-cream-200 text-text-muted'}`}>
                {c.status === 'active' ? 'Em Progresso' : 'Planejamento'}
              </span>
            </div>
            
            <h3 className="font-heading text-h4 text-text-primary mb-1">{c.name}</h3>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                <Users className="w-4 h-4 text-text-muted" /> {c.members} Membros
              </div>
              <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                <Activity className="w-4 h-4 text-text-muted" /> {c.avgScore} Readiness Médio
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between">
              <span className="text-body-sm font-medium text-brand-600 group-hover:text-brand-700 transition-colors">Ver detalhes</span>
              <ChevronRight className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <EmptyState icon={GraduationCap} title="Nenhum cohort encontrado." description="Ajuste os filtros de busca." />
          </div>
        )}
      </div>
    </div>
  );
}
