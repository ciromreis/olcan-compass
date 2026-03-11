import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Public marketing nav — will be built in Phase 1 */}
      <header className="sticky top-0 z-50 glass-panel border-b border-cream-400">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-heading text-h4 font-bold text-moss-500">
            Olcan Compass
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-body-sm font-medium text-text-secondary hover:text-moss-500 transition-colors"
            >
              Entrar
            </a>
            <a
              href="/register"
              className="text-body-sm font-medium px-4 py-2 rounded-lg bg-moss-500 text-white hover:bg-moss-600 transition-colors"
            >
              Começar Agora
            </a>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
