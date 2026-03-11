"use client";

import { X, Shield, CheckCircle, Clock, DollarSign } from "lucide-react";

interface EscrowInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EscrowInfoModal({ open, onClose }: EscrowInfoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-brand-500" />
          </div>
          <h2 className="font-heading text-h3 text-text-primary">Como funciona o Escrow</h2>
        </div>
        <div className="space-y-4 mb-6">
          {[
            { icon: DollarSign, step: "1. Pagamento", desc: "Você paga e o valor fica retido com segurança na plataforma." },
            { icon: Clock, step: "2. Serviço", desc: "O profissional realiza o serviço contratado dentro do prazo." },
            { icon: CheckCircle, step: "3. Aprovação", desc: "Você aprova a entrega e o valor é liberado ao profissional." },
            { icon: Shield, step: "4. Proteção", desc: "Em caso de disputa, nossa equipe media e resolve." },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-text-primary">{s.step}</p>
                <p className="text-caption text-text-secondary">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          Entendi
        </button>
      </div>
    </div>
  );
}
