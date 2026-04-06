import React from 'react';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CeoHeroProps {
  className?: string;
}

export const CeoHero = ({ className }: CeoHeroProps) => {
  return (
    <section className={cn("relative min-h-screen flex items-center overflow-hidden bg-cream pt-20 lg:pt-0", className)}>
      {/* Background grain */}
      <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none z-0" />

      <div className="container-site relative z-10 grid lg:grid-cols-2 gap-0 items-stretch min-h-screen">
        {/* Left: Image (Full Screen Split) */}
        <div className="relative group overflow-hidden h-[50vh] lg:h-auto order-2 lg:order-1">
          <Image
            src="/images/ceo-hero.png"
            alt="Ciro Moraes dos Reis - Chevening Scholar"
            fill
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          {/* Subtle blue overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001338]/40 via-[#001338]/10 to-transparent mix-blend-multiply" />

          {/* Annotation */}
          <div className="absolute bottom-8 left-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <p className="text-white text-[10px] font-medium tracking-widest uppercase opacity-80">
                Chevening Scholar, London School of Economics — 2016
              </p>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center py-20 lg:py-0 lg:pl-20 order-1 lg:order-2">
          <div className="max-w-xl space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-olcan-navy/5 border border-olcan-navy/10">
              <Compass className="w-3.5 h-3.5 text-brand-blue" />
              <span className="label-xs text-olcan-navy/70">Quem vai te guiar</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[0.95] tracking-tight">
              Alguém que já<br />
              atravessou o oceano — <br />
              <span className="italic font-light text-brand-blue">e voltou para pavimentar o caminho.</span>
            </h1>

            <p className="text-xl text-olcan-navy/80 leading-relaxed font-body">
              Ciro Moraes dos Reis é advogado, Mestre em Políticas Públicas pela London School of Economics, ex-Gerente de Parcerias no TikTok e fundador da Olcan. Mais de uma década construindo pontes entre o Sul Global e as maiores instituições do mundo.
            </p>

            <div className="flex flex-wrap gap-5 pt-4">
              <a
                href="https://zenklub.com.br/coaches/ciro-moraes/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-4 text-base shadow-glass"
              >
                Agendar mentoria com Ciro
              </a>
              <Link
                href="/compass"
                className="btn-secondary px-8 py-4 text-base border-transparent hover:border-olcan-navy/20"
              >
                Conhecer o Compass
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
