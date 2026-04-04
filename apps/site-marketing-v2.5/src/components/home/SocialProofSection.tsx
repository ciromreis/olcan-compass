"use client";

import { motion } from "framer-motion";
import { Globe, Users, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Sem depoimentos fabricados — métricas reais de impacto
const metrics = [
  {
    icon: Users,
    value: "500+",
    label: "Profissionais Impactados",
    description: "Brasileiros que já iniciaram ou completaram sua transição internacional com a Olcan.",
  },
  {
    icon: Globe,
    value: "30+",
    label: "Países Alcançados",
    description: "De Portugal a Canadá, Alemanha a Austrália — nossa rede cobre os principais destinos.",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Taxa de Sucesso",
    description: "Dos nossos clientes recebem propostas internacionais em até 12 meses de trabalho conjunto.",
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
            <span className="label-xs text-olcan-navy/60">Resultados Olcan</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
            Brasileiros que <br />
            <span className="italic font-light text-brand-600 font-serif">Cruzaram a Fronteira.</span>
          </h2>
          
          <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Sem rede de contatos privilegiada. Sem orientador famoso. 
            Apenas método rigoroso e acompanhamento próximo.
          </p>
        </motion.div>

        {/* Destination city photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mb-16"
        >
          {[
            { src: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=700&q=80", city: "Lisboa" },
            { src: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=700&q=80", city: "Canadá" },
            { src: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=700&q=80", city: "Berlim" },
          ].map((photo, i) => (
            <motion.div
              key={photo.city}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden aspect-[4/3] relative group shadow-lg shadow-olcan-navy/10"
            >
              <Image
                src={photo.src}
                alt={photo.city}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/60 via-olcan-navy/10 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white text-xs font-bold uppercase tracking-widest drop-shadow">
                {photo.city}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-olcan p-10 flex flex-col border-white/60 hover:border-brand-300 transition-all duration-500 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6 border border-brand-500/10">
                <m.icon className="w-6 h-6 text-brand-600" />
              </div>
              <div className="font-display text-5xl text-olcan-navy font-bold mb-2 tracking-tighter">{m.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-4">{m.label}</div>
              <p className="text-sm text-olcan-navy/60 leading-relaxed font-medium">{m.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials CTA — área para depoimentos futuros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="card-olcan p-10 border-white/60 max-w-2xl mx-auto">
            <div className="text-3xl mb-4">🌍</div>
            <p className="font-display text-2xl text-olcan-navy italic mb-4">
              &ldquo;A sua história pode ser a próxima.&rdquo;
            </p>
            <p className="text-olcan-navy/60 font-medium mb-8 text-sm leading-relaxed">
              Junte-se a centenas de profissionais brasileiros que já deram o primeiro passo 
              em direção ao mercado global.
            </p>
            <Link href="/diagnostico" className="btn-primary">
              Começar minha jornada
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
