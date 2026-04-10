import React from 'react';
import { cn } from '@/lib/utils';
import { Check, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export const MentorshipCTA = ({ id, className }: { id?: string; className?: string }) => {
  const includes = [
    "Diagnóstico de perfil pré-sessão",
    "Análise do seu estágio atual na jornada de internacionalização",
    "Plano de ação com próximos passos concretos",
    "Gravação da sessão",
    "Acesso a 1 mês do Compass Pro"
  ];

  return (
    <section id={id} className={cn("py-32", className)}>
      <div className="container-site max-w-5xl mx-auto px-6">
        <div className="rounded-[4rem] bg-olcan-navy p-12 md:p-24 text-center relative overflow-hidden shadow-glass-strong animate-fade-up">
          <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[160px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            <h2 className="font-display text-4xl md:text-6xl text-white mb-8 tracking-tight leading-tight">
              Você não precisa descobrir o<br />
              <span className="italic font-light text-brand-blue-light">caminho sozinho.</span>
            </h2>
            <p className="text-white/70 text-xl font-medium leading-relaxed font-body">
              Uma sessão com Ciro pode economizar meses de tentativa e erro. Ele já mapeou o terreno — e vai te mostrar exatamente onde você está e qual passo dar a seguir.
            </p>

            {/* Offer box */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16 space-y-10">
              <div className="space-y-2">
                <p className="label-xs text-white/50">Mentoria Individual com Ciro</p>
                <p className="font-display text-4xl text-white tracking-tight">Sessão de 60 minutos</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-brand-blue-light uppercase tracking-widest px-3 py-1 bg-brand-blue/10 rounded-full border border-brand-blue/20">
                    Online · Ao vivo · Português
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                {includes.map((inc, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-blue-light transition-colors">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/70 leading-relaxed font-body">{inc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <a
                  href="https://zenklub.com.br/coaches/ciro-moraes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-[1.5rem] bg-white text-olcan-navy px-10 font-bold uppercase tracking-widest text-sm transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-100 shadow-glass w-full sm:w-auto"
                >
                  Agendar minha mentoria agora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 opacity-40 border-t border-white/5">
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest">vagas limitadas por mês</p>
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest">Reembolso integral se não houver valor percebido</p>
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest">Sessão em português</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SocialProof = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-32 border-t border-olcan-navy/5", className)}>
      <div className="container-site">
        <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight text-center mb-24 leading-tight">
          O que dizem quem passou<br />
          <span className="italic font-light text-brand-blue">pelo processo.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Testimonial 1 - Mari U */}
          <div className="card-olcan p-12 bg-white/60 border-transparent shadow-glass">
            <p className="text-lg text-olcan-navy font-medium leading-relaxed mb-10 font-body">
              "Pensar no curso é pensar em um mundo cheio de possibilidades, ele me permitiu sonhar de novo. Aprendi muito ao longo das aulas, desde os documentos necessários, como escrevê-los, como a banca avalia... é um curso excelente, ele renova as esperanças e te ensina a como conquistar os seus objetivos a curto, médio e longo prazo."
            </p>
            <div className="flex items-center gap-5 pt-8 border-t border-olcan-navy/10">
              <div className="w-16 h-16 rounded-full bg-olcan-navy/5 flex items-center justify-center text-olcan-navy">
                <User className="w-8 h-8 opacity-20" />
              </div>
              <div>
                 <p className="font-display text-lg text-olcan-navy font-bold">Mari U</p>
                 <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">
                   Aluna do Curso
                 </p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 - Jessica F */}
          <div className="card-olcan p-12 bg-white/60 border-transparent shadow-glass">
            <p className="text-lg text-olcan-navy font-medium leading-relaxed mb-10 font-body">
              "O curso foi uma experiência incrível e enriquecedora para mim. Ciro mapeou de maneira clara as possibilidades e demonstrou de forma simples os caminhos a seguir. O destaque está em compreender como dar o primeiro passo, e o curso oferece essa orientação, mostrando como construir o esqueleto para alcançar nossos objetivos."
            </p>
            <div className="flex items-center gap-5 pt-8 border-t border-olcan-navy/10">
              <div className="w-16 h-16 rounded-full bg-olcan-navy/5 flex items-center justify-center text-olcan-navy">
                <User className="w-8 h-8 opacity-20" />
              </div>
              <div>
                 <p className="font-display text-lg text-olcan-navy font-bold">Jessica F</p>
                 <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">
                   Aluna do Curso
                 </p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 - Hortênsia M */}
          <div className="card-olcan p-12 bg-white/60 border-transparent shadow-glass">
            <p className="text-lg text-olcan-navy font-medium leading-relaxed mb-10 font-body">
              "Participar deste curso foi como abrir uma porta para um universo de novas oportunidades e compreensões. Com o Prof. Ciro no comando, cada aula era uma descoberta, uma chance de ver o mundo sob uma perspectiva renovada, cheia de possibilidades e sonhos realizáveis."
            </p>
            <div className="flex items-center gap-5 pt-8 border-t border-olcan-navy/10">
              <div className="w-16 h-16 rounded-full bg-olcan-navy/5 flex items-center justify-center text-olcan-navy">
                <User className="w-8 h-8 opacity-20" />
              </div>
              <div>
                 <p className="font-display text-lg text-olcan-navy font-bold">Hortênsia M</p>
                 <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">
                   Aluna do Curso
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
