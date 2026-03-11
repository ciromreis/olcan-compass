"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useObservabilityStore } from "@/stores/observability";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const recordFrontendError = useObservabilityStore((state) => state.recordFrontendError);

  useEffect(() => {
    recordFrontendError({
      name: error.name || "GlobalRootError",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      route: typeof window !== "undefined" ? window.location.pathname : "root",
    });
  }, [error, recordFrontendError]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-surface-bg flex items-center justify-center px-6 font-body">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-clay-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-clay-500" />
          </div>
          <h1 className="font-heading text-display text-text-primary mb-2">500</h1>
          <h2 className="font-heading text-h3 text-text-primary mb-3">Falha crítica da aplicação</h2>
          <p className="text-body text-text-secondary mb-8">
            Ocorreu um erro inesperado no carregamento global. Tente reiniciar a interface ou voltar ao início.
          </p>
          {error.digest ? (
            <p className="text-caption text-text-muted mb-4 font-mono">Código: {error.digest}</p>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cream-500 text-text-secondary font-heading font-medium hover:bg-cream-200 transition-colors"
            >
              <Home className="w-4 h-4" /> Ir para o início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
