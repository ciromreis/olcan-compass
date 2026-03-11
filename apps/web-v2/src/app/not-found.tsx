import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-text-muted" />
        </div>
        <h1 className="font-heading text-display text-text-primary mb-2">404</h1>
        <h2 className="font-heading text-h3 text-text-primary mb-3">Página não encontrada</h2>
        <p className="text-body text-text-secondary mb-8">
          A rota que você tentou acessar não existe ou foi movida. Verifique o endereço ou volte ao início.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-moss-500 text-white font-heading font-semibold hover:bg-moss-600 transition-colors">
            <Home className="w-4 h-4" /> Ir para o Início
          </Link>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cream-500 text-text-secondary font-heading font-medium hover:bg-cream-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
