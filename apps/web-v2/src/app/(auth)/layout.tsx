import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      <header className="h-16 px-6 flex items-center">
        <Link href="/" className="font-heading text-h4 font-bold text-moss-500">
          Olcan Compass
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-6 text-center">
        <p className="text-caption text-text-muted">
          &copy; {new Date().getFullYear()} Olcan. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
