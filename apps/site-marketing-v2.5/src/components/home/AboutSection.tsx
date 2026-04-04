"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Zap, Map, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GlobeCanvas from '@/components/ui/GlobeCanvas';

const pillars = [
  {
    title: "Mapeamento de Perfil Profissional",
    desc: "Descubra qual a melhor rota e oportunidades exclusivas para o seu perfil e ambições internacionais.",
    icon: Compass,
    color: "flame"
  },
  {
    title: "Prontidão Internacional",
    desc: "Avaliamos suas reais chances de sucesso e construímos a fundação necessária para processos de visto e aplicações competitivas no exterior.",
    icon: Zap,
    color: "amber"
  },
  {
    title: "Transição e Imigração Segura",
    desc: "Estratégias imigratórias eficientes visando minimizar os riscos e burocracias das fronteiras, focando na sua aprovação rápida.",
    icon: Map,
    color: "mineral"
  },
  {
    title: "Marketing Pessoal Global",
    desc: "Tradução, adaptação e aprimoramento do seu currículo e materiais para o elevado padrão norte-americano e europeu.",
    icon: Shield,
    color: "ink"
  }
];

export default function AboutSection() {

  return (
    <section className="relative py-32 bg-cream-50 text-olcan-navy overflow-hidden noise border-y border-olcan-navy/5">
      {/* Fractal Post-Modern Texture */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Interactive 3D Globe with Premium Framing */}
          <div className="relative w-full aspect-square max-w-[560px] mx-auto lg:mx-0 flex items-center justify-center">
            {/* Outer ambient glow */}
            <div className="absolute inset-[5%] rounded-full bg-brand-600/10 blur-[80px]" />

            {/* Dark sphere backdrop — makes land masses pop */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 42% 45%, #0a1535 0%, #001338 60%, #000b22 100%)',
                boxShadow: '0 0 80px 20px rgba(0,19,56,0.15), inset 0 0 60px rgba(255,255,255,0.03)',
              }}
            />

            {/* Globe canvas */}
            <div className="absolute inset-0 z-10">
              <GlobeCanvas
                dark={1}
                baseColor={[1, 1, 1]}
                glowColor={[0.18, 0.35, 0.75]}
                markerColor={[235 / 255, 126 / 255, 81 / 255]}
                mapBrightness={9}
                diffuse={1.5}
                speed={0.004}
                theta={0.25}
              />
            </div>

            {/* Floating Status Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="liquid-glass absolute bottom-10 right-10 px-6 py-3 shadow-2xl shadow-olcan-navy/10 border-white/60 z-20"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="label-xs text-olcan-navy/60">Rede Global Olcan Ativa</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Narrative Content */}
          <div className="lg:col-span-1 space-y-12">
            <div className="space-y-8">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <Compass className="w-4 h-4 text-olcan-navy" />
                <span className="label-xs text-olcan-navy/60">Nossa Engenharia</span>
              </div>
              
              <h2 className="font-display text-5xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
                Metodologia aplicada à <br/>
                <span className="italic font-light text-brand-600 font-serif">sua aprovação global.</span>
              </h2>
              
              <p className="text-xl text-olcan-navy/70 leading-relaxed font-medium">
                A Olcan é a bússola para sua jornada internacional. Entregamos muito além da burocracia documental: construímos o caminho estratégico para que você conquiste vistos fortes, consiga propostas no exterior e inicie seu novo <span className="text-brand-600 font-bold">Estilo de Vida Global</span> de forma segura e acelerada.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {pillars.map((pillar, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="card-olcan p-8 h-full border border-white/60 hover:border-brand-300 transition-all duration-500">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/40 border border-white/60 group-hover:scale-110 transition-transform shadow-xl shadow-olcan-navy/5">
                      <pillar.icon className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="label-xs text-olcan-navy/40 mb-2 uppercase tracking-widest">Estratégia 0{idx + 1}</div>
                    <h3 className="font-display text-xl font-bold mb-3 text-olcan-navy italic tracking-tight italic">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-olcan-navy/60 leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <Link href="/diagnostico" className="btn-primary py-5 px-10 text-lg group w-full sm:w-auto">
                Iniciar Diagnóstico Estratégico
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
