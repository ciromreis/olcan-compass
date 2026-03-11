"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmationVariant = "info" | "success" | "warning" | "destructive";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  loading?: boolean;
}

const iconMap: Record<ConfirmationVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertTriangle,
};

const iconColorMap: Record<ConfirmationVariant, string> = {
  info: "text-sage-500 bg-sage-50",
  success: "text-moss-500 bg-moss-50",
  warning: "text-amber-500 bg-amber-50",
  destructive: "text-clay-500 bg-clay-50",
};

const confirmVariantMap: Record<ConfirmationVariant, "primary" | "danger"> = {
  info: "primary",
  success: "primary",
  warning: "primary",
  destructive: "danger",
};

function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "info",
  loading = false,
}: ConfirmationModalProps) {
  const Icon = iconMap[variant];

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${iconColorMap[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-h3 text-text-primary mb-2">{title}</h3>
        {description && <p className="text-body-sm text-text-secondary mb-6">{description}</p>}
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariantMap[variant]}
            size="md"
            onClick={() => {
              onConfirm();
              if (!loading) onClose();
            }}
            disabled={loading}
          >
            {loading ? "Processando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { ConfirmationModal, type ConfirmationModalProps, type ConfirmationVariant };
