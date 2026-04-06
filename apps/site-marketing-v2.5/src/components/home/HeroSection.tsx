"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Zap } from "lucide-react";
import GlobeCanvas from "@/components/ui/GlobeCanvas";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 overflow-hidden bg-cream selection:bg-brand-100/30">
      {/* Subtle coordinate grid — evokes maps */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,19,56,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,19,56,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-brand-50/30 blur-[80px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[25%] h-[25%] bg-flame-50/20 blur-[60px] rounded-full z-0" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 animate-fade-up">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/5 border border-brand-500/10 text-brand-600 text-[10px] font-bold uppercase tracking-wide">
              <MapPin className="w-3 h-3" />
              <span>De onde você está — para onde quer chegar</span>
            </div>

            <div className="space-y-3 max-w-prose">
              <h1 className="text-display-2xl text-ink font-display">
                O mundo é seu.
              </h1>
              <p className="text-display-md text-brand-500 font-display italic">
                Você só precisa das ferramentas certas para atravessá-lo.
              </p>
            </div>

            <p className="text-lg lg:text-xl text-slate max-w-xl leading-relaxed font-sans font-normal">
              Olcan é uma plataforma de aprendizado e desenvolvimento profissional pensada para 
              quem não quer mais esperar a oportunidade bater na porta — e sabe que ela está 
              em algum lugar no mundo.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/diagnostico" className="btn-primary group">
                <span>Descobrir minha trilha</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/marketplace" className="btn-secondary">
                Ver produtos
              </Link>
            </div>

            {/* Stats — unique set, updated to avoid global section repetition */}
            <div className="pt-8 border-t border-brand-500/10 grid grid-cols-3 gap-6">
              {[
                { value: "1,2k+", label: "Acessos este mês" },
                { value: "24/7", label: "Mentor inteligente" },
                { value: "v2.5", label: "Olcan Engine" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-olcan-navy tracking-tight">{s.value}</div>
                  <div className="text-[10px] text-slate uppercase tracking-widest font-bold mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Globe + CTA card */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">

            {/* Interactive Globe — sized explicitly so ResizeObserver fires */}
            <div
              className="rounded-3xl overflow-hidden relative shadow-2xl shadow-olcan-navy/20"
              style={{
                background: 'radial-gradient(ellipse at 40% 40%, #0d2060 0%, #001338 55%, #000b20 100%)',
                width: '100%',
                aspectRatio: '1 / 1',
              }}
            >
              {/* Canvas fills the container */}
              <div className="absolute inset-0">
                <GlobeCanvas
                  dark={1}
                  baseColor={[1, 1, 1]}
                  glowColor={[0.2, 0.4, 0.9]}
                  markerColor={[235 / 255, 126 / 255, 81 / 255]}
                  mapBrightness={12}
                  diffuse={1.2}
                  speed={0.006}
                  theta={0.3}
                  mapSamples={18000}
                  className="w-full h-full"
                />
              </div>
              {/* Single minimal badge */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 whitespace-nowrap z-10">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Plataforma Global · Ao vivo</span>
              </div>
            </div>

            {/* CTA Micro Card — replaces the redundant numbers card */}
            <div className="rounded-3xl border border-brand-200 bg-brand-50/60 backdrop-blur-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-0.5">Diagnóstico gratuito</div>
                <div className="text-[11px] text-brand-600/70">Descubra seu perfil internacional em 10 min</div>
              </div>
              <Link href="/diagnostico" className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-brand-500 hover:text-brand-700 transition-colors" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
