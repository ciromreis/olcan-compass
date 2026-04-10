import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, Users, Award, Play } from 'lucide-react';

export const OriginStory = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-32 bg-[#FAFAF8]", className)}>
      <div className="container-site max-w-[680px]">
        <div className="animate-fade-up space-y-12">
          <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight leading-tight">
            A internacionalização não foi um destino — foi uma escolha feita várias vezes.
          </h2>

          <div className="space-y-8 text-olcan-navy/80 text-lg leading-relaxed font-body">
            <p>
              Ciro nasceu em Nova Soure, no interior da Bahia. Chegou a Salvador para estudar na Universidade Federal, passou em provas públicas, acumulou bolsas de mérito — e em 2013 atravessou o Atlântico pela primeira vez, como pesquisador no Woodrow Wilson International Center for Scholars, em Washington D.C.
            </p>
            <p>
              O que poderia ser uma curiosidade no currículo virou uma filosofia de vida: entender os sistemas por dentro. Da Defensoria Pública da União ao TikTok. Das ruas de Salvador ao Palácio de Buckingham. Do direito civil à segurança digital em escala de bilhões de usuários.
            </p>
            <p>
              Mas a virada real aconteceu quando Ciro percebeu que o maior obstáculo para brasileiros com potencial internacional não é o idioma, nem a qualificação — é a ausência de um mapa. Um sistema. Uma forma de transformar ambição difusa em sequência de ações.
            </p>
          </div>

          <blockquote className="relative p-10 rounded-[2rem] bg-olcan-navy text-white mt-16 shadow-glass-elevated">
            <div className="absolute top-8 left-8 opacity-20">
              <Play className="w-12 h-12 fill-white rotate-180" />
            </div>
            <p className="relative z-10 text-2xl font-display leading-tight mb-6">
              "A maioria das pessoas não vai porque não sabe por onde começar. O Compass existe para resolver exatamente isso."
            </p>
            <cite className="relative z-10 block not-italic font-bold tracking-widest text-[#E5E7EB] uppercase text-xs">
              Ciro Moraes dos Reis
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export const ImpactStats = ({ className }: { className?: string }) => {
  const stats = [
    {
      number: "4+",
      label: "anos de experiência em cargos de impacto internacional",
      icon: <Globe className="w-6 h-6" />
    },
    {
      number: "8",
      label: "países onde viveu, trabalhou ou estudou",
      icon: <Users className="w-6 h-6" />
    },
    {
      number: "3",
      label: "instituições de prestígio global: LSE, Woodrow Wilson, Fundação Botín",
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <section className={cn("py-24 border-y border-olcan-navy/5", className)}>
      <div className="container-site">
        <h3 className="label-xs text-olcan-navy/40 mb-20 text-center">Travessia em números</h3>
        
        <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {stats.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-3xl bg-olcan-navy/5 flex items-center justify-center text-olcan-navy mb-8 group-hover:scale-110 transition-transform duration-500">
                {s.icon}
              </div>
              <div className="font-display text-6xl text-olcan-navy mb-4 italic tracking-tighter">
                {s.number}
              </div>
              <p className="text-sm font-medium text-olcan-navy/60 leading-relaxed max-w-[200px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
