"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import createGlobe from 'cobe';
import { Compass, Zap, Map, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 0.98, 0.96], // Cream base
      markerColor: [235 / 255, 126 / 255, 81 / 255], // Flame markers
      glowColor: [1, 0.98, 0.96],
      markers: [
        // US (NY/SV)
        { location: [37.7749, -122.4194], size: 0.08 },
        { location: [40.7128, -74.0060], size: 0.06 },
        // Europe (London/Berlin)
        { location: [51.5074, -0.1278], size: 0.07 },
        { location: [52.5200, 13.4050], size: 0.05 },
        // Brazil (SP)
        { location: [-23.5505, -46.6333], size: 0.1 },
      ],
      // @ts-expect-error onRender exists in cobe runtime
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
        state.width = width * 2;
        state.height = width * 2;
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="relative py-32 bg-cream-50 text-olcan-navy overflow-hidden noise border-y border-olcan-navy/5">
      {/* Fractal Post-Modern Texture */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
      
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Interactive 3D Globe with Premium Framing */}
          <div className="relative w-full aspect-square max-w-[600px] mx-auto lg:mx-0 flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-olcan-navy/5 rounded-full blur-[100px] animate-pulse" />
            
            {/* Globe Wrapper */}
            <div className="w-full h-full opacity-90 scale-110 translate-x-[-5%] mix-blend-multiply relative z-10">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', contain: 'layout paint size', opacity: 1, transition: 'opacity 1s ease' }}
              />
            </div>

            {/* Floating Status Label */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="liquid-glass absolute bottom-10 right-10 px-6 py-3 shadow-2xl shadow-olcan-navy/10 border-white/60"
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
