"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Orbit } from "lucide-react";

export default function CompanionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/aura");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg p-8">
      <div className="flex flex-col items-center gap-4">
        <Orbit className="h-8 w-8 animate-spin text-brand-500" />
        <div className="text-sm text-text-muted animate-pulse">
          Redirecionando para sua Aura...
        </div>
      </div>
    </div>
  );
}
