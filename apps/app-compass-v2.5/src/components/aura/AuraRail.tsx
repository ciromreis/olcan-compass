"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  Flame,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Target,
} from "lucide-react";
import { buildAuraRailState } from "@/lib/journey";
import { derivePresencePhenotype } from "@/lib/presence-phenotype";
import { derivePresenceProfile } from "@/lib/aura-presence";
import { ProceduralAuraFigure } from "@/components/aura/ProceduralAuraFigure";
import { useJourneySnapshot } from "@/hooks/useJourneySnapshot";
import { useAuraStore } from "@/stores/auraStore";
import { useAvailableQuests, useGamificationStore } from "@/stores/eventDrivenGamificationStore";

function toneClass(score: number) {
  if (score >= 72) return "text-slate-800 bg-slate-50 border-slate-200";
  if (score >= 48) return "text-slate-600 bg-slate-50 border-slate-100";
  return "text-slate-400 bg-slate-50 border-slate-50";
}

export default function AuraRail() {
  const pathname = usePathname();
  const { aura } = useAuraStore();
  const { snapshot, routeSignals } = useJourneySnapshot();
  const quests = useAvailableQuests();
  const streaks = useGamificationStore((state) => state.streaks);

  const highestStreak = Math.max(
    ...Object.values(streaks || {}).map((streak) => streak.currentCount),
    0
  );

  const railState = useMemo(
    () =>
      buildAuraRailState(snapshot, aura, {
        streakCount: highestStreak,
        openQuestCount: quests.length,
      }),
    [snapshot, aura, highestStreak, quests.length]
  );

  const phenotype = useMemo(
    () => derivePresencePhenotype(routeSignals, snapshot.primaryRouteSignal?.routeId),
    [routeSignals, snapshot.primaryRouteSignal?.routeId]
  );

  const profile = useMemo(
    () => (aura ? derivePresenceProfile(aura, phenotype) : null),
    [aura, phenotype]
  );

  if (!aura || !profile) {
    return (
      <aside className="hidden lg:block lg:w-[22rem] xl:w-[24rem]">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-2xl">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="h-4 w-4" />
              <p className="text-caption font-semibold uppercase tracking-[0.22em]">PAINEL AURA</p>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Ative sua Aura</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A presença contextual aparece aqui assim que sua Aura estiver criada.
            </p>
            <Link
              href="/aura/discover"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:underline"
            >
              Criar minha Aura
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block lg:w-[22rem] xl:w-[24rem]">
      <div className="sticky top-6 space-y-4 pb-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Presença contínua
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-950">{railState.auraName}</p>
                <p className="text-sm text-slate-500">{railState.mood}</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                Nível {railState.auraLevel}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200/50 bg-white/40 shadow-inner">
                <ProceduralAuraFigure spec={profile.figure} size={76} active />
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p>{profile.descriptor}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    <Flame className="h-3.5 w-3.5 text-slate-400" />
                    streak {railState.streakCount}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    <Target className="h-3.5 w-3.5 text-slate-400" />
                    quests {railState.openQuestCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Prontidão"
                value={`${railState.routeReadiness}%`}
                icon={Compass}
                tone={toneClass(railState.routeReadiness)}
              />
              <MetricCard
                label="Risco de rota"
                value={railState.routeRiskLabel}
                icon={ShieldAlert}
                tone={toneClass(100 - railState.routeReadiness)}
              />
            </div>

            {railState.nextBestAction ? (
              <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <Target className="h-3.5 w-3.5" />
                  Próxima melhor ação
                </div>
                <p className="mt-3 text-base font-semibold text-slate-950">
                  {railState.nextBestAction.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {railState.nextBestAction.description}
                </p>
                <Link
                  href={railState.nextBestAction.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
                >
                  {railState.nextBestAction.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : null}

            {railState.commerceRecommendation ? (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Oferta contextual
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {railState.commerceRecommendation.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {railState.commerceRecommendation.short_description || railState.commerceRecommendation.description}
                </p>
                <Link
                  href={`/marketplace/products/${railState.commerceRecommendation.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
                >
                  Ver no marketplace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : null}

            {railState.contentRecommendation ? (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <BookOpenText className="h-3.5 w-3.5" />
                  Conteúdo do CMS
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {railState.contentRecommendation.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {railState.contentRecommendation.excerpt}
                </p>
                <Link
                  href={railState.contentRecommendation.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
                >
                  Abrir contexto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : null}

            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs uppercase tracking-[0.18em] text-slate-500">
              Tela atual: {pathname.replace(/\//g, " / ") || "/dashboard"}
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Compass;
  tone: string;
}) {
  return (
    <div className={`rounded-[1.35rem] border px-4 py-3 ${tone}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}
