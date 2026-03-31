"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Instagram, Linkedin, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#d7dee8] bg-[linear-gradient(180deg,#eef2f7_0%,#e4e9f0_100%)] pt-24 pb-12">
      {/* Absolute faint logo in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
        <span className="font-display text-[40vw] leading-none whitespace-nowrap text-[#001338]">OLCAN</span>
      </div>

      <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
        <div className="mb-20 grid gap-12 text-[#001338] md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(145deg,#001338,#6c7a93)] shadow-lg transition-transform group-hover:scale-105">
                <span className="text-white font-display text-2xl leading-none mt-1">O</span>
              </div>
              <span className="font-display text-3xl tracking-tight text-[#001338] transition-colors group-hover:text-[#445372]">Olcan.</span>
            </Link>
            <p className="mb-8 pr-4 text-lg font-light leading-relaxed text-[#4a507a]">
              Estrategia, narrativa e decisao para profissionais brasileiros que querem internacionalizar a carreira com mais rigor e menos improviso.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Globe, href: "#" }
              ].map((social, i) => (
                <Link key={i} href={social.href} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#4a507a] transition-all hover:border-[#8a97ab] hover:bg-white hover:text-[#001338]">
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Nav groups */}
          <div className="lg:col-span-2">
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-[#7a869b]">Ecossistema</h4>
            <ul className="space-y-4">
              {['Compass App', 'Metodologia Olcan', 'Rede de especialistas', 'Diagnóstico'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium text-[#4a507a] transition-colors hover:text-[#001338]">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-[#7a869b]">Conhecimento</h4>
            <ul className="space-y-4">
              {['Manifesto de produto', 'Guia de rotas globais', 'Editorial Olcan', 'FAQ'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium text-[#4a507a] transition-colors hover:text-[#001338]">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="lg:col-span-3">
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-[#7a869b]">Acesso exclusivo</h4>
            <p className="mb-6 text-sm font-light leading-relaxed text-[#4a507a]">
              Receba análises de rota, leitura de mercado e convites para novas ferramentas diretamente no seu inbox.
            </p>
            <div className="mb-8 flex rounded-full border border-white/70 bg-white/60 p-1.5 transition-colors focus-within:border-[#8a97ab]">
              <input 
                type="email" 
                placeholder="Seu e-mail corporativo" 
                className="w-full border-none bg-transparent px-4 py-2 text-sm text-[#001338] outline-none placeholder:text-[#94a0b2] focus:ring-0"
              />
              <button className="rounded-full bg-[#001338] p-2.5 text-white transition-colors hover:bg-[#5f6f8c]">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#5e6b83]">
              <MapPin className="w-4 h-4" />
              <span>Baseado em São Paulo & Miami</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/70 pt-8 md:flex-row">
          <p className="text-xs text-[#6f7b90]">
            © {new Date().getFullYear()} Olcan Intelligence. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 text-xs text-[#6f7b90]">
            <Link href="#" className="transition-colors hover:text-[#001338]">Privacidade</Link>
            <Link href="#" className="transition-colors hover:text-[#001338]">Termos corporativos</Link>
            <Link href="#" className="transition-colors hover:text-[#001338]">Documentos legais</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Emulate ArrowRight locally since Mail was imported but I used ArrowRight
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
