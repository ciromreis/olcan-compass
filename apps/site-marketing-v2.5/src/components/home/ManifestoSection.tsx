"use client";

import React from "react";
import { motion } from "framer-motion";
import GlobeCanvas from "@/components/ui/GlobeCanvas";

export default function ManifestoSection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)" }}>
      {/* Subtle texture */}
      <div className="absolute inset-0 bg-hero-grain opacity-15 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Background Globe — large, ethereal, slow rotation */}
      <div className="absolute right-[-18%] top-1/2 -translate-y-1/2 w-[680px] h-[680px] opacity-[0.18] pointer-events-none z-0 select-none">
        <GlobeCanvas
          dark={1}
          baseColor={[0.95, 0.97, 1.0]}
          glowColor={[0.4, 0.52, 0.85]}
          markerColor={[235 / 255, 126 / 255, 81 / 255]}
          mapBrightness={3}
          diffuse={0.8}
          speed={0.0025}
          theta={0.2}
        />
      </div>

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-5xl">
        
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            <span className="label-xs text-white/50">Nossa Filosofia</span>
          </div>
        </motion.div>

        {/* Main editorial text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center space-y-10"
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
            No mundo pós-pandemia,<br />
            <span className="italic font-light text-[#E5E7EB]">o Brasil busca uma saída.</span>
          </h2>

          {/* Featured quote */}
          <blockquote className="relative max-w-4xl mx-auto">
            <div className="absolute -top-8 -left-4 text-8xl text-white/10 font-display leading-none select-none">&ldquo;</div>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium italic relative z-10 px-8">
              Olcan não vende cursos. Olcan abre portais. Cada peça de conteúdo, 
              cada ferramenta, cada sessão de mentoria é um convite à metamorfose.
            </p>
            <div className="absolute -bottom-8 -right-4 text-8xl text-white/10 font-display leading-none select-none rotate-180">&ldquo;</div>
          </blockquote>

          {/* Supporting text */}
          <div className="max-w-3xl mx-auto space-y-6 text-white/60 text-lg leading-relaxed font-medium">
            <p>
              Não é uma promessa de vida fácil no exterior. É o reconhecimento claro 
              de que talentos brasileiros merecem o mesmo acesso às melhores 
              oportunidades do mundo — e que a falta de conhecimento sobre como 
              atravessar fronteiras não deveria ser o único obstáculo.
            </p>
            <p>
              Do currículo ao visto, do primeiro emprego ao plano de longo prazo. 
              Essa é a Olcan.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-6 pt-6">
            <div className="w-16 h-px bg-white/20" />
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Fundada em 2019 · São Paulo, Brasil</span>
            <div className="w-16 h-px bg-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
