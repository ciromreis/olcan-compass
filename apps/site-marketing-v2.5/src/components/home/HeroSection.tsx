"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Activity, FileText, CheckCircle2 } from "lucide-react";
import type { CMSHeroSection } from "@/lib/cms";

interface HeroSectionProps {
  content?: CMSHeroSection | null;
}

export const HeroSection = ({ content }: HeroSectionProps) => {
  const eyebrow = content?.eyebrow || "De onde você está — para onde quer chegar";
  const title = content?.title || "O mundo é seu. Você só precisa das ferramentas certas para atravessá-lo.";
  const accent = content?.accent || "";
  const description =
    content?.description ||
    "Metodologia própria para transformar ansiedade em aprovação internacional. Diagnóstico estratégico em 10 minutos. Sem promessas vazias.";
  const primaryCtaLabel = content?.primaryCtaLabel || "Iniciar Diagnóstico Gratuito →";
  const primaryCtaHref = content?.primaryCtaHref || "/diagnostico";
  const secondaryCtaLabel = content?.secondaryCtaLabel || "Ver Produtos";
  const secondaryCtaHref = content?.secondaryCtaHref || "/marketplace";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-olcan-navy">

      {/* Globe Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-globe.png"
          alt=""
          fill
          className="object-contain object-right opacity-20 lg:opacity-30"
          priority
          sizes="100vw"
        />
      </div>

      {/* Fractal Pattern Background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fractal" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 10 L90 90 L10 90 Z M50 30 L70 70 L30 70 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="2" fill="rgba(34,211,238,0.4)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fractal)" />
        </svg>
      </div>

      {/* Volumetric Spotlights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/6 via-transparent to-transparent rounded-full blur-[120px]" />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-olcan-navy/95 via-olcan-navy/80 to-olcan-navy/50" />

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column - Content */}
          <div className="lg:col-span-7 space-y-10 animate-fade-up">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Compass className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/90">{eyebrow}</span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white font-display leading-[1.1] tracking-[-0.03em]">
                {title}
              </h1>
              {accent && (
                <p className="text-2xl md:text-3xl text-[#E5E7EB] font-display italic font-light">
                  {accent}
                </p>
              )}
            </div>

            <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed font-sans">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#00BCD4] text-[#001338] rounded-full font-bold text-base hover:bg-[#00ACC1] transition-all shadow-2xl hover:shadow-[#00BCD4]/50 hover:scale-105 group"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/20 transition-all"
              >
                {secondaryCtaLabel}
              </Link>
            </div>

            {/* Stats — Honest */}
            <div className="pt-10 border-t border-white/10 grid grid-cols-3 gap-8">
              {[
                { value: "Método", label: "Próprio" },
                { value: "4 Rotas", label: "Internacionais" },
                { value: "10 min", label: "Diagnóstico" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Video Card */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-md">
              {/* Video Card with Glass Morphism */}
              <div className="relative w-full aspect-video bg-[rgba(255,255,255,0.08)] backdrop-blur-[24px] border border-white/20 border-t-2 border-t-white/40 rounded-3xl shadow-2xl overflow-hidden">
                {/* Video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/olcan-hero-video.mp4" type="video/mp4" />
                </video>
                
                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/40 via-transparent to-transparent pointer-events-none" />
                
                {/* Bottom label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
                    <p className="text-white text-xs font-bold tracking-wider uppercase">
                      Veja o Compass em ação
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
