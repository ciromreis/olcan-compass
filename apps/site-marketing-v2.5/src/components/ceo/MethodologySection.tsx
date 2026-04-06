import React from 'react';
import { cn } from '@/lib/utils';
import { Microscope, Map, Zap, Brain } from 'lucide-react';

export const MethodologySection = ({ className }: { className?: string }) => {
  const cards = [
    {
      icon: <Microscope className="w-5 h-5" />,
      title: "Diagnóstico de Perfil",
      copy: "12 anos testando o que diferencia candidatos aprovados dos recusados. O motor de diagnóstico do Compass surgiu dessa observação sistemática — não de teoria acadêmica isolada."
    },
    {
      icon: <Map className="w-5 h-5" />,
      title: "Framework FIND/DECIDE/BUILD",
      copy: "Da pesquisa de oportunidades à submissão de candidaturas — cada fase do Compass espelha uma etapa real da jornada de internacionalização, com os atalhos que Ciro descobriu na prática."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Sistema de Sprints",
      copy: "Baseado em como os profissionais de alto desempenho realmente completam processos seletivos complexos: não em motivação vaga, mas em sequências de ações com accountability."
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Mentoria com contexto real",
      copy: "Ciro não ensina internacionalização por livro. Ele navegou o sistema Chevening, o ecossistema de Washington, as big techs e o terceiro setor global — e sabe onde estão os atalhos e os abismos."
    }
  ];

  return (
    <section className={cn("py-32 bg-white/30 skew-y-1 relative overflow-hidden", className)}>
      <div className="container-site -skew-y-1">
        <div className="text-center mb-24 animate-fade-up">
           <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight leading-tight">
             Por que a experiência de Ciro virou metodologia.
          </h2>
          <p className="text-xl text-olcan-navy/60 font-medium mt-6 max-w-2xl mx-auto font-body">
            A Olcan não é uma empresa de consultoria genérica. É a codificação de um caminho que Ciro percorreu — e que agora pode ser replicado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((c, idx) => (
            <div key={idx} className="card-olcan p-10 flex flex-col group border-olcan-navy/5">
              <div className="w-12 h-12 rounded-2xl bg-olcan-navy text-white flex items-center justify-center mb-8 shadow-glass transition-transform group-hover:scale-110">
                {c.icon}
              </div>
              <h3 className="font-display text-xl text-olcan-navy mb-4 italic tracking-tight">{c.title}</h3>
              <p className="text-sm font-medium text-olcan-navy/60 leading-relaxed font-body">
                {c.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const MissionBanner = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-32 bg-olcan-navy text-white relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="container-site relative z-10 flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 space-y-8 max-w-2xl animate-fade-up">
          <blockquote className="space-y-6">
            <p className="font-display text-3xl md:text-5xl leading-tight">
              "Eu construí a Olcan porque cada pessoa que me pede ajuda merecia ter tido acesso a esse sistema antes — não depois de anos desperdiçados no escuro."
            </p>
            <footer className="flex flex-col gap-1">
              <p className="font-bold tracking-widest text-[#C08A3C] uppercase text-xs">Ciro Moraes dos Reis</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Fundador & CEO da Olcan</p>
            </footer>
          </blockquote>
        </div>

        <div className="flex-1 relative w-full lg:w-auto h-[400px] lg:h-[500px] rounded-[3rem] overflow-hidden group">
          <div className="absolute inset-0 bg-olcan-navy/20 z-10" />
          <div className="bg-olcan-navy/20 animate-pulse absolute inset-0 z-0" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <p className="text-white/40 text-[10px] uppercase font-medium tracking-widest">[ Foto Ciro Mentoria ]</p>
          </div>
          {/* We'll use a placeholder since it's a specific context photo the user mentioned */}
        </div>
      </div>
    </section>
  );
};
