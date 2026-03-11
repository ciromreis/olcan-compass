"use client";

import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  open: boolean;
  message?: string;
}

export default function LoadingModal({
  open,
  message = "Processando...",
}: LoadingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xs w-full p-8 text-center">
        <Loader2 className="w-8 h-8 text-moss-500 animate-spin mx-auto mb-4" />
        <p className="text-body text-text-primary font-heading font-medium">{message}</p>
      </div>
    </div>
  );
}
