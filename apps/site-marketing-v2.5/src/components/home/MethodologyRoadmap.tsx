'use client';

import { UserSearch, Target, FileText, Globe } from 'lucide-react';

const steps = [
  {
    icon: UserSearch,
    title: "Perfil (Diagnóstico)",
    description: "Mapeamos seus medos, orçamento e capital operacional.",
  },
  {
    icon: Target,
    title: "Prontidão (Gap Analysis)",
    description: "Identificamos o que falta exatamente para você ser competitivo.",
  },
  {
    icon: FileText,
    title: "Imigração (Burocracia)",
    description: "Navegação segura pelas exigências de vistos e documentos.",
  },
  {
    icon: Globe,
    title: "Marketing Pessoal Global",
    description: "Construção de narrativas que passam pelos filtros internacionais (ATS).",
  },
];

export function MethodologyRoadmap() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-brand-500 mb-4 font-bold">
            Nossa Engenharia
          </p>
          <h2 className="text-display-lg font-display text-olcan-navy">
            Metodologia aplicada à sua aprovação global.
          </h2>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-olcan-navy/20" style={{ zIndex: 0 }} />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex-1 relative" style={{ zIndex: 1 }}>
                <div className="flex flex-col items-center text-center">
                  {/* Icon Circle */}
                  <div className="w-24 h-24 rounded-full bg-olcan-navy flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="w-10 h-10 text-cyan-300" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-display font-bold text-olcan-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-olcan-navy flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-cyan-300" />
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-lg font-display font-bold text-olcan-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
