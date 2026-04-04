"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Download,
  Globe,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useHydration } from "@/hooks/use-hydration";
import {
  CATEGORY_LABELS,
  type ServiceCategory,
  useMarketplaceStore,
} from "@/stores/canonicalMarketplaceProviderStore";
import { useEcommerceStore } from "@/stores/ecommerceStore";

type StoreTab = "products" | "services" | "providers";

const TABS: { key: StoreTab; label: string; icon: typeof ShoppingBag }[] = [
  { key: "products", label: "Produtos", icon: ShoppingBag },
  { key: "services", label: "Serviços", icon: Calendar },
  { key: "providers", label: "Especialistas", icon: Users },
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
  const { providers, syncFromApi, isSyncing, getStats } = useMarketplaceStore();
  const stats = getStats();

  // Ecommerce store
  const {
    products,
    featuredProducts,
    fetchProducts,
    fetchFeaturedProducts,
    addToCart,
  } = useEcommerceStore();

  useEffect(() => {
    void syncFromApi();
    void fetchProducts();
    void fetchFeaturedProducts();
  }, [syncFromApi, fetchProducts, fetchFeaturedProducts]);

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
      p.services.map((s) => ({ ...s, providerName: p.name, providerRating: p.rating, providerCountry: p.country }))
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

  if (!ready || (isSyncing && providers.length === 0)) {
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
          <div>
            <h1 className="font-heading text-h3 text-brand-500">
              Loja Olcan
            </h1>
            <p className="mt-1 text-body-sm text-text-secondary">
              Produtos, serviços e especialistas para sua jornada internacional
            </p>
          </div>
          <div className="flex gap-2 text-caption text-text-muted">
            <span className="rounded-lg border border-silver-200 bg-white px-2.5 py-1">
              {stats.completedBookings} atendimentos
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar produtos, serviços ou especialistas..."
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
      </section>

      {/* Products Tab */}
      {activeTab === "products" && (
        <section className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 text-body-sm text-text-secondary">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/products/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-silver-200 bg-white/90 shadow-xs backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Product Image / Icon Area */}
                  <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-silver-50 to-silver-100">
                    {product.product_type === "digital" ? (
                      <Download className="h-10 w-10 text-brand-300" />
                    ) : product.product_type === "service" ? (
                      <Calendar className="h-10 w-10 text-brand-300" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-brand-300" />
                    )}

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex gap-1">
                      {product.is_olcan_official && (
                        <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          OLCAN
                        </span>
                      )}
                      {product.is_bestseller && (
                        <span className="rounded-md bg-brand-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          MAIS VENDIDO
                        </span>
                      )}
                      {product.is_new && (
                        <span className="rounded-md bg-silver-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          NOVO
                        </span>
                      )}
                    </div>

                    {/* Discount */}
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="absolute right-2 top-2 rounded-md bg-clay-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex items-center gap-1.5 text-caption text-text-muted">
                      <Zap className="h-3 w-3" />
                      {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
                    </div>

                    <h3 className="mt-1 font-heading text-body font-semibold text-text-primary line-clamp-2 group-hover:text-brand-400 transition-colors">
                      {product.name}
                    </h3>

                    {product.short_description && (
                      <p className="mt-1 text-caption text-text-muted line-clamp-2 flex-1">
                        {product.short_description}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-3 text-caption">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                        <span className="font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
                        <span className="text-text-muted">({product.review_count})</span>
                      </span>
                      <span className="text-text-muted">{product.sales_count} vendas</span>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-3 flex items-center justify-between border-t border-silver-100 pt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-h4 text-brand-500">
                          {formatBRL(product.price)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-caption text-text-muted line-through">
                            {formatBRL(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-brand-400"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <section className="space-y-4">
          {/* Category filter for services */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                activeCategory === "all"
                  ? "border-brand-400 bg-brand-500 text-white"
                  : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
              )}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key as ServiceCategory)}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                  activeCategory === key
                    ? "border-brand-400 bg-brand-500 text-white"
                    : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 text-body-sm text-text-secondary">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/marketplace/provider/${service.providerId}`}
                  className="group flex gap-4 rounded-2xl border border-silver-200 bg-white/90 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-body-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
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
        <section className="space-y-4">
          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                activeCategory === "all"
                  ? "border-brand-400 bg-brand-500 text-white"
                  : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
              )}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key as ServiceCategory)}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors",
                  activeCategory === key
                    ? "border-brand-400 bg-brand-500 text-white"
                    : "border-silver-200 bg-white text-text-secondary hover:bg-silver-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredProviders.length === 0 ? (
            <div className="rounded-2xl border border-silver-200 bg-white/80 p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 text-body-sm text-text-secondary">Nenhum especialista encontrado</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => {
                const primaryService = provider.services?.[0];
                return (
                  <Link
                    key={provider.id}
                    href={`/marketplace/provider/${provider.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-silver-200 bg-white/90 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Provider header */}
                    <div className="border-b border-silver-100 bg-brand-500 px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        {provider.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                            <Shield className="h-3 w-3" />
                            Verificado
                          </span>
                        )}
                        {primaryService && (
                          <span className="text-caption font-medium text-white/80">
                            a partir de {formatBRL(primaryService.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-silver-200 bg-silver-50 font-heading text-body font-semibold text-brand-500">
                          {provider.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading text-body-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors truncate">
                            {provider.name}
                          </h3>
                          <p className="text-caption text-text-muted">{provider.country}</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="mt-2.5 text-caption text-text-secondary line-clamp-2 flex-1">
                        {provider.bio}
                      </p>

                      {/* Specialties */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {provider.specialties.slice(0, 2).map((s) => (
                          <span key={s} className="rounded-md bg-silver-50 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                            {CATEGORY_LABELS[s]}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 flex items-center justify-between border-t border-silver-100 pt-2.5 text-caption text-text-muted">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                            <span className="font-semibold text-text-primary">{provider.rating.toFixed(1)}</span>
                            <span>({provider.reviewCount})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {provider.languages.join(", ")}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
