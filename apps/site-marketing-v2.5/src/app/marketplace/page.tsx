import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import EnhancedFooter from "@/components/layout/EnhancedFooter";
import { ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { getMercurProducts, getProductPrice } from "@/lib/mercur-client";
import { getHeroSection, getPublishedPageBySlug } from "@/lib/cms";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getAppUrl(path: string) {
  const base = APP_BASE_URL.endsWith("/") ? APP_BASE_URL.slice(0, -1) : APP_BASE_URL;
  return `${base}${path}`;
}

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "curso-cidadao-mundo": "/images/product-cidadao-mundo.png",
  "cidadao-do-mundo": "/images/product-cidadao-mundo.png",
  "kit-application": "/images/product-kit.png",
  "rota-internacionalizacao": "/images/product-rota.png",
  "rota-da-internacionalizacao": "/images/product-rota.png",
  "compass-by-olcan": "/images/hero-globe.png",
  "mentorias-olcan": "/images/ciro-mentoria-lse.jpg",
};

function getProductImage(handle: string, thumbnail?: string | null, images?: string[]): string | undefined {
  if (thumbnail) return thumbnail;
  if (images && images[0]) return images[0];
  return PRODUCT_IMAGE_MAP[handle] || undefined;
}

export const metadata: Metadata = {
  title: "Loja | Olcan",
  description:
    "Produtos, serviços e acessos do ecossistema Olcan para operar uma jornada internacional com mais clareza.",
};

function sectionTitleFor(productType: string) {
  if (productType === "service") {
    return "Orientação especializada";
  }

  if (productType === "hybrid") {
    return "Plataforma";
  }

  return "Produtos digitais";
}

export default async function MarketplacePage() {
  const [products, marketplacePage] = await Promise.all([
    getMercurProducts({ limit: 12 }),
    getPublishedPageBySlug("marketplace"),
  ]);
  const hero = getHeroSection(marketplacePage);
  const featuredProducts = products.filter((product) => product.is_featured);

  const grouped = products.reduce<Record<string, typeof products>>((acc, product) => {
    const key = sectionTitleFor(product.product_type);
    acc[key] = acc[key] || [];
    acc[key].push(product);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-cream selection:bg-brand-500/30">
      <EnhancedNavbar />

      <section className="pt-32 pb-16 border-b border-cream-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm mb-6">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/70">
                Loja Olcan
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.03] tracking-tight mb-6">
              {hero?.title || "Produtos e serviços"}
              <br />
              <span className="italic font-light text-brand-600">
                {hero?.accent || "conectados ao Compass."}
              </span>
            </h1>

            <p className="text-xl text-ink/70 leading-relaxed font-light max-w-3xl">
              {hero?.description ||
                marketplacePage?.summary ||
                "A loja da Olcan não é uma vitrine solta. Ela organiza os instrumentos, programas e acessos que alimentam a operação da sua jornada dentro do Compass, enquanto mantém páginas públicas para descoberta e validação."}
            </p>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white border-b border-cream-200">
          <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
            <div className="flex items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
                  Seleção principal
                </p>
                <h2 className="font-display text-4xl text-ink">
                  O núcleo comercial da Olcan
                </h2>
              </div>
              <p className="hidden lg:block max-w-xl text-sm text-ink/55 leading-relaxed">
                Cada item abaixo ocupa um papel diferente: entrada operacional,
                estrutura documental, formação guiada, orientação humana e acesso à
                própria plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.handle}`}
                  className="group rounded-[2rem] border border-cream-200 bg-cream-50/70 backdrop-blur-xl overflow-hidden hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-olcan-navy/5 via-cream-50 to-brand-50/30">
                    {(() => {
                      const imgSrc = getProductImage(product.handle, product.thumbnail, product.images);
                      return imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-olcan-navy/5 to-brand-600/10">
                          <Image src="/images/creature-compass.png" alt="" width={80} height={80} className="opacity-40" />
                        </div>
                      );
                    })()}
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 text-ink shadow-lg">
                        {product.category}
                      </span>
                      {product.is_bestseller && (
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-600 text-white shadow-lg">
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col h-[calc(100%-0px)]">
                    <div className="text-xs font-semibold uppercase tracking-widest text-ink/45 mb-3">
                      {product.format || product.product_type}
                    </div>
                    <h3 className="font-display text-2xl text-ink mb-3 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-sm text-ink/65 leading-relaxed mb-6 flex-1">
                      {product.short_description || product.description}
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-cream-200">
                      <span className="font-display text-xl text-brand-600">
                        {getProductPrice(product)}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-8 bg-cream-50 border-b border-cream-200">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-ink/60 leading-relaxed">
              <Lock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5 text-brand-600" />
              Compra pública, uso integrado — cada produto aqui se conecta à sua conta no Compass.
            </p>
            <Link
              href={getAppUrl("/login")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap"
            >
              Entrar no Compass
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {Object.entries(grouped).map(([sectionTitle, items]) => (
        <section key={sectionTitle} className="py-20 bg-white border-b border-cream-200">
          <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
                Catálogo vivo
              </p>
              <h2 className="font-display text-4xl text-ink">{sectionTitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.handle}`}
                  className="rounded-[1.75rem] border border-cream-200 bg-cream-50/50 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-ink/45 mb-2">
                        {product.category}
                      </div>
                      <h3 className="font-display text-xl text-ink leading-tight">
                        {product.title}
                      </h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-600 mt-1" />
                  </div>
                  <p className="text-sm text-ink/65 leading-relaxed mb-5">
                    {product.short_description || product.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-600 font-display">
                      {getProductPrice(product)}
                    </span>
                    <span className="text-ink/45">{product.format || product.language}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <EnhancedFooter />
    </main>
  );
}
