"use client";

import { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";

interface DisputeModalProps {
  open: boolean;
  onClose: () => void;
  bookingId?: string;
  onSubmit?: (reason: string, details: string) => void;
}

const REASONS = [
  "Serviço não entregue",
  "Qualidade abaixo do esperado",
  "Profissional não compareceu",
  "Prazo não cumprido",
  "Outro",
];

export default function DisputeModal({ open, onClose, bookingId, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit?.(reason, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-clay-500" />
          <h2 className="font-heading text-h3 text-text-primary">Abrir Disputa</h2>
        </div>
        {bookingId && <p className="text-caption text-text-muted mb-3">Booking: {bookingId}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Motivo</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-moss-400">
              <option value="">Selecione...</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Detalhes</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Descreva o problema em detalhes..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent resize-none" />
          </div>
        </div>
        <p className="text-caption text-text-muted mt-3 mb-4">Ao abrir uma disputa, o escrow permanece retido até a resolução. Nossa equipe analisará em até 48h.</p>
        <button onClick={handleSubmit} disabled={!reason} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-clay-500 text-white font-heading font-semibold text-body-sm hover:bg-clay-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="w-4 h-4" /> Enviar Disputa
        </button>
      </div>
    </div>
  );
}
