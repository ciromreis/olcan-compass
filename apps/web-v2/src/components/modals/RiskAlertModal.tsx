"use client";

import { X, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RiskAlertModalProps {
  open: boolean;
  onClose: () => void;
  risks?: Array<{ label: string; severity: "high" | "medium" | "low"; description: string }>;
}

const SEVERITY_COLORS = {
  high: "border-clay-500 bg-clay-50 text-clay-600",
  medium: "border-clay-300 bg-clay-50/50 text-clay-500",
  low: "border-cream-400 bg-cream-100 text-text-muted",
};

export default function RiskAlertModal({
  open,
  onClose,
  risks = [
    { label: "Deadline próximo", severity: "high", description: "Candidatura para TU Berlin encerra em 5 dias." },
    { label: "Gap financeiro", severity: "medium", description: "Sua reserva cobre apenas 3 de 6 meses recomendados." },
    { label: "Documento pendente", severity: "low", description: "Tradução juramentada do diploma ainda não enviada." },
  ],
}: RiskAlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-clay-500" />
          <h2 className="font-heading text-h3 text-text-primary">Alertas de Risco</h2>
        </div>
        <p className="text-body-sm text-text-secondary mb-4">Identificamos os seguintes riscos na sua jornada:</p>
        <div className="space-y-3 mb-6">
          {risks.map((risk, i) => (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${SEVERITY_COLORS[risk.severity]}`}>
              <p className="text-body-sm font-medium">{risk.label}</p>
              <p className="text-caption mt-0.5">{risk.description}</p>
            </div>
          ))}
        </div>
        <Link href="/readiness" onClick={onClose} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          Ver Plano de Ação <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
