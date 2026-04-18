import { Briefcase, DollarSign, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";

export const metadata = { title: "Para Profissionais" };

const BENEFITS = [
  { icon: Users, title: "Clientes qualificados", description: "Receba leads de pessoas que já sabem exatamente o que precisam — sem cold calls." },
  { icon: Shield, title: "Pagamento garantido", description: "Sistema de garantia protege seu tempo. O cliente paga antes, você recebe quando entrega." },
  { icon: TrendingUp, title: "PEI — Índice de Efetividade", description: "Sua reputação cresce com base em resultados reais mensurados pela plataforma." },
  { icon: DollarSign, title: "Sem mensalidade", description: "Você só paga comissão quando fecha um serviço. Zero custo fixo." },
];

export default function ProviderLandingPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="w-14 h-14 rounded-2xl bg-clay-50 flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-7 h-7 text-clay-500" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-4">Ofereça seus serviços no Compass</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Advogados, tradutores, coaches e especialistas em relocation: conecte-se a milhares de brasileiros prontos para contratar.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card-surface p-6 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-lg bg-clay-50 flex items-center justify-center flex-shrink-0">
              <b.icon className="w-5 h-5 text-clay-500" />
            </div>
            <div>
              <h3 className="font-heading text-h4 text-text-primary mb-1">{b.title}</h3>
              <p className="text-body-sm text-text-secondary">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-10 bg-gradient-to-br from-clay-500 to-clay-700 text-center noise-overlay relative overflow-hidden">
        <h2 className="font-heading text-h2 text-white mb-3 relative z-10">Comece a receber clientes hoje</h2>
        <p className="text-body-lg text-clay-100 max-w-xl mx-auto mb-8 relative z-10">Cadastro gratuito, perfil verificado e primeiro cliente em menos de uma semana.</p>
        <a href="/register/provider" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-clay-600 font-heading font-bold hover:bg-cream-100 transition-colors shadow-lg">
          Criar Perfil de Profissional <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
