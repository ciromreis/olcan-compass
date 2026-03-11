"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useHydration } from "@/hooks";
import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "@/components/ui";
import { isSuperAdminRole } from "@/lib/roles";

export default function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  const { user } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isSuperAdmin = isSuperAdminRole(user?.role);
  if (!isSuperAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card-surface p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-clay-50 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-clay-500" />
          </div>
          <h1 className="font-heading text-h3 text-text-primary mb-2">Acesso restrito</h1>
          <p className="text-body-sm text-text-secondary mb-6">
            Esta área é reservada para administradores da plataforma.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
