import { ArrowRight, Shield, Brain, Map, Sparkles, FileText, Mic, Target, CheckCircle, Star } from "lucide-react";

const VALUE_PROPS = [
  { icon: Brain, title: "Diagnóstico Inteligente", description: "Avaliação psicológica e financeira que calibra sua jornada automaticamente." },
  { icon: Map, title: "Rotas Estratégicas", description: "Grafos dinâmicos que recalculam seu caminho com base em mudanças reais do mercado." },
  { icon: Sparkles, title: "IA Especializada", description: "Documentos, entrevistas e narrativas otimizados por IA treinada em padrões internacionais." },
  { icon: Shield, title: "Marketplace Verificado", description: "Advogados, tradutores e coaches vetados — contrate com escrow seguro." },
];

const STEPS = [
  { number: "01", icon: Brain, title: "Diagnóstico", description: "Complete o perfil psicológico em 10 minutos e receba seu Score de Certeza." },
  { number: "02", icon: Map, title: "Rota", description: "Receba rotas personalizadas com milestones, prazos e orçamento detalhado." },
  { number: "03", icon: FileText, title: "Documentos", description: "Use o Forge para criar cartas, CVs e narrativas com análise de IA." },
  { number: "04", icon: Mic, title: "Preparação", description: "Treine com simulador de entrevistas e acompanhe sua evolução." },
  { number: "05", icon: Target, title: "Execução", description: "Sprints de prontidão, marketplace de profissionais e acompanhamento até o desembarque." },
];

const PLANS = [
  { id: "free", name: "Explorador", price: "Grátis", period: "", highlight: false, features: ["Diagnóstico psicológico básico", "1 rota ativa", "Marketplace (visualizar)", "Suporte por e-mail"] },
  { id: "pro", name: "Navegador", price: "R$ 79", period: "/mês", highlight: true, features: ["Diagnóstico completo (8 dimensões)", "3 rotas ativas", "Forge com IA ilimitada", "Simulador de entrevistas", "Marketplace (contratar)", "Suporte prioritário"] },
  { id: "premium", name: "Comandante", price: "R$ 149", period: "/mês", highlight: false, features: ["Tudo do Navegador", "Rotas ilimitadas", "Coach IA dedicado", "Análise de competitividade", "Sprints personalizados", "Suporte 1:1"] },
];

const TESTIMONIALS = [
  { name: "Carla M.", country: "Berlim, DE", text: "O Compass me deu clareza que eu não tinha depois de meses pesquisando sozinha. Meu visto saiu em 3 meses.", rating: 5 },
  { name: "Rafael S.", country: "Dublin, IE", text: "O simulador de entrevistas foi decisivo. Recebi 2 ofertas de emprego na Irlanda em 6 semanas.", rating: 5 },
  { name: "Ana Paula T.", country: "Lisboa, PT", text: "O marketplace me conectou com uma advogada excelente. Escrow me deu segurança total.", rating: 5 },
];

const STATS = [
  { value: "2.400+", label: "Jornadas iniciadas" },
  { value: "18", label: "Países cobertos" },
  { value: "94%", label: "Taxa de satisfação" },
  { value: "R$ 47/dia", label: "Custo de Inação médio" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Public Nav */}
      <header className="sticky top-0 z-50 glass-panel border-b border-cream-400/60 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-h4 font-bold text-brand-500">Olcan Compass</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-body-sm font-medium text-text-secondary hover:text-brand-500 transition-colors">Como funciona</a>
            <a href="#precos" className="text-body-sm font-medium text-text-secondary hover:text-brand-500 transition-colors">Preços</a>
            <a href="#depoimentos" className="text-body-sm font-medium text-text-secondary hover:text-brand-500 transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-body-sm font-medium text-text-secondary hover:text-brand-500 transition-colors">Entrar</a>
            <a href="/register" className="btn-liquid text-body-sm font-medium px-4 py-2 rounded-lg text-white transition-all">Começar Agora</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden noise-overlay">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-4">Mobilidade Global como Serviço</p>
            <h1 className="font-heading text-display text-text-primary text-balance mb-6">
              Sua mudança internacional,{" "}
              <em className="text-emphasis text-brand-500 not-italic">calculada com precisão</em>
            </h1>
            <p className="text-body-lg text-text-secondary max-w-2xl mb-10">
              O Olcan Compass transforma a complexidade da emigração em um plano de ação claro, personalizado e financeiramente otimizado. Do diagnóstico ao desembarque.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/register" className="btn-liquid inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-heading font-semibold text-body transition-all shadow-lg">
                Começar Minha Jornada <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#como-funciona" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cream-400/60 bg-white/80 backdrop-blur-sm text-text-secondary font-heading font-medium text-body hover:bg-white hover:border-cream-500 transition-all shadow-sm">
                Como Funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-cream-400 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-h2 text-brand-500">{stat.value}</p>
                <p className="text-caption text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section id="como-funciona" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-text-primary mb-4">
              Tudo que você precisa,{" "}
              <em className="text-emphasis text-clay-500 not-italic">em um só lugar</em>
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Cinco verticais integradas que cobrem desde o diagnóstico psicológico até a compra do chip eSIM no desembarque.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="card-surface p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-transform">
                <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <prop.icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-heading text-h4 text-text-primary">{prop.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Steps */}
      <section className="py-20 md:py-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-text-primary mb-4">5 passos para sua mudança</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Da decisão ao desembarque, o Compass guia você em cada etapa.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-cream-400" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-cream-300 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <step.icon className="w-7 h-7 text-brand-500" />
                </div>
                <span className="text-caption font-heading font-bold text-brand-400">{step.number}</span>
                <h3 className="font-heading text-h4 text-text-primary mt-1">{step.title}</h3>
                <p className="text-caption text-text-secondary mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="precos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-text-primary mb-4">Planos que cabem na sua jornada</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Comece grátis. Escale quando estiver pronto.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`card-surface p-6 flex flex-col ${plan.highlight ? "ring-2 ring-brand-500 relative" : ""}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-caption px-3 py-0.5 rounded-full bg-brand-500 text-white font-medium">Mais popular</span>
                )}
                <h3 className="font-heading text-h3 text-text-primary">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="font-heading text-h1 text-brand-500">{plan.price}</span>
                  {plan.period && <span className="text-body text-text-muted">{plan.period}</span>}
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-body-sm text-text-secondary flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="/register" className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-heading font-semibold text-body-sm transition-all ${plan.highlight ? "btn-liquid text-white" : "border border-brand-500 bg-white/80 backdrop-blur-sm text-brand-500 hover:bg-white hover:border-brand-600"}`}>
                  {plan.price === "Grátis" ? "Começar Grátis" : "Assinar"} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 md:py-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-text-primary mb-4">Quem já embarcou</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Histórias reais de quem transformou a incerteza em conquista.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-surface p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-clay-500 fill-current" />
                  ))}
                </div>
                <p className="text-body-sm text-text-secondary mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-heading font-bold text-caption">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-caption text-text-muted">{t.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card-surface p-12 md:p-16 text-center noise-overlay relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
            <h2 className="font-heading text-h2 text-white mb-4 relative z-10">Pronto para dar o primeiro passo?</h2>
            <p className="text-body-lg text-brand-100 max-w-xl mx-auto mb-8 relative z-10">
              Comece com o diagnóstico gratuito e descubra seu Score de Certeza em menos de 10 minutos.
            </p>
            <a href="/register" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-heading font-bold text-body hover:bg-cream-100 transition-colors shadow-lg">
              Criar Minha Conta <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-heading font-bold text-brand-500 mb-3">Olcan Compass</p>
              <p className="text-caption text-text-muted">Mobilidade global como serviço. Do diagnóstico ao desembarque.</p>
            </div>
            <div>
              <p className="font-heading font-semibold text-text-primary text-body-sm mb-3">Produto</p>
              <div className="space-y-2">
                <a href="#como-funciona" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Como funciona</a>
                <a href="#precos" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Preços</a>
                <a href="/register" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Criar conta</a>
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-text-primary text-body-sm mb-3">Recursos</p>
              <div className="space-y-2">
                <a href="/sobre" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Sobre</a>
                <a href="#depoimentos" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Depoimentos</a>
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-text-primary text-body-sm mb-3">Legal</p>
              <div className="space-y-2">
                <a href="/termos" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Termos de Uso</a>
                <a href="/privacidade" className="block text-caption text-text-muted hover:text-brand-500 transition-colors">Privacidade</a>
              </div>
            </div>
          </div>
          <div className="border-t border-cream-300 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-caption text-text-muted">&copy; {new Date().getFullYear()} Olcan. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
