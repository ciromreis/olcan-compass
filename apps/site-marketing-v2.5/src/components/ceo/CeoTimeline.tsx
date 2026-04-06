import React from 'react';
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
  Navigation 
} from 'lucide-react';

export const CeoTimeline = ({ className }: { className?: string }) => {
  const items = [
    {
      year: "2010–2013",
      role: "Coordenador — AIESEC Salvador",
      location: "Salvador, Brasil + Iași, Romênia + Buenos Aires, Argentina",
      icon: <Globe className="w-5 h-5" />,
      copy: "Primeiro contato com liderança intercultural. Gerenciou voluntários em ONGs, coordenou intercâmbios internacionais e viveu experiências de campo na Romênia e na Argentina — antes de qualquer título formal.",
      tag: "Liderança · Cooperação Internacional"
    },
    {
      year: "2013",
      role: "Research Assistant — Woodrow Wilson Center",
      location: "Washington D.C., EUA",
      icon: <BookOpen className="w-5 h-5" />,
      copy: "Participou do Prudential Foundation Global Citizens Program e colaborou em pesquisa sobre direitos das mulheres. Primeiro contato com o ecossistema de think tanks de Washington.",
      tag: "Pesquisa de Políticas Públicas"
    },
    {
      year: "2014",
      role: "Programa de Fortalecimento do Serviço Civil — Fundação Botín",
      location: "EUA + Espanha + Brasil (Brown, Salamanca, FGV)",
      icon: <GraduationCap className="w-5 h-5" />,
      copy: "Selecionado para programa competitivo de formação de líderes do setor público na América Latina. Passou por Brown University, Universidade de Salamanca e FGV em sequência.",
      tag: "Liderança Pública · América Latina"
    },
    {
      year: "2014",
      role: "Estágio — Defensoria Pública da União",
      location: "Brasil",
      icon: <Scale className="w-5 h-5" />,
      copy: "Atuou na defesa jurídica de cidadãos de baixa renda em previdência social e direitos humanos. A base que ancora toda a atuação posterior em impacto social.",
      tag: "Direito · Impacto Social"
    },
    {
      year: "2016",
      role: "Trainee de Gestão Pública — Vetor Brasil",
      location: "Cuiabá, Brasil",
      icon: <BarChart3 className="w-5 h-5" />,
      copy: "Implementou melhorias no setor público local. Desenvolveu estratégias baseadas em dados, negociou com lideranças sindicais e trabalhou com gestão de recursos humanos no setor público.",
      tag: "Gestão Pública · Inovação"
    },
    {
      year: "2016–2017",
      role: "MSc Políticas Públicas e Gestão — London School of Economics",
      location: "Londres, Reino Unido",
      icon: <School className="w-5 h-5" />,
      copy: "Bolsa Chevening — o programa de bolsas mais competitivo do governo britânico. Focou em governança democrática e políticas baseadas em evidências. Um dos menos de 1.500 Chevening Scholars selecionados globalmente naquele ano.",
      tag: "Chevening Scholar · LSE"
    },
    {
      year: "2019–2020",
      role: "Analista de Projetos — Fundação Lemann",
      location: "São Paulo, Brasil",
      icon: <Projector className="w-5 h-5" />,
      copy: "Gerenciou projetos de impacto na educação brasileira. Coordenou equipes multidisciplinares, elaborou propostas de captação e monitorou indicadores de impacto em parceria com governo e ONGs.",
      tag: "Educação · Gestão de Projetos"
    },
    {
      year: "2020–2021",
      role: "Analista de Governança Local — Transparência Internacional Brasil",
      location: "São Paulo, Brasil",
      icon: <Search className="w-5 h-5" />,
      copy: "Desenvolveu e implementou políticas de transparência anticorrupção em nível municipal. Conduziu pesquisas, workshops e publicações que influenciaram práticas de governança em todo o país.",
      tag: "Anticorrupção · Governança"
    },
    {
      year: "2021–2024",
      role: "Outreach and Partnerships Manager — TikTok",
      location: "São Paulo, Brasil",
      icon: <Smartphone className="w-5 h-5" />,
      copy: "Liderou estratégias de segurança digital e combate à desinformação durante as eleições brasileiras de 2022 — em escala de bilhões de usuários. Construiu parcerias com universidades, organizações da sociedade civil e agências de fact-checking.",
      tag: "Segurança Digital · Parcerias Estratégicas"
    },
    {
      year: "2024–presente",
      role: "Coordenador do CCA — Transparência Internacional Brasil",
      location: "São Paulo, Brasil",
      icon: <Globe className="w-5 h-5" />,
      copy: "Dirige o Centro de Contabilidade e Accountability, liderando a RedeGOV — rede de organizações anticorrupção em países lusófonos. Desenvolve estruturas de governança e materiais de advocacy.",
      tag: "Liderança · Impacto Internacional"
    },
    {
      year: "2026",
      role: "Fundador & CEO — Olcan",
      location: "Brasil → Mundo",
      icon: <Navigation className="w-5 h-5" />,
      copy: "Canaliza décadas de travessia internacional em um produto: o Compass. Uma plataforma que traduz a experiência vivida em sistema navegável para profissionais do Sul Global.",
      tag: "Empreendedor · Produto · Mentoria"
    }
  ];

  return (
    <section className={cn("py-32 relative overflow-hidden", className)}>
      <div className="container-site max-w-5xl mx-auto px-6">
        <div className="text-center mb-24 animate-fade-up">
          <h2 className="font-display text-5xl md:text-6xl text-olcan-navy tracking-tight">
            Uma trajetória construída <span className="italic font-light text-brand-blue">entre continentes.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Centered line for Desktop, hidden on Mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-olcan-navy/10 -translate-x-1/2" />
          
          <div className="space-y-20">
            {items.map((item, idx) => (
              <div key={idx} className={cn(
                "relative flex flex-col md:flex-row gap-8 items-center",
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}>
                {/* Desktop layout: Side text */}
                <div className="flex-1 w-full md:text-right hidden md:block">
                  {idx % 2 === 0 ? (
                    <div className="space-y-2">
                       <span className="text-xs font-bold uppercase tracking-widest text-[#C08A3C]">
                        {item.year}
                      </span>
                      <p className="text-xs font-medium text-olcan-navy/40 uppercase tracking-widest">
                        {item.location}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Central Icon */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-olcan-navy text-white flex items-center justify-center shadow-glass ring-8 ring-[#FAF9F6] shrink-0">
                  {item.icon}
                </div>

                {/* Content Card */}
                <div className="flex-1 w-full">
                  <div className={cn(
                    "card-olcan p-8 border-transparent hover:border-brand-blue/10 bg-white/60",
                    idx % 2 === 0 ? "md:text-left" : "md:text-left" // Always left for the content inside card
                  )}>
                    {/* Mobile year info */}
                    <div className="md:hidden flex flex-col mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#C08A3C]">
                        {item.year}
                      </span>
                      <p className="text-[10px] font-medium text-olcan-navy/40 uppercase tracking-widest">
                        {item.location}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="inline-block self-start px-3 py-1 rounded-full bg-olcan-navy/5 text-[10px] font-bold text-olcan-navy uppercase tracking-widest">
                        {item.tag}
                      </span>
                      <h3 className="font-display text-2xl text-olcan-navy italic">{item.role}</h3>
                      <p className="text-sm font-medium text-olcan-navy/60 leading-relaxed font-body">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop layout: Side text (opposite side) */}
                <div className="flex-1 w-full md:text-left hidden md:block">
                  {idx % 2 !== 0 ? (
                    <div className="space-y-2">
                       <span className="text-xs font-bold uppercase tracking-widest text-[#C08A3C]">
                        {item.year}
                      </span>
                      <p className="text-xs font-medium text-olcan-navy/40 uppercase tracking-widest">
                        {item.location}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
