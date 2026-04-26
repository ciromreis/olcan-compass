"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Globe,
  Search,
  ShoppingBag,
  Star,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useHydration } from "@/hooks/use-hydration";
import {
  CATEGORY_LABELS,
  type ServiceCategory,
  useMarketplaceStore as useProviderStore,
} from "@/stores/canonicalMarketplaceProviderStore";
import {
  useCommerceStore,
  useMarketplaceStore as useEconomyStore,
} from "@/stores/canonicalMarketplaceEconomyStore";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// New Components
import { EconomyHUD } from "@/components/marketplace/EconomyHUD";
import { AssetCard } from "@/components/marketplace/AssetCard";
import { FlagshipProductCard } from "@/components/marketplace/FlagshipProductCard";
import { AuraSynergyBlock } from "@/components/marketplace/AuraSynergyBlock";

type StoreTab = "products" | "services" | "providers" | "lab";

const TABS: { key: StoreTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "products", label: "Produtos", icon: ShoppingBag },
  { key: "services", label: "Serviços", icon: Calendar },
  { key: "providers", label: "Especialistas", icon: Users },
  { key: "lab", label: "Laboratório", icon: Zap },
];

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  digital: "Digital",
  service: "Serviço",
  physical: "Físico",
  hybrid: "Híbrido",
};

function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default function MarketplacePage() {
  const ready = useHydration();
  const [activeTab, setActiveTab] = useState<StoreTab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");

  // Provider store
  const { providers, syncFromApi, isSyncing } = useProviderStore();
  
  // Ecommerce store (Real-world products)
  const {
    products,
    featuredProducts,
    fetchProducts,
    fetchFeaturedProducts,
  } = useCommerceStore();

  // Economy store (Internal assets: Skills/Companions)
  const {
    assets,
    fetchAssets,
    fetchEconomy,
    fetchInventory,
    isLoading: isEconomyLoading,
  } = useEconomyStore();

  useEffect(() => {
    void syncFromApi();
    void fetchProducts();
    void fetchFeaturedProducts();
    void fetchAssets();
    void fetchEconomy();
    void fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Identification of Flagship Products
  const flagshipProducts = useMemo(() => {
    return products.filter(p => 
      p.tags?.includes("flagship") || 
      p.is_olcan_official || 
      ["Kit Application", "Curso Cidadão do Mundo"].some(name => p.name.includes(name))
    ).slice(0, 2);
  }, [products]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        provider.name.toLowerCase().includes(q) ||
        provider.bio.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === "all" || provider.specialties.includes(activeCategory);
      return matchSearch && matchCategory;
    });
  }, [providers, searchQuery, activeCategory]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.length > 0 ? products : featuredProducts;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, featuredProducts, searchQuery]);

  // Services extracted from providers
  const allServices = useMemo(() => {
    return providers.flatMap((p) =>
      p.services.map((s) => ({ ...s, providerName: p.name, providerRating: p.rating, providerCountry: p.country, providerId: p.id }))
    );
  }, [providers]);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allServices.filter((s) => {
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const matchCategory = activeCategory === "all" || s.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [allServices, searchQuery, activeCategory]);

  // Fallback to loading only if not ready. If syncing, rely on individual loaders or assume done if taking too long to prevent stuck UI
  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-1">
      {/* Compact Header */}
      <section className="rounded-2xl border border-silver-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="font-heading text-h3 text-brand-500">
              Loja Olcan
            </h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              Produtos, serviços e lab de auras para sua jornada internacional
            </p>
          </div>
          <EconomyHUD />
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar produtos, serviços ou especialistas..."
            aria-label="Buscar no marketplace"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-silver-200 bg-white py-2.5 pl-10 pr-4 text-body-sm text-text-primary shadow-xs outline-none placeholder:text-text-muted focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl border border-silver-200 bg-silver-50 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-body-sm font-medium transition-all",
                activeTab === key
                  ? "bg-white text-brand-500 shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-silver-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.22em] text-brand-500">
                Vitrine Oficial
              </p>
              <p className="mt-1 text-body-sm text-text-secondary">
                Produtos, serviços e parceiros servidos pelo contrato comercial da Olcan, com o motor de loja funcionando por trás da plataforma.
              </p>
            </div>
            <a
              href={API_ENDPOINTS.marketplace.base}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-body-sm font-semibold text-brand-500 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              Abrir vitrine completa
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Gamification Hub */}
      <AuraSynergyBlock />

      {/* Products Tab */}
      {activeTab === "products" && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Flagship Section */}
          {flagshipProducts.length > 0 && !searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-h4 text-brand-600 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-brand-500" />
                  Destaques Olcan
                </h2>
                <span className="text-caption font-bold text-text-muted uppercase tracking-widest">
                  Flagship Collection
                </span>
              </div>
              <div className="grid gap-6">
                {flagshipProducts.map((product) => (
                  <FlagshipProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Catalog */}
          <div className="space-y-4">
            <h2 className="font-heading text-body font-bold text-text-primary">
              {searchQuery ? "Resultados da Busca" : "Catálogo Completo"}
            </h2>
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center text-text-muted">
                <ShoppingBag className="mx-auto h-8 w-8" />
                <p className="mt-2 text-body-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/products/${product.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-silver-200 bg-white/90 shadow-xs backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-silver-50 to-silver-100">
                      {product.product_type === "digital" ? (
                        <Download className="h-10 w-10 text-brand-300" />
                      ) : (
                        <BookOpen className="h-10 w-10 text-brand-300" />
                      )}
                      
                      {/* Badges */}
                      <div className="absolute left-2 top-2 flex gap-1">
                        {product.is_olcan_official && (
                          <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Olcan</span>
                        )}
                        {product.is_new && (
                          <span className="rounded-md bg-silver-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Novo</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center gap-1.5 text-caption text-text-muted">
                        <Zap className="h-3 w-3" />
                        {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
                      </div>
                      <h3 className="mt-1 font-heading text-body-sm font-semibold text-text-primary line-clamp-2 transition-colors group-hover:text-brand-500">
                        {product.name}
                      </h3>
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-silver-100">
                        <span className="font-heading text-body font-bold text-brand-600">
                          {formatBRL(product.price)}
                        </span>
                        <div className="flex items-center gap-1 text-caption text-text-muted">
                          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                          {product.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                activeCategory === "all" ? "border-brand-400 bg-brand-500 text-white" : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
              )}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as ServiceCategory)}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                  activeCategory === key ? "border-brand-400 bg-brand-500 text-white" : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center text-text-muted">
              <Calendar className="mx-auto h-8 w-8" />
              <p className="mt-2 text-body-sm">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <Link
                  key={`${service.providerId}-${service.title}`}
                  href={`/marketplace/provider/${service.providerId}`}
                  className="group flex gap-4 rounded-2xl border border-silver-200 bg-white/90 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-body-sm font-semibold text-text-primary group-hover:text-brand-500 transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-0.5 text-caption text-text-muted line-clamp-1">
                      {service.providerName} · {service.duration} min
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-heading text-body font-semibold text-brand-500">
                        {formatBRL(service.price)}
                      </span>
                      <span className="rounded-md bg-silver-50 px-2 py-0.5 text-caption text-text-muted">
                        {CATEGORY_LABELS[service.category]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Providers Tab */}
      {activeTab === "providers" && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                activeCategory === "all" ? "border-brand-400 bg-brand-500 text-white" : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
              )}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as ServiceCategory)}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                  activeCategory === key ? "border-brand-400 bg-brand-500 text-white" : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredProviders.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center text-text-muted">
              <Users className="mx-auto h-8 w-8" />
              <p className="mt-2 text-body-sm">Nenhum especialista encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/marketplace/provider/${provider.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-silver-200 bg-white/90 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-2 w-full bg-brand-500" />
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-silver-100 text-brand-500 font-bold">
                        {provider.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading text-body-sm font-semibold truncate group-hover:text-brand-500 transition-colors">{provider.name}</h3>
                        <p className="text-caption text-text-muted flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {provider.country}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-caption text-text-secondary line-clamp-2 h-8">{provider.bio}</p>
                    <div className="mt-4 pt-3 border-t border-silver-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-caption font-bold text-text-primary">
                        <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                        {provider.rating.toFixed(1)}
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Lab Tab (Digital Assets) */}
      {activeTab === "lab" && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white p-5">
            <h2 className="font-heading text-h4 text-brand-600 flex items-center gap-2">
              <Zap className="h-5 w-5 fill-brand-500" />
              Laboratório de Auras
            </h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Desbloqueie novas habilidades e companheiros usando seus Aura Points e Créditos.
            </p>
          </div>

          {!isEconomyLoading && assets.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-12 text-center backdrop-blur-sm">
              <Sparkles className="mx-auto h-10 w-10 text-brand-300" />
              <p className="mt-4 font-heading text-body font-semibold text-text-primary">
                O Laboratório está sendo preparado...
              </p>
              <p className="mt-1 text-caption text-text-muted">
                Novas Skills e Companheiros estarão disponíveis em breve.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
