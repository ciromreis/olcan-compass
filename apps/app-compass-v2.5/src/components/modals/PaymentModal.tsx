"use client";

import { useState } from "react";
import { X, CreditCard, Shield, Lock } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  description: string;
}

export default function PaymentModal({ open, onClose, amount, description }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-brand-500" />
          <h2 className="font-heading text-h3 text-text-primary">Pagamento</h2>
        </div>
        <div className="p-4 rounded-xl bg-cream-50 mb-4">
          <p className="text-body-sm text-text-secondary">{description}</p>
          <p className="font-heading text-h2 text-brand-500 mt-1">R$ {amount.toLocaleString("pt-BR")}</p>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-caption font-medium text-text-primary mb-1">Número do cartão</label>
            <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-3 py-2 rounded-lg border border-cream-500 bg-white text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-medium text-text-primary mb-1">Validade</label>
              <input type="text" placeholder="MM/AA" className="w-full px-3 py-2 rounded-lg border border-cream-500 bg-white text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-caption font-medium text-text-primary mb-1">CVC</label>
              <input type="text" placeholder="123" className="w-full px-3 py-2 rounded-lg border border-cream-500 bg-white text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-caption text-text-muted mb-4">
          <Lock className="w-3 h-3" /> Pagamento seguro via Stripe
          <Shield className="w-3 h-3 text-brand-500 ml-1" /> Protegido por escrow
        </div>
        <button onClick={handlePay} disabled={processing} className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors disabled:opacity-50">
          {processing ? "Processando..." : `Pagar R$ ${amount}`}
        </button>
      </div>
    </div>
  );
}
