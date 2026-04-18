"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePsychStore } from "@/stores/psych";
import {
  formatOiosArchetypeLabel,
  formatOiosFearClusterLabel,
  getOiosArchetypeDescription,
} from "@/lib/oios-archetype-display";

type Variant = "intro" | "results";

export function OiosSnapshotCard({ variant = "intro" }: { variant?: Variant }) {
  const oiosSnapshot = usePsychStore((s) => s.oiosSnapshot);

  if (
    !oiosSnapshot ||
    (!oiosSnapshot.dominant_archetype &&
      !oiosSnapshot.primary_fear_cluster &&
      !oiosSnapshot.mobility_state)
  ) {
    return null;
  }

  const archetype = oiosSnapshot.dominant_archetype;
  const cluster = oiosSnapshot.primary_fear_cluster;
  const mobility = oiosSnapshot.mobility_state;
  const archetypeLabel = formatOiosArchetypeLabel(archetype);
  const clusterLabel = formatOiosFearClusterLabel(cluster);
  const description = getOiosArchetypeDescription(archetype);

  const completed = oiosSnapshot.completedAt
    ? new Date(oiosSnapshot.completedAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={
        variant === "results"
          ? "card-surface p-6 border border-brand-200 bg-gradient-to-br from-brand-50/80 to-cream-50/50"
          : "card-surface p-6 border border-brand-200 bg-gradient-to-br from-brand-50/60 to-transparent"
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-brand-600">
            Seu Perfil
          </p>
          <h3 className="font-heading text-h3 text-text-primary leading-tight">
            {archetypeLabel}
          </h3>
          {variant === "intro" && (
            <p className="text-body-sm text-text-secondary">
              Resultado da avaliação rápida de onboarding. O diagnóstico abaixo (8 blocos) mede outras dimensões e complementa este perfil.
            </p>
          )}
          {description ? (
            <p className="text-body-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="inline-flex flex-col rounded-lg bg-cream-100 border border-cream-200 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Cluster de motivação
              </span>
              <span className="text-body-sm font-semibold text-text-primary">
                {clusterLabel}
              </span>
            </div>
            {mobility ? (
              <div className="inline-flex flex-col rounded-lg bg-sage-50 border border-sage-200 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Estado de mobilidade
                </span>
                <span className="text-body-sm font-semibold text-text-primary capitalize">
                  {mobility.replace(/_/g, " ")}
                </span>
              </div>
            ) : null}
          </div>
          {completed ? (
            <p className="text-caption text-text-muted pt-1">Atualizado em {completed}</p>
          ) : null}
          <div className="pt-2">
            <Link
              href="/onboarding/quiz"
              className="inline-flex text-body-sm font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
            >
              Refazer avaliação de perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
