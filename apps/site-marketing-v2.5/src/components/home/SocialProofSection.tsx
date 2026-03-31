"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Carolina M.",
    origin: "Nova Soure, Bahia",
    destination: "Harvard + LSE",
    quote:
      "Eu era uma professora do interior da Bahia sem nenhuma rede internacional. A metodologia da Olcan me mostrou exatamente o que minha candidatura precisava. Hoje tenho aceitações em Harvard e LSE.",
    archetype: "Cartógrafa de Bolsas",
    emoji: "🗺️",
    stars: 5,
  },
  {
    name: "Carlos R.",
    origin: "São Paulo, SP",
    destination: "Berlin (Blaukarte)",
    quote:
      "Fiz 3 aplicações sem resultado antes da Olcan. Com o Compass, entendi o gap real e em 6 meses tinha minha Blaukarte aprovada e um contrato em Berlin.",
    archetype: "Ponte Técnica",
    emoji: "⚙️",
    stars: 5,
  },
  {
    name: "Mariana T.",
    origin: "Fortaleza, CE",
    destination: "Amsterdam (Nômade Digital)",
    quote:
      "A Mentoria 1:1 valeu cada centavo. Em 60 minutos, ficou claro exatamente como posicionar meu perfil para clientes internacionais. Tripleiquei meu faturamento em 4 meses.",
    archetype: "Nômade Global",
    emoji: "🌏",
    stars: 5,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise border-t border-olcan-navy/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 bg-brand-200 pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
            <Star className="w-4 h-4 text-brand-600 fill-brand-600" />
            <span className="label-xs text-olcan-navy/60">Success Evidence Protocol</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Brasileiros que <br />
            <span className="italic font-light text-brand-600 font-serif">Cruzaram a Fronteira.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Sem rede de contatos privilegiada. Sem orientador famoso. 
            Apenas aplicação rigorosa do Sistema Olcan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-olcan p-10 flex flex-col border-white/60 hover:border-brand-300 transition-all duration-500"
            >
              {/* Stars - Branded Style */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="fill-brand-600 text-brand-600" />
                ))}
              </div>

              {/* Quote - Premium Typography */}
              <p className="font-display text-xl text-olcan-navy leading-relaxed italic flex-1 mb-10 tracking-tight">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Profile - OIOS Details */}
              <div className="pt-8 border-t border-olcan-navy/5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-3xl shadow-xl shadow-olcan-navy/5 border border-white">
                  {t.emoji}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col">
                    <p className="font-display font-bold text-olcan-navy text-lg italic">{t.name}</p>
                    <p className="label-xs text-olcan-navy/40">{t.origin} → {t.destination}</p>
                  </div>
                  <div className="fear-pill bg-brand-500/5 border-brand-500/10 text-brand-700 py-1 px-3">
                    {t.archetype}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
