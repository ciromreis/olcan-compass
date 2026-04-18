"use client";

import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { hasOiosArchetypeEstablished, usePsychStore } from "@/stores/psych";

/**
 * Shown on psych intro when the user has not established an OIOS archetype yet.
 */
export function OiosEntryPrompt() {
  const oiosDone = usePsychStore((s) =>
    hasOiosArchetypeEstablished({
      oiosAssessmentComplete: s.oiosAssessmentComplete,
      oiosSnapshot: s.oiosSnapshot,
    })
  );

  if (oiosDone) {
    return null;
  }

  return (
    <div className="card-surface p-6 border border-cream-300 bg-cream-50/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
            <Brain className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              Recomendado antes do fluxo de 8 blocos
            </p>
            <h2 className="font-heading text-h4 text-text-primary mt-1">
              Avaliação de Perfil de Mobilidade
            </h2>
            <p className="text-body-sm text-text-secondary mt-2 max-w-xl leading-relaxed">
              Em poucos minutos você descobre seu perfil de mobilidade. O resultado aparece aqui e
              no painel; o diagnóstico abaixo complementa com o Score de Certeza.
            </p>
          </div>
        </div>
        <Link
          href="/onboarding/quiz"
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Fazer avaliação de perfil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
