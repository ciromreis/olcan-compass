import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { Compass, Globe, Users, Award, Heart, Zap, Target, Shield, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre a Olcan',
  description: 'Conheça a Olcan: democratizando o acesso a oportunidades internacionais para brasileiros. Nossa missão, valores e equipe.',
  openGraph: {
    title: 'Sobre a Olcan | Capacitação Internacional',
    description: 'Conheça nossa missão de democratizar oportunidades internacionais para brasileiros.',
  }
};

const values = [
  {
    icon: Heart,
    title: 'Impacto Real',
    description: 'Cada produto que criamos precisa transformar vidas. Não vendemos promessas — entregamos resultados mensuráveis.',
  },
  {
    icon: Shield,
    title: 'Transparência Total',
    description: 'Somos honestos sobre processos, prazos e resultados. Nossos clientes sabem exatamente o que esperar.',
  },
  {
    icon: Users,
    title: 'Comunidade Forte',
    description: 'Acreditamos que ninguém precisa enfrentar a jornada internacional sozinho. A rede é o ativo mais valioso.',
  },
  {
    icon: Zap,
    title: 'Inovação Contínua',
    description: 'Usamos tecnologia e dados para otimizar cada etapa da mobilidade internacional.',
  },
];

const milestones = [
  { year: '2021', title: 'Fundação', description: 'A Olcan nasce da frustração com a falta de informação qualificada sobre mobilidade internacional no Brasil.', icon: Compass },
  { year: '2022', title: 'Primeiro Curso', description: 'Lançamento do Curso Cidadão do Mundo, reunindo centenas de brasileiros em busca da carreira global.', icon: Globe },
  { year: '2023', title: 'Expansão', description: 'Rota da Internacionalização, Kit Application e mentorias individuais se juntam ao portfólio de produtos.', icon: Target },
  { year: '2024', title: 'Tecnologia', description: 'Desenvolvimento do Olcan Compass — plataforma inteligente que mapeia e acelera jornadas internacionais.', icon: Zap },
  { year: '2025', title: 'Ecossistema', description: 'Marketplace de profissionais verificados e sistema de inteligência global Olcan completa o ecossistema.', icon: Users },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-cream noise overflow-hidden">
      <EnhancedNavbar />
      
      {/* Hero */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[140px] -mr-32 -mt-32 pointer-events-none" />
        {/* Fractal pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <Image
            src="/images/fractal_pattern_bg.png"
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
        </div>
        
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-10">
              <Compass className="w-4 h-4 text-olcan-navy" />
              <span className="label-xs text-olcan-navy/60">Nossa Gênese Estratégica</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-8xl text-olcan-navy leading-[0.95] mb-10 tracking-tighter">
              Democratizando <br />
              <span className="italic font-light text-brand-600">oportunidades globais.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-olcan-navy/70 leading-relaxed font-medium max-w-3xl mx-auto">
              A Olcan nasceu para resolver um problema sistêmico: a barreira entre talentos brasileiros 
              e o mercado internacional. Atuamos na arquitetura da sua mobilidade global.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 relative">
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <Target className="w-4 h-4 text-olcan-navy" />
                <span className="label-xs text-olcan-navy/60">Nossa Missão</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
                A educação é o motor da <br />
                <span className="italic font-light text-brand-600 font-serif">transcendência geográfica.</span>
              </h2>
              <div className="space-y-6 text-lg text-olcan-navy/70 font-medium leading-relaxed">
                <p>
                  Todo profissional brasileiro que já quis trabalhar fora sabe a sensação:
                  talento sobra, estratégia falta. A Olcan nasceu para preencher esse espaço —
                  não com promessas de vida fácil no exterior, mas com método real, orientação
                  honesta e uma rede de pessoas que já fizeram a travessia.
                </p>
                <p>
                  Fundada por quem viveu essa frustração na pele, democratizamos o conhecimento
                  que antes só chegava a quem tinha sorte de conhecer a pessoa certa. Aqui,
                  você encontra o mapa que ninguém te deu.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Mission image */}
              <div className="rounded-[2rem] overflow-hidden aspect-video relative shadow-2xl shadow-olcan-navy/10">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                  alt="Profissionais internacionais colaborando"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-olcan-navy/20 to-transparent" />
              </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Metodologia', value: 'Própria' },
                { label: 'Rotas de carreira', value: '4' },
                { label: 'Anos de atuação', value: '4+' },
                { label: 'Cursos lançados', value: '5+' },
              ].map((stat, i) => (
                <div key={i} className="card-olcan p-8 text-center border-white/60">
                  <div className="text-4xl font-bold text-olcan-navy mb-2 tracking-tighter">{stat.value}</div>
                  <div className="label-xs text-olcan-navy/40 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
            </div> {/* end space-y-6 */}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-cream-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-24">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <Zap className="w-4 h-4 text-olcan-navy" />
              <span className="label-xs text-olcan-navy/60">O Percurso</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-olcan-navy tracking-tight italic font-light">
              Nossa Evolução.
            </h2>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Vertical connecting line */}
            <div className="absolute left-12 top-12 bottom-12 w-px bg-olcan-navy/10 hidden md:block" />

            <div className="space-y-10">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                return (
                  <div key={idx} className="flex gap-8 items-start group relative">
                    <div className="flex-shrink-0 w-24 h-24 bg-olcan-navy rounded-[2rem] flex flex-col items-center justify-center shadow-2xl shadow-olcan-navy/20 transform group-hover:scale-110 transition-transform duration-500 relative z-10">
                      <Icon className="w-5 h-5 text-white/60 mb-1" />
                      <span className="text-white font-bold text-lg tracking-tighter">{milestone.year}</span>
                    </div>
                    <div className="flex-1 card-olcan p-8 border-white/60 group-hover:border-brand-300 transition-all duration-500">
                      <h3 className="font-bold text-2xl text-olcan-navy mb-3 tracking-tight italic font-display">{milestone.title}</h3>
                      <p className="text-olcan-navy/60 leading-relaxed font-medium">{milestone.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-24">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <Award className="w-4 h-4 text-olcan-navy" />
              <span className="label-xs text-olcan-navy/60">Princípios Olcan</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-olcan-navy tracking-tight">
              O que nos <span className="italic font-light text-brand-600">orienta.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="card-olcan p-10 border-white/60 hover:border-brand-300 transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-olcan-navy/5 border border-olcan-navy/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-olcan-navy group-hover:text-white transition-all duration-500 text-olcan-navy">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-2xl text-olcan-navy mb-4 tracking-tight italic font-display">{value.title}</h3>
                <p className="text-olcan-navy/60 leading-relaxed font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-32 bg-cream-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <Users className="w-4 h-4 text-olcan-navy" />
                <span className="label-xs text-olcan-navy/60">Fundador & CEO</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl text-olcan-navy leading-[1.1] tracking-tight">
                Conheça <br />
                <span className="italic font-light text-brand-600 font-serif">Ciro Moraes.</span>
              </h2>
              <div className="space-y-6 text-lg text-olcan-navy/70 font-medium leading-relaxed">
                <p>
                  A Olcan nasceu da jornada pessoal de Ciro Moraes — um profissional brasileiro 
                  que enfrentou as barreiras invisíveis do mercado global e decidiu transformar 
                  esse conhecimento em uma plataforma acessível para todos.
                </p>
                <p>
                  De 2018 até hoje, Ciro construiu um ecossistema completo de ferramentas,
                  cursos e mentorias que já ajudaram centenas de profissionais a cruzarem
                  fronteiras com método e estratégia real.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/sobre/ceo" className="btn-primary group">
                  Conhecer a história completa
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://zenklub.com.br/coaches/ciro-moraes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Agendar mentoria
                </a>
              </div>
            </div>
            
            <div className="card-olcan p-10 border-white/60">
              <div className="space-y-8">
                <div className="text-center pb-8 border-b border-olcan-navy/5">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 ring-4 ring-brand-500/20 shadow-xl">
                    <Image
                      src="/images/ciro-origin.jpg"
                      alt="Ciro Moraes"
                      width={96}
                      height={96}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                  <h3 className="font-display text-3xl text-olcan-navy italic mb-2">Ciro Moraes dos Reis</h3>
                  <p className="text-sm text-olcan-navy/50 font-bold uppercase tracking-widest">Fundador & CEO · Olcan</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Anos de atuação", value: "4+" },
                    { label: "Cursos e produtos", value: "8+" },
                    { label: "Países alcançados", value: "30+" },
                    { label: "Rotas de carreira", value: "4" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-olcan-navy/5 last:border-0">
                      <span className="text-sm text-olcan-navy/60 font-medium">{stat.label}</span>
                      <span className="text-2xl font-bold text-olcan-navy tracking-tight">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #001338 0%, #001a4d 50%, #001338 100%)' }}>
            <div className="absolute inset-0 bg-hero-grain opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-display text-4xl md:text-6xl text-white mb-10 tracking-tight leading-[1.1]">
                Sua transição começa com um <br />
                <span className="italic font-light text-[#E5E7EB] font-serif">diagnóstico preciso.</span>
              </h2>
              <p className="text-white/70 text-xl mb-14 font-medium leading-relaxed">
                Descubra em qual estágio da mobilidade internacional você se encontra e receba seu Plano de Carreira Internacional personalizado.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link 
                  href="/diagnostico"
                  className="btn-primary py-6 px-12 text-lg shadow-2xl shadow-brand-500/30 group w-full sm:w-auto"
                >
                  Iniciar Diagnóstico
                  <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link 
                  href="/contato"
                  className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 px-10 py-5 rounded-2xl text-lg font-bold uppercase tracking-widest transition-all duration-500 w-full sm:w-auto"
                >
                  Suporte Especializado
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
