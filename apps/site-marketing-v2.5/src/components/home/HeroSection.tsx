"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Zap, TrendingUp } from "lucide-react";
import GlobeCanvas from "@/components/ui/GlobeCanvas";

const stats = [
  { value: "500+", label: "Profissionais impactados" },
  { value: "30+", label: "Países alcançados" },
  { value: "85%", label: "Recebem ofertas em até 12 meses" },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 overflow-hidden bg-cream selection:bg-brand-100/30">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-hero-grain opacity-[0.03] pointer-events-none" />
      {/* Subtle coordinate grid — evokes maps and navigation */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,19,56,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,19,56,0.04) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-50/40 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-flame-50/30 blur-[100px] rounded-full z-0" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 animate-fade-up">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand-600 text-[10px] font-bold uppercase tracking-wide">
              <MapPin className="w-3 h-3" />
              <span>De onde você está — para onde quer chegar</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-display-2xl lg:text-[clamp(5rem,9vw,10.5rem)] text-ink font-display leading-[0.88] tracking-tight">
                O mundo é seu.
              </h1>
              <p className="text-display-lg text-brand-500 font-display italic leading-[1.05] tracking-tight max-w-lg">
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

            {/* Stats */}
            <div className="pt-8 border-t border-brand/10 flex flex-wrap gap-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-olcan-navy tracking-tight">{s.value}</div>
                  <div className="text-xs text-slate uppercase tracking-widest font-bold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: cards */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">

            {/* Interactive Globe — no header, pure visual */}
            <div
              className="rounded-3xl overflow-hidden relative shadow-2xl shadow-olcan-navy/20 aspect-square"
              style={{ background: 'radial-gradient(ellipse at 40% 40%, #0d2060 0%, #001338 55%, #000b20 100%)' }}
            >
              <GlobeCanvas
                dark={1}
                baseColor={[1, 1, 1]}
                glowColor={[0.18, 0.35, 0.75]}
                markerColor={[235 / 255, 126 / 255, 81 / 255]}
                mapBrightness={9}
                diffuse={1.5}
                speed={0.004}
                theta={0.28}
              />
              {/* Single contextual badge — bottom center */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">500+ profissionais · 30+ países</span>
              </div>
            </div>

            {/* Impact metrics card — substituindo depoimento fabricado */}
            <div className="rounded-3xl border border-olcan-navy/8 bg-white/60 backdrop-blur-xl p-6 shadow-xl shadow-olcan-navy/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-olcan-navy/50">Olcan em números</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "500+", label: "Profissionais" },
                  { value: "30+", label: "Países" },
                  { value: "R$ 0", label: "Burocracia inicial" },
                  { value: "85%", label: "Taxa de sucesso" },
                ].map((m) => (
                  <div key={m.label} className="bg-cream/70 rounded-2xl p-3 text-center">
                    <div className="text-lg font-bold text-olcan-navy">{m.value}</div>
                    <div className="text-[10px] text-olcan-navy/50 font-bold uppercase tracking-wide mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA micro card */}
            <div className="rounded-3xl border border-brand-200 bg-brand-50/60 backdrop-blur-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-0.5">Diagnóstico gratuito</div>
                <div className="text-[11px] text-brand-600/70">Descubra seu perfil internacional em 10 min</div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 flex-shrink-0" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
