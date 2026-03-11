"use client";

import { usePathname } from "next/navigation";
import { Brain } from "lucide-react";

const STEPS = [
  { path: "/profile/psych", label: "Intro" },
  { path: "/profile/psych/calibration", label: "Contexto" },
  { path: "/profile/psych/confidence", label: "Confiança" },
  { path: "/profile/psych/risk", label: "Risco" },
  { path: "/profile/psych/discipline", label: "Disciplina" },
  { path: "/profile/psych/decisions", label: "Decisões" },
  { path: "/profile/psych/anxiety", label: "Ansiedade" },
  { path: "/profile/psych/goals", label: "Objetivos" },
  { path: "/profile/psych/financial", label: "Finanças" },
  { path: "/profile/psych/summary", label: "Resumo" },
  { path: "/profile/psych/results", label: "Resultados" },
];

export default function PsychLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-moss-50 flex items-center justify-center">
          <Brain className="w-5 h-5 text-moss-500" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-h4 text-text-primary">Diagnóstico Psicológico</h2>
          <p className="text-caption text-text-muted">
            {currentIndex >= 0 ? `Etapa ${currentIndex + 1} de ${STEPS.length}` : ""}
          </p>
        </div>
      </div>
      {currentIndex > 0 && (
        <div className="mb-8">
          <div className="h-1.5 bg-cream-300 rounded-full overflow-hidden">
            <div className="h-full bg-moss-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step, i) => (
              <span key={step.path} className={`text-[10px] font-medium ${i <= currentIndex ? "text-moss-500" : "text-text-muted"}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
