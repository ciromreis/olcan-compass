"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-bone selection:bg-brand-100/30">
      {/* ─── Background & Texture ─── */}
      <div className="absolute inset-0 z-0 bg-hero-grain opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-50/40 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-flame-50/30 blur-[100px] rounded-full z-0" />

      <div className="container-site relative z-10">
        <div className="grid lg:grid-grid-grid-grid-grid-grid-cols-12 gap-12 items-center">
          
          {/* ─── Left Column: Content ─── */}
          <div className="lg:col-span-7 space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3 fill-current" />
              <span>Plataforma V2.5 Stable</span>
            </div>

            <h1 className="text-display-xl lg:text-display-2xl text-ink font-display leading-[0.9] tracking-tight">
              Sua Carreira <br />
              <span className="text-brand-500">Sem Fronteiras.</span>
            </h1>

            <p className="text-lg lg:text-xl text-slate max-w-xl leading-relaxed font-sans font-normal italic">
              A Olcan Compass é a bússola definitiva para profissionais brasileiros que buscam o topo do mercado global. 
              Estratégia, capacitação e rede de contatos em uma única plataforma.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/onboarding" className="btn-primary group">
                <span>Começar Jornada</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/solutions" className="btn-secondary">
                Ver Soluções
              </Link>
            </div>

            {/* Social Proof / Trusted partners */}
            <div className="pt-12 border-t border-brand/5">
              <p className="label-xs text-brand/40 mb-4">Reconhecimento Global em</p>
              <div className="flex gap-8 opacity-40 grayscale grayscale hover:grayscale-0 transition-all duration-500">
                <span className="font-display font-medium text-xl tracking-tighter">ESTADOS UNIDOS</span>
                <span className="font-display font-medium text-xl tracking-tighter">EUROPA</span>
                <span className="font-display font-medium text-xl tracking-tighter">ÁSIA</span>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Visual Archetypes ─── */}
          <div className="lg:col-span-5 relative h-[600px] hidden lg:block">
            {/* Main Floating Archetypes */}
            <div className="absolute top-0 right-0 w-full h-full">
              
              {/* Scholar Archetype Card */}
              <div className="absolute top-[5%] left-[10%] w-[220px] card-olcan companion-float z-30 group">
                <div className="relative h-40 mb-4 overflow-hidden rounded-xl bg-white/50">
                  <Image 
                    src="/images/hero/scholarship.png" 
                    alt="Scholarship Path" 
                    fill 
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-1">Scholar</h3>
                <p className="text-[10px] text-slate uppercase font-medium">Mestrado & Doutorado</p>
              </div>

              {/* Corporate Archetype Card */}
              <div className="absolute top-[35%] right-[5%] w-[240px] card-olcan companion-float-delayed z-40 group">
                <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-white/50">
                  <Image 
                    src="/images/hero/corporate.png" 
                    alt="Corporate Path" 
                    fill 
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-1">Corporate</h3>
                <p className="text-[10px] text-slate uppercase font-medium">Tech & Leadership</p>
              </div>

              {/* Nomad Archetype Card */}
              <div className="absolute bottom-[5%] left-[5%] w-[200px] card-olcan companion-float z-20 group">
                <div className="relative h-36 mb-4 overflow-hidden rounded-xl bg-white/50">
                  <Image 
                    src="/images/hero/nomad.png" 
                    alt="Nomad Path" 
                    fill 
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-1">Nomad</h3>
                <p className="text-[10px] text-slate uppercase font-medium">Global Freelance</p>
              </div>

              {/* Decorative Liquid Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-brand/5 rounded-full z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-brand/10 rounded-full z-0" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
