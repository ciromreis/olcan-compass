"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { StorefrontProduct } from "@/lib/mercur-client";

/**
 * Tier order: products are displayed as an ascending value ladder.
 * The canonical JSON already has them sorted by price (Rota R$35 → Kit R$75 →
 * Sem Fronteiras R$497 → Mentorias → Compass), so we respect source order.
 */

interface ProductLadderProps {
  products: StorefrontProduct[];
}

const TIER_BADGES: Record<number, string> = {
  1: "Entrada",
  2: "Essencial",
  3: "Mais Vendido",
  4: "Premium",
  5: "Plataforma",
};

export function ProductLadder({ products }: ProductLadderProps) {
  // Use source order as the tier progression
  const ladder = products.slice(0, 5);

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-5 bg-olcan-navy pointer-events-none" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="label-xs text-olcan-navy/60">
              Product Evolution Ladder
            </span>
          </div>

          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Comece onde você está. <br />
            <span className="italic font-light text-brand-600 font-serif">
              Avance no seu ritmo.
            </span>
          </h2>

          <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Do primeiro passo ao ecossistema completo. Cada etapa é uma evolução
            natural para consolidar sua presença global.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-4 md:px-0">
          <div className="absolute left-10 md:left-12 top-10 bottom-10 w-px bg-olcan-navy/10 hidden sm:block z-0" />

          <div className="flex flex-col gap-8 relative z-10">
            {ladder.map((product, i) => {
              const tier = i + 1;
              const isHighlight = product.is_bestseller;
              const badge = TIER_BADGES[tier] || product.category;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group w-full"
                >
                  <div
                    className={`card-olcan p-8 flex flex-col md:flex-row items-center gap-10 border-2 transition-all duration-500 hover:border-brand-300 ${
                      isHighlight
                        ? "bg-white border-brand-400 shadow-2xl shadow-brand-500/10 scale-[1.02]"
                        : "bg-white/40 border-white/60"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl z-10 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${
                        isHighlight
                          ? "bg-brand-600 text-white shadow-brand-500/20"
                          : "bg-white border border-olcan-navy/5 text-olcan-navy shadow-olcan-navy/5"
                      }`}
                    >
                      {tier}
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <div className="fear-pill bg-white/40 border-white text-olcan-navy/40 py-1">
                              {badge}
                            </div>
                            <span className="text-xl font-display font-bold text-olcan-navy italic px-2">
                              {product.price_display}
                            </span>
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl text-olcan-navy tracking-tight italic">
                            {product.title}
                          </h3>
                          <p className="text-olcan-navy/60 leading-relaxed font-medium max-w-xl">
                            {product.short_description || product.description}
                          </p>
                        </div>

                        <Link
                          href={`/marketplace/${product.handle}`}
                          className={`btn-${isHighlight ? "primary" : "secondary"} py-4 px-8 text-sm group/btn w-full md:w-auto`}
                        >
                          {product.cta_label || "Ver detalhes"}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
