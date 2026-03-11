import { Brain, Clock, Shield, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Diagnóstico Psicológico" };

export default function PsychIntroPage() {
  return (
    <div className="space-y-8">
      <div className="card-surface p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="font-heading text-h1 text-text-primary mb-3">Vamos calibrar sua bússola</h1>
        <p className="text-body-lg text-text-secondary max-w-lg mx-auto mb-8">
          Em 8 blocos rápidos, vamos mapear confiança, tolerância a risco, disciplina, padrões de decisão, ansiedade, clareza de objetivos e estresse financeiro.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-body-sm text-text-secondary">
            <Clock className="w-4 h-4 text-brand-500" /> ~10 minutos
          </div>
          <div className="flex items-center gap-2 text-body-sm text-text-secondary">
            <Shield className="w-4 h-4 text-brand-500" /> 100% confidencial
          </div>
          <div className="flex items-center gap-2 text-body-sm text-text-secondary">
            <Sparkles className="w-4 h-4 text-brand-500" /> Análise por IA
          </div>
        </div>
        <Link href="/profile/psych/calibration" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 text-white font-heading font-bold hover:bg-brand-600 transition-colors shadow-md">
          Começar Diagnóstico <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="card-surface p-6 bg-cream-100">
        <h3 className="font-heading text-h4 text-text-primary mb-2">O que acontece depois?</h3>
        <p className="text-body-sm text-text-secondary">Ao completar o diagnóstico, você recebe seu Score de Certeza, Custo de Inação diário, e uma recomendação automática de rota baseada no seu perfil. Você pode refazer o diagnóstico a qualquer momento.</p>
      </div>
    </div>
  );
}
