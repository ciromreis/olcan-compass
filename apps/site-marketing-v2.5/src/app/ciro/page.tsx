import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import EnhancedFooter from '@/components/layout/EnhancedFooter';
import { ArrowRight, CheckCircle, Star, Globe, Users, Calendar, Target, MessageCircle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mentoria com Ciro Moraes | Olcan',
  description: 'Mentoria individual com Ciro Moraes, fundador da Olcan. Estratégia personalizada para sua carreira internacional — visto, emprego e vida no exterior.',
  openGraph: {
    title: 'Mentoria com Ciro Moraes | Olcan',
    description: 'Construa sua carreira internacional com quem já trilhou esse caminho. Mentoria 1:1 com Ciro Moraes.',
  },
};

const deliverables = [
  {
    icon: Target,
    title: 'Diagnóstico do seu perfil',
    description: 'Entendemos juntos onde você está, quais são seus pontos fortes e o que precisa ser trabalhado para o mercado internacional.',
  },
  {
    icon: Globe,
    title: 'Roadmap personalizado',
    description: 'Um plano de ação claro, mês a mês, com os passos reais para chegar ao seu destino — seja Portugal, Canadá, Alemanha ou onde for.',
  },
  {
    icon: MessageCircle,
    title: 'Revisão de documentos',
    description: 'Currículo internacional, carta de motivação e LinkedIn revisados diretamente por Ciro para o mercado do seu país-alvo.',
  },
  {
    icon: Users,
    title: 'Rede de contatos',
    description: 'Acesso à comunidade Olcan e, quando cabível, introduções a pessoas-chave nos países e setores do seu interesse.',
  },
  {
    icon: Calendar,
    title: 'Sessões 1:1 semanais',
    description: 'Encontros individuais via Zoom para acompanhar progresso, tirar dúvidas e ajustar a estratégia conforme surgem oportunidades.',
  },
  {
    icon: Shield,
    title: 'Suporte contínuo',
    description: 'Acesso direto por mensagem durante todo o período de mentoria para dúvidas urgentes e orientações rápidas.',
  },
];

const testimonials = [
  {
    name: 'Mariana T.',
    role: 'Engenheira de Software · Berlim, Alemanha',
    content: 'O Ciro me ajudou a entender que eu estava me candidatando do jeito errado. Em 4 meses com ele, consegui 3 entrevistas em startups alemãs e aceitei uma oferta. Ele conhece o processo de dentro.',
    rating: 5,
  },
  {
    name: 'Rafael S.',
    role: 'Gestor de Projetos · Toronto, Canadá',
    content: 'Tentei ir para o Canadá sozinho por 2 anos sem resultado. Com a mentoria do Ciro, em 6 meses tinha meu visto de trabalho aprovado. O diferencial é que ele não dá teoria — dá estratégia.',
    rating: 5,
  },
  {
    name: 'Camila O.',
    role: 'UX Designer · Lisboa, Portugal',
    content: 'Valeu cada centavo. O Ciro revisou meu portfólio, me ensinou como adaptar minha comunicação para o mercado português e me conectou com pessoas que abriram portas que eu não sabia que existiam.',
    rating: 5,
  },
];

export default function CiroPage() {
  return (
    <main className="min-h-screen bg-cream overflow-hidden">
      <EnhancedNavbar />

      {/* Hero */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-500/4 rounded-full blur-[160px] -mr-48 -mt-48 pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-7 space-y-8">
              <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                <span className="label-xs text-olcan-navy/60">Mentoria Individual · Vagas Limitadas</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl text-olcan-navy leading-[0.95] tracking-tight">
                A jornada que o Ciro<br />
                <span className="italic font-light text-brand-600">já fez por você.</span>
              </h1>

              <p className="text-xl text-olcan-navy/70 leading-relaxed font-medium max-w-2xl">
                Não é coaching motivacional. É estratégia real, baseada em erros cometidos,
                lições aprendidas e centenas de profissionais que já cruzaram fronteiras com a Olcan.
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
                <Link href="/diagnostico" className="btn-secondary">
                  Fazer diagnóstico primeiro
                </Link>
              </div>

              <p className="text-sm text-olcan-navy/40 font-medium">
                A partir de R$ 1.997 · Garantia de 7 dias · Vagas abertas para Maio/2026
              </p>
            </div>

            {/* Right: photo + price card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Mentor photo */}
              <div className="rounded-[2.5rem] overflow-hidden aspect-[4/3] relative shadow-2xl shadow-olcan-navy/10">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80"
                  alt="Ciro Moraes — Mentor Internacional"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-olcan-navy/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="liquid-glass px-4 py-2 inline-flex items-center gap-2 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold text-olcan-navy/70 uppercase tracking-widest">Ciro Moraes · Fundador Olcan</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-2xl shadow-olcan-navy/8 p-10 space-y-6">
                <div className="text-center">
                  <div className="label-xs text-olcan-navy/40 mb-2">Investimento</div>
                  <div className="font-display text-5xl text-olcan-navy tracking-tight">R$ 275</div>
                  <div className="text-sm text-olcan-navy/40 mt-1">por sessão de 60 minutos · via Zenklub</div>
                </div>

                <div className="space-y-3">
                  {[
                    '4 sessões 1:1 de 60 min via Zoom',
                    'Revisão de currículo e LinkedIn',
                    'Roadmap personalizado por escrito',
                    'Suporte por mensagem por 30 dias',
                    'Acesso à comunidade Olcan',
                    'Gravações de todas as sessões',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-olcan-navy/70 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://zenklub.com.br/coaches/ciro-moraes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-4 text-center flex items-center justify-center gap-2"
                >
                  Garantir Minha Vaga
                  <ArrowRight className="w-4 h-4" />
                </a>

                <p className="text-center text-xs text-olcan-navy/30">
                  Garantia incondicional de 7 dias
                </p>
              </div>
            </div>  {/* end right column */}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-28 bg-olcan-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-15 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-4xl">
          <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-10">
            <span className="label-xs text-white/50">A história por trás da Olcan</span>
          </div>

          <div className="space-y-8 text-white/80 text-lg leading-relaxed font-medium">
            <p>
              Em 2018, eu era um profissional brasileiro bem-sucedido localmente — e completamente
              invisível para o mercado global. Não sabia como formatar um currículo internacional,
              não entendia o que os recrutadores europeus e norte-americanos queriam ver, e cada
              tentativa parecia cair no vazio. Demorei dois anos para descobrir o que não me
              ensinaram na faculdade nem nas empresas onde trabalhei. Hoje ensino isso em semanas.
            </p>
            <p>
              Sou carioca, filho de família de classe média que nunca imaginou que &ldquo;trabalhar fora&rdquo;
              fosse para ela. Construí minha carreira no Brasil com muito esforço, alcancei posições
              de liderança — e ainda assim senti que havia um teto invisível separando profissionais
              brasileiros das melhores oportunidades do mundo.
            </p>
            <p>
              Quando decidi finalmente cruzar essa fronteira, percebi que o problema não era
              competência. O problema era sistema. Brasileiros excelentes não sabem como comunicar
              seu valor para um mercado que não conhece o contexto do Brasil. Não sabem que tipo de
              visto pedir. Não sabem como construir rede de contatos em países onde a cultura
              profissional é completamente diferente.
            </p>
            <p className="text-white font-semibold text-xl">
              Aprendi tudo na prática — com erros caros, pesquisa exaustiva e ajuda de quem
              já tinha feito a travessia. A Olcan nasceu porque percebi que esse conhecimento
              não podia continuar sendo privilégio de poucos.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-32">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-20">
            <div className="liquid-glass px-5 py-2 inline-flex items-center gap-3 mb-8">
              <Target className="w-4 h-4 text-olcan-navy" />
              <span className="label-xs text-olcan-navy/60">O que você recebe</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-olcan-navy tracking-tight">
              Uma estratégia feita<br />
              <span className="italic font-light text-brand-600">para o seu caso.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deliverables.map((item, idx) => (
              <div key={idx} className="card-olcan p-8 border-white/60 hover:border-brand-300 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-2xl bg-olcan-navy/5 border border-olcan-navy/10 flex items-center justify-center mb-6 group-hover:bg-olcan-navy group-hover:text-white transition-all duration-500 text-olcan-navy">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl text-olcan-navy mb-3 tracking-tight">{item.title}</h3>
                <p className="text-olcan-navy/60 leading-relaxed text-sm font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-cream-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grain opacity-30 mix-blend-multiply pointer-events-none" />

        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-olcan-navy tracking-tight">
              Quem já passou pela mentoria.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="card-olcan p-8 border-white/60">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-500 text-brand-500" />
                  ))}
                </div>
                <p className="text-olcan-navy/70 leading-relaxed mb-6 italic text-sm font-medium">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div>
                  <div className="font-bold text-olcan-navy text-sm">{t.name}</div>
                  <div className="text-xs text-olcan-navy/40 uppercase tracking-wider font-bold mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-5xl">
          <div className="rounded-[3rem] bg-olcan-navy p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-grain opacity-15 mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-6xl text-white mb-8 tracking-tight leading-tight">
                Pronto para sair<br />
                <span className="italic font-light text-[#E5E7EB]">do Brasil?</span>
              </h2>
              <p className="text-white/70 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                Vagas limitadas por trimestre. Se você está comprometido com sua internacionalização,
                esse é o momento de agir.
              </p>
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
              <p className="text-white/30 text-sm mt-8">
                R$ 275 por sessão · Disponibilidade via Zenklub
              </p>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </main>
  );
}
