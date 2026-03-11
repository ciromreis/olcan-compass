"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Star, Shield, ArrowRight } from "lucide-react";
import { useMarketplaceStore, CATEGORY_LABELS, type ServiceCategory } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const hydrated = useHydration();
  const { providers } = useMarketplaceStore();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("Todos");

  const category = slug as ServiceCategory | undefined;
  const categoryLabel = category ? CATEGORY_LABELS[category] ?? slug : slug;

  const filtered = useMemo(() => {
    if (!hydrated) return [];
    let list = providers;
    if (category) {
      list = list.filter((p) => p.specialties.includes(category));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q));
    }
    if (countryFilter !== "Todos") {
      list = list.filter((p) => p.country.toLowerCase().includes(countryFilter.toLowerCase()));
    }
    return list;
  }, [hydrated, providers, category, search, countryFilter]);

  const countries = useMemo(() => {
    const set = new Set(providers.map((p) => p.country));
    return ["Todos", ...Array.from(set)];
  }, [providers]);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader backHref="/marketplace" title={categoryLabel} subtitle={`${filtered.length} profissional${filtered.length !== 1 ? "is" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nesta categoria..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Filter className="w-4 h-4" /> Filtrar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {countries.map((f) => (
          <button key={f} onClick={() => setCountryFilter(f)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${f === countryFilter ? "bg-brand-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum profissional encontrado" description="Tente ajustar os filtros ou a busca." />
      ) : (
        <div className="space-y-4">
          {filtered.map((pro) => {
            const hasActive = pro.services.some((s) => s.isActive);
            const minPrice = pro.services.length > 0 ? Math.min(...pro.services.map((s) => s.price)) : 0;
            return (
              <Link key={pro.id} href={`/marketplace/provider/${pro.id}`} className="card-surface p-6 flex flex-col md:flex-row md:items-center gap-4 group hover:-translate-y-0.5 transition-transform">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500 font-heading font-bold text-h4">
                  {pro.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-h4 text-text-primary">{pro.name}</h3>
                    {pro.verified && <Shield className="w-4 h-4 text-brand-500" />}
                    {!hasActive && <span className="text-caption px-2 py-0.5 rounded-full bg-cream-200 text-text-muted">Indisponível</span>}
                  </div>
                  <p className="text-body-sm text-text-secondary line-clamp-1">{pro.bio}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-caption text-text-muted">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-clay-500 fill-current" />{pro.rating.toFixed(1)} ({pro.reviewCount})</span>
                    <span>{pro.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {minPrice > 0 && <p className="text-body-sm font-bold text-text-primary">R$ {minPrice}</p>}
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
