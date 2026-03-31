"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Search, Shield, Sparkles, Star } from "lucide-react";
import { EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useHydration } from "@/hooks/use-hydration";
import {
  CATEGORY_LABELS,
  type ServiceCategory,
  useMarketplaceStore,
} from "@/stores/canonicalMarketplaceProviderStore";

const PERFIS = ["Ponte Tecnica", "Cartografo de Bolsas", "Virada de Carreira", "Mobilidade Executiva"];

export default function MarketplacePage() {
  const ready = useHydration();
  const { providers, syncFromApi, isSyncing, getStats } = useMarketplaceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const stats = getStats();

  useEffect(() => {
    void syncFromApi();
  }, [syncFromApi]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const normalizedSearch = searchQuery.toLowerCase();
      const matchSearch =
        provider.name.toLowerCase().includes(normalizedSearch) ||
        provider.bio.toLowerCase().includes(normalizedSearch);
      const matchCategory = activeCategory === "all" || provider.specialties.includes(activeCategory);
      return matchSearch && matchCategory;
    });
  }, [providers, searchQuery, activeCategory]);

  if (!ready || (isSyncing && providers.length === 0)) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-32 w-full rounded-[28px]" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-72 rounded-[28px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.84),rgba(228,234,242,0.7))] p-8 shadow-[0_24px_80px_rgba(0,19,56,0.08)] backdrop-blur-2xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(95,111,140,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(0,19,56,0.1),transparent_30%)]" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5f6f8c]">
            <Sparkles className="h-4 w-4 text-[#001338]" />
            Rede de especialistas
          </div>
          <h1 className="mt-4 font-heading text-4xl text-[#001338] sm:text-5xl">
            Mentores e especialistas para destravar pontos críticos da sua rota
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#4a507a]">
            Apoio humano especializado para revisar documentos, destravar candidaturas e acelerar decisões estratégicas na sua jornada internacional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 font-medium text-[#31405f]">
              {stats.completedBookings} atendimentos registrados
            </div>
            <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 font-medium text-[#31405f]">
              Curadoria e verificacao ativa
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8598]" />
          <input
            type="text"
            placeholder="Buscar por especialidade, pais ou tipo de apoio..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-white/70 bg-white/68 py-3 pl-11 pr-4 text-sm text-[#001338] shadow-[0_10px_30px_rgba(0,19,56,0.04)] outline-none backdrop-blur-xl placeholder:text-[#8f99aa] focus:border-[#8392a9]"
          />
        </div>

        <div className="flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors",
              activeCategory === "all"
                ? "border-[#93a1b6] bg-[#001338] text-white"
                : "border-white/70 bg-white/70 text-[#4a507a] hover:bg-white"
            )}
          >
            Todas as frentes
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key as ServiceCategory)}
              className={cn(
                "whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                activeCategory === key
                  ? "border-[#93a1b6] bg-[#001338] text-white"
                  : "border-white/70 bg-white/70 text-[#4a507a] hover:bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {filteredProviders.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum especialista encontrado"
          description="Ajuste os filtros ou refine a busca para localizar o apoio mais adequado ao seu momento."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="rounded-2xl bg-[#001338] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16284d]"
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider, index) => {
            const primaryService = provider.services?.[0];
            const perfil = PERFIS[index % PERFIS.length];

            return (
              <Link
                key={provider.id}
                href={`/marketplace/provider/${provider.id}`}
                className="group flex flex-col overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(232,236,243,0.72))] shadow-[0_18px_54px_rgba(0,19,56,0.08)] backdrop-blur-2xl transition-all hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,19,56,0.12)]"
              >
                <div className="border-b border-white/70 bg-[linear-gradient(135deg,rgba(0,19,56,0.92),rgba(96,113,142,0.85))] px-5 py-4 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/88">
                      <Sparkles className="h-3.5 w-3.5" />
                      {perfil}
                    </span>
                    {provider.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                        <Shield className="h-3.5 w-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(145deg,#edf1f6,#cad3df)] text-[#001338] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                        {provider.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={provider.avatar} alt={provider.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-heading text-2xl">{provider.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl text-[#001338] transition-colors group-hover:text-[#243659]">
                          {provider.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#68738c]">{provider.country}</p>
                      </div>
                    </div>

                    {primaryService && (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f8899]">A partir de</p>
                        <p className="mt-1 font-heading text-xl text-[#001338]">R$ {primaryService.price.toLocaleString("pt-BR")}</p>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 flex-1 text-sm leading-6 text-[#55617f]">{provider.bio}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {provider.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[11px] font-medium text-[#46516c]"
                      >
                        {CATEGORY_LABELS[specialty]}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/60 pt-4 text-sm text-[#5c6781]">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-[#8b96aa] text-[#8b96aa]" />
                        <span className="font-semibold text-[#001338]">{provider.rating.toFixed(1)}</span>
                        <span>({provider.reviewCount})</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-[#8b96aa]" />
                        {provider.languages.join(", ")}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#7f8ba1] transition-transform group-hover:translate-x-1 group-hover:text-[#001338]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
