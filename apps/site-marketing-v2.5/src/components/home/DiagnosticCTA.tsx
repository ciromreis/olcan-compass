"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function DiagnosticCTA() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden noise">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden p-12 md:p-24 shadow-2xl shadow-olcan-navy/20 border-2 border-white/20"
          style={{ 
            background: "linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)",
          }}
        >
          {/* OIOS Dynamic Glare */}
          <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full inline-flex items-center gap-3 mb-10">
              <Sparkles size={14} className="text-brand-400" />
              <span className="label-xs text-white/80">Rede Global Olcan Ativa</span>
            </div>

            <h2 className="font-display text-4xl md:text-7xl text-white leading-[1.1] mb-8 tracking-tight">
              Qual é o seu <br />
              <span className="italic font-light text-brand-400 font-serif">Potencial Internacional?</span>
            </h2>

            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              "Eu era uma professora do interior da Bahia sem nenhuma rede internacional. A metodologia da Olcan me mostrou exatamente o que minha candidatura precisava. Hoje tenho aceitações em Harvard e LSE."
              <br /><br />
              Descubra sua Rota de Navegação personalizada baseada em um dos 12 Perfis de Carreira mapeados pelo nosso sistema.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16 max-w-2xl px-4">
              {[
                "🗺️ Cartógrafo de Bolsas", 
                "⚙️ Ponte Técnica", 
                "🌏 Nômade Global", 
                "🏛️ Fugitivo Institucional",
                "🧬 Pesquisador Pioneiro",
                "📈 Diplomata Corporativo"
              ].map((a) => (
                <div
                  key={a}
                  className="fear-pill bg-white/5 border-white/10 text-white/60 py-2 px-4 hover:bg-white/10 hover:text-white transition-colors cursor-default"
                >
                  {a}
                </div>
              ))}
              <div className="fear-pill bg-white/5 border-white/10 text-brand-400/60 py-2 px-4 italic">
                +6 arquétipos...
              </div>
            </div>

            <Link href="/diagnostico" className="btn-primary py-6 px-12 text-lg shadow-2xl shadow-brand-500/30 group">
              Revelar meu Arquétipo Agora
              <ArrowRight size={20} className="ml-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
