import { Brain, Target, BarChart3, ArrowRight, Clock, Shield } from "lucide-react";

export const metadata = { title: "Avaliação Gratuita" };

export default function AssessmentTeaserPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-4">Descubra seu Score de Certeza</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Em menos de 10 minutos, o diagnóstico psicológico e financeiro revela onde você está, o que está impedindo você, e qual é o próximo passo ideal.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card-surface p-6 text-center">
          <Clock className="w-6 h-6 text-brand-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary mb-1">10 minutos</h3>
          <p className="text-body-sm text-text-secondary">Questionário rápido e direto, sem enrolação</p>
        </div>
        <div className="card-surface p-6 text-center">
          <BarChart3 className="w-6 h-6 text-clay-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary mb-1">8 dimensões</h3>
          <p className="text-body-sm text-text-secondary">Confiança, risco, disciplina, ansiedade e mais</p>
        </div>
        <div className="card-surface p-6 text-center">
          <Shield className="w-6 h-6 text-sage-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary mb-1">100% privado</h3>
          <p className="text-body-sm text-text-secondary">Seus dados são criptografados e nunca compartilhados</p>
        </div>
      </div>
      <div className="card-surface p-8 bg-gradient-to-r from-cream-200 to-cream-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="font-heading text-h3 text-text-primary mb-2">O que você recebe</h2>
            <ul className="space-y-2 text-body text-text-secondary">
              <li className="flex items-start gap-2"><Target className="w-4 h-4 text-brand-500 mt-1 flex-shrink-0" />Score de Certeza personalizado (0–100)</li>
              <li className="flex items-start gap-2"><Target className="w-4 h-4 text-brand-500 mt-1 flex-shrink-0" />Mapa de medos e bloqueios identificados</li>
              <li className="flex items-start gap-2"><Target className="w-4 h-4 text-brand-500 mt-1 flex-shrink-0" />Custo de Inação diário calculado (R$/dia)</li>
              <li className="flex items-start gap-2"><Target className="w-4 h-4 text-brand-500 mt-1 flex-shrink-0" />Recomendação de rota com base no seu perfil</li>
            </ul>
          </div>
          <a href="/register" className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 text-white font-heading font-bold hover:bg-brand-600 transition-colors shadow-md">
            Começar Avaliação <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
