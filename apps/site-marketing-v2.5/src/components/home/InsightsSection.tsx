"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Monitor, ShieldCheck, Zap, LineChart } from 'lucide-react';

const fearClusters = [
  { title: "Falta de Diferenciação", desc: "Sentir que seu currículo é apenas mais um no exterior, sem se destacar dos locais.", icon: "🌫️" },
  { title: "Síndrome do Impostor", desc: "Duvidar se a sua experiência atende de fato aos exigentes padrões internacionais.", icon: "👤" },
  { title: "Medo da Burocracia", desc: "Ficar paralisado diante da quantidade de documentos e complexidade dos vistos.", icon: "🏛️" },
  { title: "Estagnação", desc: "Saber do seu potencial global, mas não conseguir dar o primeiro passo prático.", icon: "🛑" }
];

export default function InsightsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-cream overflow-hidden noise">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-olcan-navy/10 to-transparent" />
      
      <div className="container-site z-10 relative mx-auto px-6 lg:px-12 w-full max-w-7xl">
        
        {/* Fear Clusters / Pain Points */}
        <div className="mb-32">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="label-xs text-olcan-navy/60">Análise de Pontos Cego</span>
            </div>
            
            <h2 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[1.1] mb-8 tracking-tight">
              O que trava a sua <br />
              <span className="italic font-light text-brand-600 font-serif">Jornada Global?</span>
            </h2>
            
            <p className="text-xl text-olcan-navy/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Na Metodologia Olcan, mapear suas dificuldades é o primeiro passo para 
              construir sua carreira no exterior com autoridade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {fearClusters.map((cluster, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-olcan p-10 flex flex-col items-center text-center group border-white/60 hover:border-brand-300 transition-all duration-500"
              >
                <div className="text-5xl mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{cluster.icon}</div>
                <h3 className="font-display text-xl text-olcan-navy mb-4 italic tracking-tight">{cluster.title}</h3>
                <p className="text-sm text-olcan-navy/70 leading-relaxed font-medium">{cluster.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Product Spotlight: Compass Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-white/40 backdrop-blur-3xl border-2 border-white/60 overflow-hidden p-8 md:p-16 lg:p-24 shadow-2xl shadow-olcan-navy/5"
        >
          {/* Subtle noise and glow */}
          <div className="absolute inset-0 bg-hero-grain opacity-20 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
          
          <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-10">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <Monitor className="w-4 h-4 text-brand-600" />
                <span className="label-xs text-brand-700">Olcan Compass — Sua Plataforma</span>
              </div>
              
              <h2 className="font-display text-5xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
                O painel que guia cada etapa da sua <span className="italic font-light text-brand-600 font-serif">jornada internacional.</span>
              </h2>
              
              <ul className="space-y-6">
                {[
                  "Diagnóstico personalizado do seu perfil internacional.",
                  "Simulação de entrevistas com feedback em tempo real.",
                  "Mapa de prontidão: onde você está e o que falta para embarcar.",
                  "Conexão com especialistas verificados em visto e carreira."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center mt-1 group-hover:bg-brand-500 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-olcan-navy/80 leading-relaxed font-medium text-lg">{item}</p>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <a href="https://compass.olcan.com.br" target="_blank" rel="noopener noreferrer" className="btn-primary py-5 px-10 text-base shadow-xl shadow-brand-500/20 group">
                  Acessar a Plataforma
                  <Zap className="w-5 h-5 ml-3 group-hover:fill-current transition-colors" />
                </a>
              </div>
            </div>

            {/* Dashboard Mockup - Visualização da Plataforma Compass */}
            <div className="relative perspective-1000 hidden lg:block">
              <motion.div 
                initial={{ opacity: 0, rotateY: 20, x: 40 }}
                whileInView={{ opacity: 1, rotateY: -10, x: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 card-olcan border-white/80 bg-white/60 p-0 overflow-hidden shadow-2xl"
              >
                {/* Simulated UI Topbar */}
                <div className="px-6 py-4 border-b border-white/60 flex items-center justify-between bg-white/40">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="label-xs text-olcan-navy/40">compass.olcan.io</div>
                  <div className="w-10" />
                </div>
                
                {/* Simulated Content */}
                <div className="p-8 grid grid-cols-3 gap-8 h-full bg-cream/10">
                  <div className="col-span-2 space-y-6">
                    <div className="h-6 w-1/2 bg-olcan-navy/10 rounded-full" />
                    <div className="h-56 w-full liquid-glass border-white/60 p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-olcan-navy/5 rounded-full" />
                        <div className="h-2 w-4/5 bg-olcan-navy/5 rounded-full" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-16 h-16 rounded-xl bg-brand-500/20" />
                        <div className="w-32 h-8 rounded-full bg-brand-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-28 w-full liquid-glass border-white/60 rounded-2xl" />
                      <div className="h-28 w-full liquid-glass border-white/60 rounded-2xl" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-full w-full card-olcan border-white/80 bg-white/40 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 border border-white/60 rotate-3">
                        <Monitor className="text-brand-600 w-10 h-10" />
                      </div>
                      <div className="h-3 w-28 bg-olcan-navy/10 rounded-full mb-4" />
                      <div className="h-2.5 w-20 bg-olcan-navy/5 rounded-full mb-10" />
                      
                      <div className="w-full bg-olcan-navy/5 h-2 rounded-full overflow-hidden">
                        <div className="w-[75%] bg-brand-600 h-full rounded-full" />
                      </div>
                      <div className="mt-4 label-xs text-brand-600">Trilha 75% concluída</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements - Indicadores de Progresso */}
              <motion.div 
                animate={{ y: [0, -15, 0], rotateZ: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] left-[-15%] z-20"
              >
                <div className="liquid-glass-strong px-6 py-4 flex items-center gap-4 border-white/80 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-olcan-navy flex items-center justify-center shadow-lg">
                    <ShieldCheck className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="label-xs text-brand-600 mb-0.5">Acompanhamento</p>
                    <p className="text-olcan-navy font-display font-bold text-lg italic">Sua evolução</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0], rotateZ: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[10%] right-[-10%] z-20"
              >
                <div className="liquid-glass-strong px-6 py-4 flex items-center gap-4 border-white/80 shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shadow-lg">
                    <LineChart className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="label-xs text-brand-600 mb-0.5">Próximos passos</p>
                    <p className="text-olcan-navy font-display font-bold text-lg italic">Planejamento claro</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
