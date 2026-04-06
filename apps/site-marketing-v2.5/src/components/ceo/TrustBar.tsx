import React from 'react';
import { cn } from '@/lib/utils';

export const TrustBar = ({ className }: { className?: string }) => {
  const logos = [
    "London School of Economics",
    "TikTok",
    "Transparência Internacional Brasil",
    "Woodrow Wilson Center",
    "Fundação Lemann",
    "Fundação Botín",
    "Brown University",
    "Universidade de Salamanca"
  ];

  return (
    <div className={cn("py-12 bg-white/40 border-y border-olcan-navy/5 relative overflow-hidden", className)}>
      <div className="container-site">
        <p className="label-xs text-olcan-navy/40 mb-8 text-center">Formação e experiência em</p>
        
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          {logos.map((logo, idx) => (
            <div key={idx} className="group">
              <span className="text-sm font-bold text-olcan-navy/80 hover:text-olcan-navy uppercase tracking-widest whitespace-nowrap">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
