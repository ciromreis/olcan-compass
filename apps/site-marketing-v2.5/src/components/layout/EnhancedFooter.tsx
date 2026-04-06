"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Compass, Briefcase, Shield, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.85a8.18 8.18 0 0 0 4.79 1.53V6.96a4.85 4.85 0 0 1-1.02-.27z" />
    </svg>
  );
}

const footerSections = [
  {
    title: "Produto",
    items: [
      { label: "Curso Cidadão do Mundo", href: "/marketplace/curso-cidadao-mundo" },
      { label: "Rota da Internacionalização", href: "/marketplace/rota-internacionalizacao" },
      { label: "Kit Application", href: "/marketplace/kit-application" },
      { label: "Diagnóstico", href: "/diagnostico" },
    ]
  },
  {
    title: "Serviços",
    items: [
      { label: "Loja", href: "/marketplace", icon: Briefcase },
      { label: "Mentoria de Carreira", href: "/ciro", icon: Users },
      { label: "Acompanhamento", href: "/contato", icon: Users },
      { label: "Assistência Jurídica", href: "/marketplace", icon: Shield },
    ]
  },
  {
    title: "Empresa",
    items: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "CEO — Ciro Moraes", href: "/sobre/ceo" },
      { label: "Mentoria com Ciro", href: "/ciro" },
      { label: "Blog", href: "/blog" },
      { label: "@olcan.global", href: "https://instagram.com/olcan.global" },
    ]
  },
  {
    title: "Suporte",
    items: [
      { label: "Instagram", href: "https://instagram.com/olcan.global" },
      { label: "TikTok", href: "https://tiktok.com/@olcan.global" },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Privacidade", href: "/privacidade" },
    ]
  }
];

// Usando componente local TikTokIcon
const socialLinks: Array<{ icon: typeof Instagram | typeof TikTokIcon; href: string; label: string }> = [
  { icon: Instagram, href: "https://instagram.com/olcan.global", label: "Instagram @olcan.global" },
  { icon: TikTokIcon, href: "https://tiktok.com/@olcan.global", label: "TikTok @olcan.global" },
];

const trustBadges = [
  { icon: Shield, text: "Pagamento Seguro" },
  { icon: Star, text: "4.8/5 Avaliação" },
  { icon: Users, text: "2.000+ Usuários" },
];

export default function EnhancedFooter() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  return (
    <footer className="bg-cream border-t border-olcan-navy/5 relative overflow-hidden noise">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />

      {/* Main Footer Content */}
      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="py-20 sm:py-32">
          {/* Brand & Trust Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
            <div className="max-w-2xl">
              <Link href="/" className="inline-block mb-10 group">
                <Image
                  src="/images/olcan-logo.png"
                  alt="Olcan"
                  width={192}
                  height={48}
                  className="h-12 w-auto object-contain brightness-[1.05] contrast-[1.05] group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500"
                />
              </Link>
              <p className="font-display text-2xl text-olcan-navy leading-relaxed tracking-tight italic font-light">
                Conhecimento para construir seu futuro. Da decisão ao desembarque, a Olcan está com 
                você em cada etapa da sua <span className="text-brand-600">jornada global.</span>
              </p>
            </div>
            
            {/* Trust Badges - Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-4 p-5 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl shadow-xl shadow-olcan-navy/5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <badge.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className="label-xs text-olcan-navy leading-tight">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-32">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-10">
                <h4 className="label-xs text-brand-600/60 transition-colors uppercase tracking-wide">{section.title}</h4>
                <ul className="space-y-5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-2 text-sm font-bold text-olcan-navy/50 hover:text-olcan-navy transition-all duration-500 uppercase tracking-widest"
                      >
                        <span className="relative overflow-hidden flex items-center gap-2">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA Section - The Vault / RPG Style */}
          <div className="relative rounded-[3rem] p-12 md:p-20 overflow-hidden text-center mb-32 border-2 border-white/60 shadow-2xl shadow-olcan-navy/10"
               style={{ 
                 background: "linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)",
               }}>
            <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full inline-flex items-center gap-3 mb-10">
                <Compass size={14} className="text-brand-400" />
                <span className="label-xs text-white/80">Olcan Intelligence v2.5</span>
              </div>
              
              <h3 className="font-display text-4xl md:text-6xl text-white mb-10 tracking-tight leading-[1.1]">
                Pronto para iniciar sua <br />
                <span className="italic font-light text-brand-400 font-serif">Jornada Global?</span>
              </h3>
              
              <p className="text-xl text-white/70 mb-14 font-medium leading-relaxed">
                Comece com o diagnóstico gratuito e descubra seu perfil de internacionalização em menos de 10 minutos.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link
                  href="/diagnostico"
                  className="btn-primary py-6 px-12 text-lg shadow-2xl shadow-brand-500/30 group w-full sm:w-auto"
                >
                  Iniciar Diagnóstico Gratuito
                  <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href="/marketplace"
                  className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 px-10 py-5 rounded-2xl text-lg font-bold uppercase tracking-widest transition-all duration-500 w-full sm:w-auto"
                >
                  Ver Loja
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Contact & Legal */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-16 border-t border-olcan-navy/5">
            <div className="flex flex-wrap items-center justify-center gap-8 label-xs text-olcan-navy/40">
              <a href="https://instagram.com/olcan.global" target="_blank" rel="noopener noreferrer" className="hover:text-olcan-navy transition-colors">Instagram</a>
              <a href="https://tiktok.com/@olcan.global" target="_blank" rel="noopener noreferrer" className="hover:text-olcan-navy transition-colors">TikTok</a>
              <Link href="/termos" className="hover:text-olcan-navy transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-olcan-navy transition-colors">Privacidade</Link>
              <Link href="/contato" className="hover:text-olcan-navy transition-colors">Suporte</Link>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-14 h-14 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-olcan-navy/40 hover:text-brand-600 hover:border-brand-300 hover:shadow-xl hover:shadow-olcan-navy/5 transition-all duration-500"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="flex flex-col items-center lg:items-start gap-2 label-xs text-olcan-navy/30" suppressHydrationWarning>
              <div>© {new Date().getFullYear()} Olcan — Todos os Direitos Reservados</div>
              <div className="text-olcan-navy/20">OLCAN DESENVOLVIMENTO PROFISSIONAL E INOVADOR LTDA</div>
              <div className="text-olcan-navy/20">CNPJ: 32.928.227/0001-06 · Av. Paulista, 1636 — São Paulo/SP</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
