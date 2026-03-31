"use client";

import { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface NotificationToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

const ICONS: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastVariant, string> = {
  success: "bg-brand-50 border-brand-300 text-brand-600",
  error: "bg-clay-50 border-clay-300 text-clay-600",
  info: "bg-cream-100 border-cream-400 text-text-primary",
  warning: "bg-clay-50 border-clay-200 text-clay-500",
};

export default function NotificationToast({
  open,
  onClose,
  message,
  variant = "info",
  duration = 4000,
}: NotificationToastProps) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const Icon = ICONS[variant];

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${COLORS[variant]}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-body-sm font-medium">{message}</p>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5 transition-colors ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
