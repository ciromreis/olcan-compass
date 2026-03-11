"use client";

import { X, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-moss-50 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-moss-500" />
          </div>
          <h2 className="font-heading text-h3 text-text-primary">Upgrade para Navegador</h2>
          <p className="text-body-sm text-text-secondary mt-1">Desbloqueie recursos avançados de IA e mais rotas</p>
        </div>
        <ul className="space-y-2 mb-6">
          {["Diagnóstico completo (8 dimensões)", "Forge com IA ilimitada", "Simulador de entrevistas", "Marketplace (contratar)", "Suporte prioritário"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-body-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 text-moss-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <div className="text-center mb-4">
          <p className="font-heading text-h2 text-moss-500">R$ 79<span className="text-body-sm text-text-muted font-normal">/mês</span></p>
        </div>
        <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Fazer Upgrade <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="w-full mt-2 text-center text-body-sm text-text-muted hover:text-text-secondary transition-colors py-2">
          Agora não
        </button>
      </div>
    </div>
  );
}
