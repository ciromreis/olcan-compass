import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, ShoppingBag } from "lucide-react";
import type { StorefrontProduct } from "@/lib/mercur-client";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getAppUrl(path: string) {
  const base = APP_BASE_URL.endsWith("/") ? APP_BASE_URL.slice(0, -1) : APP_BASE_URL;
  return `${base}${path}`;
}

interface MarketplaceSectionProps {
  products: StorefrontProduct[];
}

export default function MarketplaceSection({
  products,
}: MarketplaceSectionProps) {
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ).slice(0, 4);

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      <div className="absolute inset-0 bg-hero-grain opacity-60 mix-blend-multiply pointer-events-none" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="text-center mb-20">
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <ShoppingBag className="w-4 h-4 text-olcan-navy" />
            <span className="label-xs text-olcan-navy/60">Commerce integrado</span>
          </div>

          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Descoberta pública.
            <br />
            <span className="italic font-light text-brand-600 font-serif">
              Operação dentro do Compass.
            </span>
          </h2>

          <p className="text-xl text-olcan-navy/70 max-w-3xl mx-auto leading-relaxed font-medium">
            A loja serve como camada comercial visível da Olcan, enquanto o uso
            recorrente dos produtos acontece com contexto, histórico e login dentro
            da plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 mb-20">
          <div className="card-olcan p-10 border-2 border-white/60">
            <div className="space-y-5">
              {[
                "Landing pages públicas para busca, campanhas e validação de oferta",
                "Catálogo compartilhado entre website, plataforma Compass e bridge comercial do backend",
                "Fluxo preparado para unificar identidade da conta Olcan e contexto de compra",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-olcan-navy/75 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass p-10 border border-white/60">
            <p className="label-xs text-brand-600 mb-4">Categorias ativas</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-4 py-2 rounded-full border border-white/70 bg-white/50 text-sm text-olcan-navy/70"
                >
                  {category}
                </span>
              ))}
            </div>

            <div className="space-y-4 text-sm text-olcan-navy/70 leading-relaxed">
              <p>
                Isso elimina a necessidade de manter um site “cenográfico” em paralelo
                com a lógica real de produto.
              </p>
              <p>
                Quando o usuário entra no Compass, o objetivo é que a camada comercial
                continue a mesma, só que com acesso autenticado, histórico e contexto.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://marketplace.olcan.com.br"} className="btn-primary" target="_blank" rel="noopener noreferrer">
                Explorar a loja
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={getAppUrl("/login")} className="btn-secondary">
                Entrar no Compass
                <Lock className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
