'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Globe,
  BookOpen,
  GraduationCap,
  Scale,
  BarChart3,
  School,
  Projector,
  Search,
  Smartphone,
  Navigation,
} from 'lucide-react';

/**
 * CeoTimeline — Beautiful Visual Timeline with Always-Visible Photos
 *
 * Photos are displayed prominently alongside content.
 * Photos use object-cover for visual impact.
 * Queen Elizabeth II photo receives "Sober Treatment": grayscale + contrast.
 *
 * Design: Alternating left/right layout with large photo cards
 */

interface TimelineItem {
  year: string;
  role: string;
  location: string;
  icon: React.ReactNode;
  copy: string;
  tag: string;
  /** Path to the photo asset in /public/images/ */
  imageSrc?: string;
  imageAlt?: string;
  /** Special filter treatment for archival photos */
  soberTreatment?: boolean;
}

const items: TimelineItem[] = [
  {
    year: '2010–2013',
    role: 'Coordenador — AIESEC Salvador',
    location: 'Salvador, Brasil + Iași, Romênia + Buenos Aires, Argentina',
    icon: <Globe className="w-5 h-5" />,
    copy: 'Primeiro contato com liderança intercultural. Gerenciou voluntários em ONGs, coordenou intercâmbios internacionais e viveu experiências de campo na Romênia e na Argentina — antes de qualquer título formal.',
    tag: 'Liderança · Cooperação Internacional',
    imageSrc: '/images/ciro-timeline-1.jpg',
    imageAlt: 'Ciro Moraes no Castelo de Peleș, Sinaia, Romênia — período AIESEC',
  },
  {
    year: '2013',
    role: 'Research Assistant — Woodrow Wilson Center',
    location: 'Washington D.C., EUA',
    icon: <BookOpen className="w-5 h-5" />,
    copy: 'Participou do Prudential Foundation Global Citizens Program e colaborou em pesquisa sobre direitos das mulheres. Primeiro contato com o ecossistema de think tanks de Washington.',
    tag: 'Pesquisa de Políticas Públicas',
    imageSrc: '/images/ciro-timeline-2.jpg',
    imageAlt: 'Ciro Moraes e colegas no Capitólio dos EUA, Washington D.C.',
  },
  {
    year: '2014',
    role: 'Programa de Fortalecimento do Serviço Civil — Fundação Botín',
    location: 'EUA + Espanha + Brasil (Brown, Salamanca, FGV)',
    icon: <GraduationCap className="w-5 h-5" />,
    copy: 'Selecionado para programa competitivo de formação de líderes do setor público na América Latina. Passou por Brown University, Universidade de Salamanca e FGV em sequência.',
    tag: 'Liderança Pública · América Latina',
    imageSrc: '/images/ciro-timeline-3.jpg',
    imageAlt: 'Ciro Moraes na Kennedy School of Government, Harvard, Boston — 2015',
  },
  {
    year: '2016–2017',
    role: 'MSc Políticas Públicas e Gestão — London School of Economics',
    location: 'Londres, Reino Unido',
    icon: <School className="w-5 h-5" />,
    copy: 'Bolsa Chevening — o programa de bolsas mais competitivo do governo britânico. Focou em governança democrática e políticas baseadas em evidências. Um dos menos de 1.500 Chevening Scholars selecionados globalmente naquele ano.',
    tag: 'Chevening Scholar · LSE',
    imageSrc: '/images/ciro-timeline-4.jpg',
    imageAlt: 'Ciro Moraes com a Rainha Elizabeth II — Recepção dos Chevening Scholars na London School of Economics',
    soberTreatment: true,
  },
  {
    year: '2019–2020',
    role: 'Arquiteto de Impacto Social',
    location: 'São Paulo, Brasil',
    icon: <Projector className="w-5 h-5" />,
    copy: 'Coordenou projetos de transformação educacional em escala nacional. Construiu pontes entre governo, sociedade civil e indicadores de impacto real — aprendendo a traduzir visão em execução mensurável.',
    tag: 'Impacto Social · Gestão Estratégica',
  },
  {
    year: '2021–2024',
    role: 'Guardião da Integridade Digital',
    location: 'São Paulo, Brasil',
    icon: <Smartphone className="w-5 h-5" />,
    copy: 'Liderou estratégias de segurança digital e combate à desinformação durante as eleições brasileiras de 2022 — em escala de bilhões de usuários. Construiu ecossistemas de confiança com universidades, fact-checkers e sociedade civil.',
    tag: 'Segurança Digital · Escala Global',
  },
  {
    year: '2026',
    role: 'Cartógrafo de Travessias',
    location: 'Brasil → Mundo',
    icon: <Navigation className="w-5 h-5" />,
    copy: 'Transformou décadas de travessia internacional em metodologia navegável. O Compass não é apenas um produto — é o mapa que Ciro gostaria de ter tido quando saíu de Nova Soure pela primeira vez.',
    tag: 'Fundador · Produto · Legado',
  },
];

export const CeoTimeline = ({ className }: { className?: string }) => {
  // Filter only items with photos for the main visual timeline
  const photoItems = items.filter(item => item.imageSrc);

  return (
    <section className={cn('py-32 relative overflow-hidden bg-gradient-to-b from-white to-cream', className)}>
      <div className="container-site max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 animate-fade-up">
          <p className="text-sm uppercase tracking-wider text-brand-500 mb-4 font-bold">
            A Trajetória
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-olcan-navy tracking-tight mb-6">
            De Nova Soure ao Palácio de Buckingham
          </h2>
          <p className="text-xl text-olcan-navy/70 max-w-3xl mx-auto leading-relaxed">
            Cada foto conta uma parte da jornada que transformou experiência vivida em metodologia replicável.
          </p>
        </div>

        <div className="space-y-24">
          {photoItems.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'grid lg:grid-cols-2 gap-12 items-center',
                idx % 2 === 0 ? '' : 'lg:grid-flow-dense'
              )}
            >
              {/* Photo Card - Always Visible */}
              <div className={cn(
                'relative group',
                idx % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-2'
              )}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={item.imageSrc!}
                    alt={item.imageAlt || ''}
                    fill
                    className={cn(
                      'object-cover transition-transform duration-700 group-hover:scale-105',
                      item.soberTreatment && 'grayscale-[20%] contrast-125'
                    )}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/40 via-transparent to-transparent" />
                  
                  {/* Photo Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-lg">
                      <p className="text-white text-xs font-bold tracking-wider">
                        {item.imageAlt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Card */}
              <div className={cn(
                'space-y-6',
                idx % 2 === 0 ? 'lg:col-start-2' : 'lg:col-start-1'
              )}>
                <div className="space-y-3">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-600 text-xs font-bold uppercase tracking-widest">
                    {item.year}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-olcan-navy leading-tight">
                    {item.role}
                  </h3>
                  <p className="text-sm font-medium text-olcan-navy/50 uppercase tracking-widest">
                    {item.location}
                  </p>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-olcan-navy/5 text-[10px] font-bold text-olcan-navy uppercase tracking-widest">
                  {item.tag}
                </div>

                <p className="text-lg text-olcan-navy/80 leading-relaxed font-body">
                  {item.copy}
                </p>

                {/* Icon Badge */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="w-10 h-10 rounded-full bg-olcan-navy text-white flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="h-px flex-1 bg-olcan-navy/10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Timeline Items Without Photos */}
        <div className="mt-32 pt-16 border-t border-olcan-navy/10">
          <h3 className="font-display text-3xl text-olcan-navy text-center mb-16">
            Outras Experiências Formativas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.filter(item => !item.imageSrc).map((item, idx) => (
              <div key={idx} className="card-olcan p-6 bg-white/60 border-transparent hover:border-olcan-navy/10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-olcan-navy/5 text-olcan-navy flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-500 block mb-1">
                      {item.year}
                    </span>
                    <p className="text-[10px] font-medium text-olcan-navy/40 uppercase tracking-widest">
                      {item.location}
                    </p>
                  </div>
                </div>
                <span className="inline-block px-2 py-1 rounded-full bg-olcan-navy/5 text-[9px] font-bold text-olcan-navy uppercase tracking-widest mb-3">
                  {item.tag}
                </span>
                <h4 className="font-display text-lg text-olcan-navy mb-2 leading-tight">
                  {item.role}
                </h4>
                <p className="text-sm text-olcan-navy/60 leading-relaxed font-body">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
