"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const products = [
  {
    price: "R$ 35",
    name: "Rota da Internacionalização",
    desc: "O mapa end-to-end para quem está começando agora. Checklists + atalhos.",
    href: "/produtos/rota",
    tier: 1,
    cta: "Começar aqui",
    badge: "Entrada",
  },
  {
    price: "R$ 75",
    name: "Kit Application",
    desc: "Templates prontos de essays, CV internacional e checklist de prazo.",
    href: "/produtos/kit",
    tier: 2,
    cta: "Ver o Kit",
    badge: "Popular",
  },
  {
    price: "R$ 497",
    name: "Curso Além das Fronteiras",
    desc: "A jornada completa: narrativa, inglês de influência, negociação e aplicação.",
    href: "/produtos/curso",
    tier: 3,
    cta: "Quero o curso",
    badge: "Mais Vendido",
    highlight: true,
  },
  {
    price: "SaaS",
    name: "Compass by Olcan",
    desc: "A plataforma de IA que personaliza toda sua jornada. Dashboard, Forge, Interviews.",
    href: "/produtos/compass",
    tier: 4,
    cta: "Acessar o Compass",
    badge: "Plataforma",
  },
  {
    price: "R$ 500/h",
    name: "Mentoria 1:1",
    desc: "Sessão individual de 60 min com mock interview, follow-up de 14 dias.",
    href: "/produtos/mentoria",
    tier: 5,
    cta: "Agendar sessão",
    badge: "Premium",
  },
];

export function ProductLadder() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      {/* Background Elements */}
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
            <span className="label-xs text-olcan-navy/60">Product Evolution Ladder</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Comece onde você está. <br />
            <span className="italic font-light text-brand-600 font-serif">Avance no seu ritmo.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Do primeiro passo ao ecossistema completo. Cada etapa é uma evolução natural 
            para sua consolidar sua presença global.
          </p>
        </motion.div>

        {/* Timeline Ladder */}
        <div className="relative max-w-4xl mx-auto px-4 md:px-0">
          {/* Vertical connector line - Redesigned as an OIOS axis */}
          <div className="absolute left-10 md:left-12 top-10 bottom-10 w-px bg-olcan-navy/10 hidden sm:block z-0" />

          <div className="flex flex-col gap-8 relative z-10">
            {products.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group w-full"
              >
                <div className={`card-olcan p-8 flex flex-col md:flex-row items-center gap-10 border-2 transition-all duration-500 hover:border-brand-300 ${
                  product.highlight
                    ? "bg-white border-brand-400 shadow-2xl shadow-brand-500/10 scale-[1.02]"
                    : "bg-white/40 border-white/60"
                }`}>
                  {/* Step indicator - OIOS Token Style */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl z-10 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${
                    product.highlight 
                      ? "bg-brand-600 text-white shadow-brand-500/20" 
                      : "bg-white border border-olcan-navy/5 text-olcan-navy shadow-olcan-navy/5"
                  }`}>
                    {product.tier}
                  </div>

                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                          <div className="fear-pill bg-white/40 border-white text-olcan-navy/40 py-1">
                            {product.badge}
                          </div>
                          <span className="text-xl font-display font-bold text-olcan-navy italic px-2">
                            {product.price}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl md:text-3xl text-olcan-navy tracking-tight italic">
                          {product.name}
                        </h3>
                        <p className="text-olcan-navy/60 leading-relaxed font-medium max-w-xl">
                          {product.desc}
                        </p>
                      </div>
                      
                      <Link
                        href={product.href}
                        className={`btn-${product.highlight ? 'primary' : 'secondary'} py-4 px-8 text-sm group/btn w-full md:w-auto`}
                      >
                        {product.cta}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
