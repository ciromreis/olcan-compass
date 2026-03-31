"use client";

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { CheckCircle, AlertTriangle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const iconMap: Record<ToastVariant, typeof Info> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
  success: "border-brand-300 bg-brand-50",
  error: "border-clay-300 bg-clay-50",
  warning: "border-amber-300 bg-amber-50",
  info: "border-sage-300 bg-sage-50",
};

const iconStyles: Record<ToastVariant, string> = {
  success: "text-brand-500",
  error: "text-clay-500",
  warning: "text-amber-500",
  info: "text-sage-500",
};

let idCounter = 0;

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = iconMap[item.variant];

  useEffect(() => {
    const ms = item.duration ?? 4000;
    const timer = setTimeout(() => onDismiss(item.id), ms);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto border rounded-xl p-4 shadow-lg animate-slide-in-right flex items-start gap-3",
        variantStyles[item.variant]
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconStyles[item.variant])} />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-text-primary">{item.title}</p>
        {item.description && <p className="text-caption text-text-secondary mt-0.5">{item.description}</p>}
      </div>
      <button onClick={() => onDismiss(item.id)} className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export { ToastProvider, useToast, type ToastItem, type ToastVariant };
