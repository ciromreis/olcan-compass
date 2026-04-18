"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { hasOiosArchetypeEstablished, usePsychStore } from "@/stores/psych";
import { useRouteStore } from "@/stores/routes";

interface Step {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  cta: string;
}

/**
 * Single guided path through the core internationalization loop (diagnosis → route → docs → practice).
 */
export function JourneyProgressChecklist() {
  const oiosAssessmentComplete = usePsychStore((s) => s.oiosAssessmentComplete);
  const oiosSnapshot = usePsychStore((s) => s.oiosSnapshot);
  const likertComplete = usePsychStore((s) => s.isComplete());
  const routes = useRouteStore((s) => s.routes);
  const documents = useForgeStore((s) => s.documents);
  const sessions = useInterviewStore((s) => s.sessions);

  const hasOios = hasOiosArchetypeEstablished({ oiosAssessmentComplete, oiosSnapshot });

  const steps: Step[] = [
    {
      id: "oios",
      label: "Diagnóstico de mobilidade",
      description: "Mapeie seu perfil de mobilidade e alinhe rota, documentos e presença.",
      done: hasOios,
      href: "/onboarding/quiz",
      cta: hasOios ? "Revisar" : "Iniciar",
    },
    {
      id: "likert",
      label: "Diagnóstico Likert (8 dimensões)",
      description: "Alimenta o Score de Certeza e as telas de prontidão.",
      done: likertComplete,
      href: "/profile/psych",
      cta: likertComplete ? "Concluído" : "Continuar",
    },
    {
      id: "route",
      label: "Rota de mobilidade",
      description: "Pelo menos uma rota ativa com marcos.",
      done: routes.length > 0,
      href: routes.length > 0 ? `/routes/${routes[0].id}` : "/routes/new",
      cta: routes.length > 0 ? "Abrir rota" : "Criar rota",
    },
    {
      id: "forge",
      label: "Documento no Forge",
      description: "CV, carta ou narrativa central para candidaturas.",
      done: documents.length > 0,
      href: documents.length > 0 ? `/forge/${documents[0].id}` : "/forge/new",
      cta: documents.length > 0 ? "Abrir documento" : "Criar documento",
    },
    {
      id: "interview",
      label: "Sessão de entrevista",
      description: "Simulação guiada (texto); voz em evolução.",
      done: sessions.length > 0,
      href: "/interviews/new",
      cta: sessions.length > 0 ? "Ver sessões" : "Nova sessão",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Jornada núcleo</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Sequência recomendada</h2>
          <p className="mt-1 text-sm text-slate-600">
            {completed}/{total} etapas concluídas — priorize o que falta para destravar o restante do Compass.
          </p>
        </div>
        <div className="h-2 min-w-[120px] flex-1 rounded-full bg-slate-100 md:max-w-[200px]">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width]"
            style={{ width: `${Math.round((completed / total) * 100)}%` }}
          />
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm ${
                step.done
                  ? "border-emerald-200 bg-emerald-50/80"
                  : "border-slate-200 bg-slate-50/80 hover:border-brand-200 hover:bg-white"
              }`}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500">
                {step.done ? <Check className="h-4 w-4 text-emerald-600" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-950">{step.label}</span>
                <p className="mt-0.5 text-sm text-slate-600">{step.description}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600">
                {step.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
