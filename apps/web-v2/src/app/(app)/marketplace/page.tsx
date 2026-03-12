"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Shield, Scale, Languages, MessageSquare, GraduationCap, Heart, Calendar, BookOpen, DollarSign, Briefcase } from "lucide-react";
import { useMarketplaceStore, CATEGORY_LABELS, type ServiceCategory } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, Input, PageHeader, Skeleton } from "@/components/ui";

const CATEGORY_ICONS: Record<ServiceCategory, typeof Scale> = {
  immigration_consulting: Scale,
  translation: Languages,
  interview_coaching: MessageSquare,
  academic_mentoring: GraduationCap,
  career_coaching: Briefcase,
  cv_review: BookOpen,
  language_tutoring: Heart,
  financial_planning: DollarSign,
};

export default function MarketplacePage() {
  const hydrated = useHydration();
  const { providers, getStats, syncFromApi } = useMarketplaceStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    syncFromApi();
  }, [syncFromApi]);

  const stats = getStats();

  const filteredProviders = useMemo(() => {
    if (!search.trim()) return providers;
    const lc = search.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(lc) ||
        p.bio.toLowerCase().includes(lc) ||
        p.specialties.some((s) => CATEGORY_LABELS[s].toLowerCase().includes(lc))
    );
  }, [providers, search]);

  const categories = useMemo(() => {
    const cats = Object.keys(CATEGORY_LABELS) as ServiceCategory[];
    return cats.map((cat) => ({
      id: cat,
      label: CATEGORY_LABELS[cat],
      icon: CATEGORY_ICONS[cat],
      count: providers.filter((p) => p.specialties.includes(cat)).length,
    }));
  }, [providers]);

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        <div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Marketplace" subtitle="Profissionais verificados para cada etapa da sua jornada" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.totalBookings}</p>
          <p className="text-caption text-text-muted">Contratações</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-brand-500">{stats.completedBookings}</p>
          <p className="text-caption text-text-muted">Concluídas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">R$ {stats.totalSpent}</p>
          <p className="text-caption text-text-muted">Investido</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">{stats.unreadMessages > 0 ? stats.unreadMessages : "—"}</p>
          <p className="text-caption text-text-muted">Mensagens novas</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar profissionais ou serviços..."
          icon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <Link href="/marketplace/bookings" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <Calendar className="w-4 h-4" /> Contratações
        </Link>
        <Link href="/marketplace/messages" className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
          <MessageSquare className="w-4 h-4" /> Mensagens
          {stats.unreadMessages > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">{stats.unreadMessages}</span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.filter((c) => c.count > 0).map((cat) => (
          <Link key={cat.id} href={`/marketplace/search?cat=${cat.id}`} className="card-surface p-4 text-center group hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-clay-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-clay-100 transition-colors">
              <cat.icon className="w-5 h-5 text-clay-500" />
            </div>
            <p className="text-caption font-medium text-text-primary">{cat.label}</p>
            <p className="text-[10px] text-text-muted">{cat.count} profissionais</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-heading text-h3 text-text-primary mb-4">{search ? `Resultados (${filteredProviders.length})` : "Destaques"}</h2>
        {filteredProviders.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhum profissional encontrado"
            description={`Tente ajustar sua busca por "${search}" ou explorar uma categoria diferente.`}
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {filteredProviders.map((pro) => (
              <Link key={pro.id} href={`/marketplace/provider/${pro.id}`} className="card-surface p-5 group hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500 font-heading font-bold">
                    {pro.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-heading font-semibold text-text-primary text-body-sm">{pro.name}</p>
                      {pro.verified && <Shield className="w-3.5 h-3.5 text-brand-500" />}
                    </div>
                    <p className="text-caption text-text-muted">{pro.specialties.map((s) => CATEGORY_LABELS[s]).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-clay-500 fill-current" />
                  <span className="text-body-sm font-bold text-text-primary">{pro.rating}</span>
                  <span className="text-caption text-text-muted">({pro.reviewCount} avaliações)</span>
                </div>
                <div className="flex items-center justify-between text-caption">
                  <span className="text-text-muted">{pro.services.length} serviço{pro.services.length !== 1 ? "s" : ""}</span>
                  <span className="text-text-muted">desde R$ {Math.min(...pro.services.map((s) => s.price))}</span>
                </div>
                <p className="text-caption text-text-muted mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.country} · {pro.languages.join(", ")}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
