import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';

export const MediaGrid = ({ className }: { className?: string }) => {
  const items = [
    "Chevening Scholars Network",
    "TikTok Newsroom",
    "Fundação Lemann",
    "Woodrow Wilson Center"
  ];

  return (
    <section className={cn("py-24 bg-white/20 border-y border-olcan-navy/5", className)}>
      <div className="container-site">
         <h3 className="label-xs text-olcan-navy/40 mb-16 text-center italic tracking-widest">Citado e reconhecido por</h3>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-40 grayscale">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center">
                 <span className="font-display text-xl font-bold italic tracking-tighter text-olcan-navy whitespace-nowrap">{item}</span>
              </div>
            ))}
         </div>
      </div>
    </section>
  );
};

export const ProductCrossSell = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-32 bg-[#FAFAF8]", className)}>
      <div className="container-site max-w-4xl mx-auto px-6 text-center animate-fade-up">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-olcan-navy/10 bg-olcan-navy/5 mb-10">
          <Compass className="w-4 h-4 text-brand-blue" />
          <span className="label-xs text-olcan-navy/60 italic tracking-widest font-bold">Autonomia & Método</span>
        </div>
        
        <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight leading-tight mb-8">
          Prefere começar <span className="italic font-light text-brand-blue">no seu ritmo?</span>
        </h2>
        
        <p className="text-xl text-olcan-navy/80 font-medium leading-relaxed font-body max-w-2xl mx-auto mb-12">
          O Compass é a versão digitalizada da metodologia de Ciro — disponível 24 horas por dia, com diagnóstico de perfil, módulos de rota e sistema de sprints. Comece gratuitamente e avance no seu tempo.
        </p>
        
        <Link 
          href="/compass"
          className="inline-flex items-center gap-2 text-olcan-navy font-bold uppercase tracking-widest text-sm hover:translate-x-2 transition-transform border-b-2 border-olcan-navy/20 pb-1"
        >
          Conhecer o Compass
          <ArrowRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
    </section>
  );
};

export const MinimalFooter = ({ className }: { className?: string }) => {
  return (
    <footer className={cn("py-16 bg-white border-t border-olcan-navy/5", className)}>
      <div className="container-site flex flex-col md:flex-row justify-between items-center gap-10">
        <p className="text-sm font-medium text-olcan-navy/40 uppercase tracking-widest">
           Ciro Moraes dos Reis · Fundador & CEO da Olcan
        </p>
        
        <div className="flex items-center gap-8">
           <a href="https://linkedin.com/in/ciromreis" target="_blank" className="text-sm font-bold text-olcan-navy hover:text-brand-blue transition-colors uppercase tracking-widest">LinkedIn</a>
           <Link href="/compass" className="text-sm font-bold text-olcan-navy hover:text-brand-blue transition-colors uppercase tracking-widest">Compass</Link>
           <Link href="/sobre" className="text-sm font-bold text-olcan-navy hover:text-brand-blue transition-colors uppercase tracking-widest">Sobre a Olcan</Link>
        </div>
      </div>
    </footer>
  );
};
