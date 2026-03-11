"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
        {variant === "danger" && (
          <div className="w-12 h-12 rounded-xl bg-clay-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-clay-500" />
          </div>
        )}
        <h2 className="font-heading text-h3 text-text-primary text-center mb-2">{title}</h2>
        <p className="text-body-sm text-text-secondary text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-500 text-text-secondary font-heading font-medium text-body-sm hover:bg-cream-200 transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2.5 rounded-xl font-heading font-semibold text-body-sm transition-colors ${
              variant === "danger"
                ? "bg-clay-500 text-white hover:bg-clay-600"
                : "bg-moss-500 text-white hover:bg-moss-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
