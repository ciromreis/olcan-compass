"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useObservabilityStore } from "@/stores/observability";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const recordFrontendError = useObservabilityStore((state) => state.recordFrontendError);

  useEffect(() => {
    recordFrontendError({
      name: error.name || "GlobalErrorBoundary",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      route: pathname,
    });
  }, [error, pathname, recordFrontendError]);

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-clay-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-clay-500" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-2">500</h1>
        <h2 className="font-heading text-h3 text-text-primary mb-3">Algo deu errado</h2>
        <p className="text-body text-text-secondary mb-8">
          Ocorreu um erro inesperado. Nossa equipe foi notificada. Tente novamente ou volte ao início.
        </p>
        {error.digest && (
          <p className="text-caption text-text-muted mb-4 font-mono">Código: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cream-500 text-text-secondary font-heading font-medium hover:bg-cream-200 transition-colors"
          >
            <Home className="w-4 h-4" /> Ir para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}
