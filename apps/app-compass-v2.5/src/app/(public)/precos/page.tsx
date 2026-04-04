import { Check, X, ArrowRight, Sparkles } from "lucide-react";

export const metadata = { title: "Preços" };

const PLANS = [
  {
    name: "Lite", price: "Grátis", period: "", description: "Para quem está começando a explorar", color: "cream",
    features: [
      { text: "Diagnóstico psicológico completo", included: true },
      { text: "1 rota ativa", included: true },
      { text: "Score de Certeza básico", included: true },
      { text: "Custo de Inação (COI)", included: true },
      { text: "Forge de Documentos (1 doc)", included: true },
      { text: "Simulador de Entrevista", included: false },
      { text: "Marketplace com escrow", included: false },
      { text: "IA avançada (Gemini Pro)", included: false },
    ],
  },
  {
    name: "Core", price: "R$ 49", period: "/mês", description: "Para quem decidiu ir e precisa de plano", color: "moss", popular: true,
    features: [
      { text: "Tudo do Lite +", included: true },
      { text: "3 rotas ativas simultâneas", included: true },
      { text: "Forge ilimitado com IA", included: true },
      { text: "Simulador de Entrevista (5/mês)", included: true },
      { text: "Sprints de Prontidão", included: true },
      { text: "Marketplace com escrow", included: true },
      { text: "Score de Prontidão avançado", included: true },
      { text: "Suporte prioritário", included: false },
    ],
  },
  {
    name: "Pro", price: "R$ 129", period: "/mês", description: "Para quem quer máxima velocidade e suporte", color: "clay",
    features: [
      { text: "Tudo do Core +", included: true },
      { text: "Rotas ilimitadas", included: true },
      { text: "Simulador ilimitado + análise de voz", included: true },
      { text: "IA Gemini Pro (análise avançada)", included: true },
      { text: "Coach Mode no Forge", included: true },
      { text: "Cenários de simulação financeira", included: true },
      { text: "Suporte prioritário 24h", included: true },
      { text: "Supply Drop (e-commerce)", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-3">Planos e Preços</p>
        <h1 className="font-heading text-display text-text-primary mb-4">Invista no seu futuro</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Cada real investido no Compass economiza semanas de pesquisa, erros de documentação e oportunidades perdidas.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`card-surface p-8 flex flex-col relative ${plan.popular ? "ring-2 ring-brand-500" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-white text-caption font-heading font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Mais Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="font-heading text-h3 text-text-primary">{plan.name}</h3>
              <p className="text-body-sm text-text-secondary mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-display text-text-primary">{plan.price}</span>
                {plan.period && <span className="text-body text-text-muted">{plan.period}</span>}
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-body-sm">
                  {f.included ? <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" /> : <X className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />}
                  <span className={f.included ? "text-text-primary" : "text-text-muted"}>{f.text}</span>
                </li>
              ))}
            </ul>
            <a href="/register" className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-semibold transition-colors ${
              plan.popular ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-cream-500 text-text-primary hover:bg-cream-200"
            }`}>
              Começar com {plan.name} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <p className="text-body text-text-secondary">Precisa de um plano institucional? <a href="/institucional" className="text-brand-500 font-medium hover:underline">Fale conosco →</a></p>
      </div>
    </section>
  );
}
