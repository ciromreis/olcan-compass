'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookOpen, FileText, Navigation, ArrowRight } from 'lucide-react';

/**
 * CodifiedArbitrageMatrix — The Product Bridge
 *
 * Converts the CEO's personal trajectory narrative into product adoption.
 * Placed directly below the InteractiveTimeline on /sobre/ceo.
 *
 * The user reads: "You have seen the journey. Now here is the machine that replicates it."
 * Each card maps a phase of Ciro's life to a specific Olcan product.
 *
 * NOTEBOOKLM_05 Reference: Section 5.3 "The Codified Arbitrage Product Bridge"
 */

interface ArbitrageCard {
  /** The life phase that inspired this product */
  context: string;
  /** Product name */
  product: string;
  /** Explanatory copy connecting biography to product */
  copy: string;
  /** CTA label */
  ctaLabel: string;
  /** Route or external URL */
  ctaHref: string;
  /** Whether the link is external */
  external?: boolean;
  /** Lucide icon component */
  icon: React.ReactNode;
  /** Visual accent for the card border-top */
  accentColor: string;
}

const cards: ArbitrageCard[] = [
  {
    context: 'A clareza que faltou na AIESEC.',
    product: 'Curso Sem Fronteiras',
    copy: 'Para quem precisa do mapa do zero, criei a base metodológica para evitar golpes de agências e planejar com segurança familiar.',
    ctaLabel: 'Conhecer o Curso',
    ctaHref: '/loja/curso-sem-fronteiras',
    icon: <BookOpen className="w-6 h-6" />,
    accentColor: '#FBBF24',
  },
  {
    context: 'Os templates que me levaram à LSE.',
    product: 'Kit Application 2.0',
    copy: 'O exato sistema de organização, controle de prazos e templates de currículo que usei para vencer os filtros do governo britânico.',
    ctaLabel: 'Acessar o Kit',
    ctaHref: '/loja/kit-application',
    icon: <FileText className="w-6 h-6" />,
    accentColor: '#60A5FA',
  },
  {
    context: 'A inteligência do TikTok aplicada à carreira.',
    product: 'Olcan Compass OS',
    copy: 'Entender algoritmos em escala me fez criar o Compass: um sistema operacional que avalia sua prontidão e redige sua narrativa com IA.',
    ctaLabel: 'Fazer Diagnóstico',
    ctaHref: '/diagnostico',
    icon: <Navigation className="w-6 h-6" />,
    accentColor: '#34D399',
  },
];

interface CodifiedArbitrageMatrixProps {
  className?: string;
}

export const CodifiedArbitrageMatrix = ({ className }: CodifiedArbitrageMatrixProps) => {
  return (
    <section
      className={cn(
        'py-24 md:py-32 relative overflow-hidden',
        'bg-gradient-to-b from-[#F8FAFC] to-white',
        className
      )}
    >
      {/* Subtle background grain */}
      <div className="absolute inset-0 bg-hero-grain opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="container-site max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20 animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-olcan-navy/5 border border-olcan-navy/10 text-[10px] font-bold uppercase tracking-[0.2em] text-olcan-navy/60 mb-6">
            Da biografia ao produto
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-olcan-navy tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Não ensino internacionalização.{' '}
            <span className="italic font-light">
              Eu codifiquei a minha travessia.
            </span>
          </h2>
          <p className="mt-6 text-lg text-olcan-navy/60 font-body max-w-2xl mx-auto leading-relaxed">
            Cada produto da Olcan nasceu de uma fase real da minha jornada — das noites sem dormir na AIESEC ao dia em que recebi a carta da Chevening.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 40px rgba(0, 19, 56, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Accent top bar */}
              <div
                className="h-1 w-full transition-all duration-500 group-hover:h-1.5"
                style={{ backgroundColor: card.accentColor }}
              />

              <div className="flex flex-col flex-1 p-8">
                {/* Icon + Context */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: card.accentColor }}
                  >
                    {card.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-olcan-navy/40">
                    {card.context}
                  </span>
                </div>

                {/* Product name */}
                <h3 className="font-display text-2xl text-olcan-navy mb-3 tracking-tight">
                  {card.product}
                </h3>

                {/* Description */}
                <p className="text-sm text-olcan-navy/60 leading-relaxed font-body flex-1 mb-6">
                  {card.copy}
                </p>

                {/* CTA */}
                {card.external ? (
                  <a
                    href={card.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-olcan-navy group-hover:text-olcan-navy/80 transition-colors"
                  >
                    {card.ctaLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
                  <Link
                    href={card.ctaHref}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-olcan-navy group-hover:text-olcan-navy/80 transition-colors"
                  >
                    {card.ctaLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
