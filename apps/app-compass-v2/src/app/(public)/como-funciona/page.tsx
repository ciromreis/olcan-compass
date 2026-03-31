import { Target, Route, FileEdit, Sparkles, Shield, ArrowRight } from "lucide-react";

export const metadata = { title: "Como Funciona" };

const STEPS = [
  { num: "01", icon: Target, title: "Diagnóstico Inteligente", description: "Responda ao questionário psicológico e financeiro. A IA calibra seu perfil de mobilidade e identifica medos, pontos fortes e gaps reais." },
  { num: "02", icon: Route, title: "Rota Estratégica", description: "Receba um grafo de dependências (DAG) personalizado com milestones, prazos e custos. Veja exatamente o que fazer primeiro." },
  { num: "03", icon: FileEdit, title: "Forge de Documentos", description: "Crie CVs, cartas de motivação e propostas com IA especializada. Receba análise semântica e score de competitividade." },
  { num: "04", icon: Sparkles, title: "Simulador de Entrevista", description: "Pratique com perguntas reais, receba feedback em tempo real sobre clareza, hesitação e confiança projetada." },
  { num: "05", icon: Shield, title: "Marketplace Verificado", description: "Contrate advogados, coaches e tradutores vetados. Pagamento com escrow — só libera quando o serviço é entregue." },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-caption font-heading font-semibold tracking-widest uppercase text-brand-400 mb-3">Passo a passo</p>
          <h1 className="font-heading text-display text-text-primary mb-4">Como o Compass funciona</h1>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">De um diagnóstico de 10 minutos até o embarque — cada fase é calculada, mensurável e financeiramente otimizada.</p>
        </div>
        <div className="space-y-12">
          {STEPS.map((step) => (
            <div key={step.num} className="card-surface p-8 flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <p className="text-caption font-heading font-bold text-brand-400 mb-1">Etapa {step.num}</p>
                <h3 className="font-heading text-h3 text-text-primary mb-2">{step.title}</h3>
                <p className="text-body text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="card-surface p-12 text-center bg-gradient-to-br from-brand-500 to-brand-700 noise-overlay relative overflow-hidden">
          <h2 className="font-heading text-h2 text-white mb-4 relative z-10">Pronto para começar?</h2>
          <a href="/register" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-heading font-bold hover:bg-cream-100 transition-colors shadow-lg">
            Criar Minha Conta <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </>
  );
}
