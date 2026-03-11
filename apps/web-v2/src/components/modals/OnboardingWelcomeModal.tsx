"use client";

import { X, Compass, ArrowRight, Brain, Map, FileText } from "lucide-react";
import Link from "next/link";

interface OnboardingWelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: Brain, title: "Diagnóstico", desc: "Responda o questionário para calibrar sua jornada" },
  { icon: Map, title: "Rota", desc: "Receba rotas personalizadas com milestones claros" },
  { icon: FileText, title: "Documentos", desc: "Prepare narrativas e documentos otimizados por IA" },
];

export default function OnboardingWelcomeModal({ open, onClose }: OnboardingWelcomeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-moss-50 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-7 h-7 text-moss-500" />
          </div>
          <h2 className="font-heading text-h2 text-text-primary">Bem-vindo ao Olcan Compass!</h2>
          <p className="text-body-sm text-text-secondary mt-2">Sua jornada internacional começa aqui. Vamos configurar tudo em 3 passos simples:</p>
        </div>
        <div className="space-y-3 mb-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50">
              <div className="w-9 h-9 rounded-lg bg-moss-50 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-4 h-4 text-moss-500" />
              </div>
              <div className="flex-1">
                <p className="text-body-sm font-medium text-text-primary">{i + 1}. {step.title}</p>
                <p className="text-caption text-text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/profile/onboarding" onClick={onClose} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Começar Diagnóstico <ArrowRight className="w-4 h-4" />
        </Link>
        <button onClick={onClose} className="w-full mt-2 text-center text-body-sm text-text-muted hover:text-text-secondary transition-colors py-2">
          Explorar primeiro
        </button>
      </div>
    </div>
  );
}
