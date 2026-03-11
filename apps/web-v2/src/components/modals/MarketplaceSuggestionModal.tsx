"use client";

import { X, Star, Shield, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface MarketplaceSuggestionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MarketplaceSuggestionModal({ open, onClose }: MarketplaceSuggestionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-moss-500" />
          <h2 className="font-heading text-h3 text-text-primary">Profissional Recomendado</h2>
        </div>
        <p className="text-body-sm text-text-secondary mb-4">Com base na sua rota e gaps identificados, recomendamos este profissional:</p>
        <div className="p-4 rounded-xl bg-cream-50 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-moss-50 flex items-center justify-center text-moss-500 font-heading font-bold">AL</div>
            <div>
              <p className="font-heading font-semibold text-text-primary">Ana Luísa Ferreira</p>
              <p className="text-caption text-text-muted">Advogada de Imigração — Alemanha</p>
            </div>
          </div>
          <div className="flex gap-3 text-caption text-text-muted">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-clay-500 fill-current" />4.9 (47)</span>
            <span className="flex items-center gap-1 text-moss-500"><Shield className="w-3 h-3" />PEI: 92</span>
          </div>
        </div>
        <Link href="/marketplace/provider/p1" onClick={onClose} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
          Ver Perfil <ArrowRight className="w-4 h-4" />
        </Link>
        <button onClick={onClose} className="w-full mt-2 text-center text-body-sm text-text-muted hover:text-text-secondary transition-colors py-2">
          Agora não
        </button>
      </div>
    </div>
  );
}
