"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Star, Shield, MapPin, ArrowRight, SlidersHorizontal } from "lucide-react";
import { useMarketplaceStore, CATEGORY_LABELS, type ServiceCategory } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, Input, PageHeader, Skeleton } from "@/components/ui";

const CATEGORY_FILTER_OPTIONS: { key: "all" | ServiceCategory; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "immigration_consulting", label: "Jurídico" },
  { key: "translation", label: "Tradução" },
  { key: "career_coaching", label: "Coaching" },
  { key: "academic_mentoring", label: "Acadêmico" },
  { key: "language_tutoring", label: "Idiomas" },
  { key: "financial_planning", label: "Financeiro" },
];

function MarketplaceSearchContent() {
  const hydrated = useHydration();
  const searchParams = useSearchParams();
  const { providers } = useMarketplaceStore();
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | ServiceCategory>("all");

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (!cat) return;
    const isValidCategory = CATEGORY_FILTER_OPTIONS.some((option) => option.key === cat);
    if (isValidCategory) {
      setCatFilter(cat as "all" | ServiceCategory);
    }
  }, [searchParams]);

  const results = useMemo(() => {
    if (!hydrated) return [];
    let list = providers;
    if (catFilter !== "all") {
      list = list.filter((p) => p.specialties.includes(catFilter));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) || p.country.toLowerCase().includes(q) || p.specialties.some((s) => (CATEGORY_LABELS[s] ?? "").toLowerCase().includes(q)));
    }
    return list;
  }, [hydrated, providers, query, catFilter]);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Buscar Profissionais" subtitle={catFilter !== "all" ? `Filtrando por ${CATEGORY_FILTER_OPTIONS.find((option) => option.key === catFilter)?.label}` : undefined} />

      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, país ou especialidade..."
          icon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <button onClick={() => setCatFilter("all")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> Limpar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTER_OPTIONS.map((f) => (
          <button key={f.key} onClick={() => setCatFilter(f.key)} className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${f.key === catFilter ? "bg-moss-500 text-white" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>{f.label}</button>
        ))}
      </div>

      <p className="text-body-sm text-text-muted">{results.length} resultado{results.length !== 1 ? "s" : ""}{query.trim() ? ` para "${query}"` : ""}</p>

      {results.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum resultado" description="Tente ajustar sua busca ou filtros." />
      ) : (
        <div className="space-y-4">
          {results.map((pro) => {
            const minPrice = pro.services.length > 0 ? Math.min(...pro.services.map((s) => s.price)) : 0;
            return (
              <Link key={pro.id} href={`/marketplace/provider/${pro.id}`} className="card-surface p-6 flex flex-col md:flex-row md:items-center gap-4 group hover:-translate-y-0.5 transition-transform">
                <div className="w-14 h-14 rounded-full bg-moss-50 flex items-center justify-center flex-shrink-0 text-moss-500 font-heading font-bold text-h4">
                  {pro.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-h4 text-text-primary">{pro.name}</h3>
                  <p className="text-body-sm text-text-secondary line-clamp-1">{pro.bio}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-caption text-text-muted">
                    {pro.specialties.slice(0, 2).map((s) => <span key={s} className="px-2 py-0.5 rounded-full bg-cream-200">{CATEGORY_LABELS[s]}</span>)}
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-clay-500 fill-current" />{pro.rating.toFixed(1)} ({pro.reviewCount})</span>
                    {pro.verified && <span className="flex items-center gap-1 text-moss-500"><Shield className="w-3 h-3" />Verificado</span>}
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {minPrice > 0 && <p className="text-body-sm font-bold text-text-primary">R$ {minPrice}</p>}
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-moss-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarketplaceSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      }
    >
      <MarketplaceSearchContent />
    </Suspense>
  );
}
