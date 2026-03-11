"use client";

import { X, AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export default function ErrorModal({
  open,
  onClose,
  onRetry,
  title = "Erro inesperado",
  message = "Algo deu errado. Tente novamente ou entre em contato com o suporte.",
}: ErrorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        <div className="w-12 h-12 rounded-xl bg-clay-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-clay-500" />
        </div>
        <h2 className="font-heading text-h3 text-text-primary mb-2">{title}</h2>
        <p className="text-body-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-500 text-text-secondary font-heading font-medium text-body-sm hover:bg-cream-200 transition-colors">
            Fechar
          </button>
          {onRetry && (
            <button onClick={onRetry} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors">
              <RefreshCw className="w-4 h-4" /> Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
