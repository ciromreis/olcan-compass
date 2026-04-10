import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { StorefrontProduct } from "@/lib/mercur-client";

interface ProductsSectionProps {
  products: StorefrontProduct[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const featured = products.filter((product) => product.is_featured).slice(0, 3);
  const supportProducts = products.filter((product) => !featured.includes(product));

  return (
    <section className="py-24 md:py-32 bg-cream-50 relative overflow-hidden noise">
      <div className="absolute inset-0 bg-hero-grain opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="text-center mb-20">
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="label-xs text-olcan-navy/60">Catálogo Olcan</span>
          </div>

          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Entradas reais para
            <br />
            <span className="italic font-light text-brand-600">
              a jornada internacional.
            </span>
          </h2>

          <p className="text-xl text-olcan-navy/80 max-w-3xl mx-auto leading-relaxed font-medium">
            O site agora apresenta o mesmo catálogo que alimenta o Compass e o motor
            comercial. Sem cards artificiais, sem linhas paralelas de produto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/marketplace/${product.handle}`}
              className="group card-olcan p-10 h-full flex flex-col border-2 border-white/60 hover:border-brand-300 transition-all duration-500"
            >
              <div className="inline-flex self-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              <div className="label-xs text-brand-600 mb-2 uppercase tracking-wide font-bold">
                {product.format || product.product_type}
              </div>
              <h3 className="font-display text-3xl text-olcan-navy mb-4 italic leading-tight">
                {product.title}
              </h3>
              <p className="text-olcan-navy/80 mb-8 leading-relaxed font-medium flex-1">
                {product.short_description || product.description}
              </p>

              <div className="space-y-4 mb-10 pt-6 border-t border-olcan-navy/5">
                {(product.features || []).slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-bold text-olcan-navy/60">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="btn-primary w-full py-5 group/btn">
                {product.cta_label || "Ver detalhes"}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {supportProducts.length > 0 && (
          <div className="pt-20 border-t border-olcan-navy/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label-xs text-olcan-navy/40 mb-3">Camadas complementares</div>
                <h3 className="font-display text-4xl text-olcan-navy italic">
                  Produtos e acessos conectados
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {supportProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.handle}`}
                  className="liquid-glass p-8 h-full border border-white/60 hover:border-brand-300 transition-all duration-500"
                >
                  <div className="label-xs text-brand-600 mb-1">
                    {product.category}
                  </div>
                  <h4 className="font-bold text-xl text-olcan-navy mb-4 tracking-tight">
                    {product.title}
                  </h4>
                  <p className="text-sm text-olcan-navy/70 mb-8 leading-relaxed font-medium">
                    {product.short_description || product.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-display text-lg text-brand-600">
                      {product.price_display}
                    </span>
                    <span className="inline-flex items-center gap-2 text-olcan-navy/60 font-semibold">
                      Ver página
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
