import { Metadata } from 'next';
import Link from 'next/link';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { ArrowRight, Globe, Award, BookOpen, Users, Calendar, Compass, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ciro Moraes | CEO & Fundador | Olcan',
  description: 'Conheça Ciro Moraes dos Reis, fundador da Olcan. Especialista em internacionalização e desenvolvimento profissional. Agende uma mentoria.',
  openGraph: {
    title: 'Ciro Moraes — Fundador da Olcan',
    description: 'A história por trás da Olcan e o especialista que guia profissionais brasileiros rumo ao mercado global.',
  },
};

const trajectory = [
  {
    period: "2018 — A Travessia",
    title: "A descoberta do gap",
    description: "Profissional brasileiro de sucesso local, completamente invisível para o mercado global. Dois anos de tentativas, aprendizados caros e pesquisa exaustiva resultaram em uma percepção clara: o problema não é competência. É sistema.",
  },
  {
    period: "2019 — A Olcan",
    title: "Fundação da Olcan",
    description: "Nasceu um projeto simples: compartilhar o conhecimento que custou tanto para adquirir. OLCAN DESENVOLVIMENTO PROFISSIONAL E INOVADOR LTDA é fundada em São Paulo com CNAE de treinamento em desenvolvimento profissional e gerencial.",
  },
  {
    period: "2021–2024 — O Ecossistema",
    title: "Cursos, ferramentas e plataforma",
    description: "Lançamento do Sem Fronteiras, do Kit Application, do Rota da Internacionalização e da plataforma Olcan Compass — o sistema inteligente de mapeamento de jornadas internacionais.",
  },
  {
    period: "Hoje",
    title: "500+ profissionais, 30+ países",
    description: "Uma comunidade de brasileiros que cruzaram fronteiras com método real, sem rede de contatos privilegiada e sem orientador famoso — apenas estratégia e comprometimento.",
  },
];

const values = [
  {
    icon: Globe,
    title: "Internacionalização é direito",
    description: "O conhecimento que abre fronteiras não pode ser privilégio de quem já tem conexões. A Olcan existe para democratizar esse acesso.",
  },
  {
    icon: Award,
    title: "Método acima de motivação",
    description: "Não vendemos inspiração. Entregamos ferramentas, estratégias e acompanhamento — o que realmente funciona no mercado global.",
  },
  {
    icon: BookOpen,
    title: "Transparência radical",
    description: "Emigrar é difícil. Os processos burocráticos são reais. A Olcan é honesta sobre isso — e te equipa para enfrentar tudo com clareza.",
  },
];

export default function CeoPage() {
  return (
    <main className="min-h-screen bg-cream overflow-hidden">
      <EnhancedNavbar />

      {/* Hero */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/4 rounded-full blur-[160px] -mr-48 -mt-48 pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-8 space-y-8">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <Compass className="w-4 h-4 text-brand-600" />
                <span className="label-xs text-olcan-navy/60">Fundador & CEO · Olcan</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[0.95] tracking-tight">
                Ciro Moraes<br />
                <span className="italic font-light text-brand-600">dos Reis.</span>
              </h1>

              <p className="text-xl text-olcan-navy/70 leading-relaxed font-medium max-w-2xl">
                A Olcan nasceu da minha própria jornada de querer atravessar fronteiras — 
                e perceber que a maioria das pessoas não sabe por onde começar. Não porque 
                falta talento, mas porque falta sistema.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://zenklub.com.br/coaches/ciro-moraes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary group"
                >
                  Agendar Mentoria com Ciro
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link href="/marketplace" className="btn-secondary">
                  Ver os produtos
                </Link>
              </div>

              <p className="text-sm text-olcan-navy/40 font-medium">
                R$ 275 por sessão via Zenklub · Disponibilidade limitada
              </p>
            </div>

            {/* Right: company card */}
            <div className="lg:col-span-4">
              <div className="card-olcan p-8 border-white/60 space-y-6">
                <div className="label-xs text-brand-600 mb-2">Dados da Empresa</div>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-bold text-olcan-navy text-xs uppercase tracking-widest mb-1">Razão Social</div>
                    <div className="text-olcan-navy/70 font-medium">Olcan Desenvolvimento Profissional e Inovador Ltda</div>
                  </div>
                  <div>
                    <div className="font-bold text-olcan-navy text-xs uppercase tracking-widest mb-1">Fundação</div>
                    <div className="text-olcan-navy/70 font-medium">Fevereiro de 2019</div>
                  </div>
                  <div>
                    <div className="font-bold text-olcan-navy text-xs uppercase tracking-widest mb-1">Atividade Principal</div>
                    <div className="text-olcan-navy/70 font-medium">Treinamento em desenvolvimento profissional e gerencial</div>
                  </div>
                  <div>
                    <div className="font-bold text-olcan-navy text-xs uppercase tracking-widest mb-1">Sede</div>
                    <div className="text-olcan-navy/70 font-medium">Av. Paulista, 1636 · São Paulo, SP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story — dark section */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)" }}>
        <div className="absolute inset-0 bg-hero-grain opacity-15 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-4xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 mb-10">
            <span className="label-xs text-white/50">A origem</span>
          </div>

          <div className="space-y-8 text-white/80 text-lg leading-relaxed font-medium">
            <p>
              Em 2018, eu era um profissional brasileiro bem-sucedido localmente — e completamente
              invisível para o mercado global. Não sabia como formatar um currículo internacional,
              não entendia o que os recrutadores europeus e norte-americanos queriam ver, e cada
              tentativa parecia cair no vazio.
            </p>
            <p>
              Demorei dois anos para descobrir o que não me ensinaram na faculdade nem nas empresas 
              onde trabalhei. Brasileiros excelentes não sabem como comunicar seu valor para um 
              mercado que não conhece o contexto do Brasil. Não sabem que tipo de visto pedir. 
              Não sabem como construir rede de contatos em países onde a cultura profissional é 
              completamente diferente.
            </p>
            <p className="text-white font-semibold text-xl">
              Aprendi tudo na prática — com erros caros, pesquisa exaustiva e ajuda de quem
              já tinha feito a travessia. A Olcan nasceu porque esse conhecimento
              não podia continuar sendo privilégio de poucos.
            </p>
          </div>
        </div>
      </section>

      {/* Trajectory Timeline */}
      <section className="py-32 relative">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-20">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <Briefcase className="w-4 h-4 text-olcan-navy" />
              <span className="label-xs text-olcan-navy/60">Trajetória</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-olcan-navy tracking-tight">
              De onde veio, <span className="italic font-light text-brand-600">onde chegou.</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-10">
            {trajectory.map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start group">
                <div className="flex-shrink-0 w-32 text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600 leading-tight">
                    {item.period}
                  </span>
                </div>
                <div className="flex-shrink-0 w-px bg-olcan-navy/10 self-stretch relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />
                </div>
                <div className="flex-1 pb-10">
                  <div className="card-olcan p-8 border-white/60 group-hover:border-brand-300 transition-all duration-500">
                    <h3 className="font-display text-2xl text-olcan-navy italic mb-3">{item.title}</h3>
                    <p className="text-olcan-navy/60 leading-relaxed font-medium">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-cream-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight">
              O que orienta <span className="italic font-light text-brand-600">cada decisão.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => (
              <div key={idx} className="card-olcan p-10 border-white/60 hover:border-brand-300 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl bg-olcan-navy/5 border border-olcan-navy/10 flex items-center justify-center mb-8 group-hover:bg-olcan-navy group-hover:text-white transition-all duration-500 text-olcan-navy">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-olcan-navy mb-4 tracking-tight italic font-display">{v.title}</h3>
                <p className="text-olcan-navy/60 leading-relaxed font-medium text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentoria CTA */}
      <section className="py-32">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-5xl">
          <div className="rounded-[3rem] bg-olcan-navy p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-grain opacity-15 mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 mb-10">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span className="label-xs text-white/50">Vagas limitadas por trimestre</span>
              </div>

              <h2 className="font-display text-4xl md:text-6xl text-white mb-8 tracking-tight leading-tight">
                Pronto para sua<br />
                <span className="italic font-light text-brand-400">jornada global?</span>
              </h2>
              <p className="text-white/70 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                Uma sessão de mentoria com Ciro pode clarear o caminho que parecia impossível. 
                Estratégia real, sem fórmulas genéricas.
              </p>

              {/* Pricing card */}
              <div className="inline-flex flex-col items-center bg-white/10 border border-white/20 rounded-3xl px-10 py-6 mb-10">
                <div className="label-xs text-white/40 mb-1">Investimento</div>
                <div className="font-display text-4xl text-white font-bold">R$ 275</div>
                <div className="text-white/50 text-sm mt-1">por sessão de 60 minutos · via Zenklub</div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a
                  href="https://zenklub.com.br/coaches/ciro-moraes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-5 px-10 text-lg group w-full sm:w-auto"
                >
                  Agendar Mentoria com Ciro
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/diagnostico"
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-2xl text-base font-bold uppercase tracking-widest transition-all duration-500 w-full sm:w-auto"
                >
                  Fazer Diagnóstico Gratuito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
