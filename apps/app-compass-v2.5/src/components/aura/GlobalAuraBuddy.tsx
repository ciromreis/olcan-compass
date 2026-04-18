"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuraStore } from "@/stores/auraStore";
import { useRouteStore } from "@/stores/routes";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { derivePresencePhenotype, deriveRoutePresenceSignals } from "@/lib/presence-phenotype";
import {
  derivePresenceProfile,
  getPresenceReaction,
  resolvePresenceEvent,
} from "@/lib/aura-presence";
import { ProceduralAuraFigure } from "@/components/aura/ProceduralAuraFigure";

const ROTATING_EVENTS = ["idle", "route_focus", "document_focus", "interview_focus"] as const;

export default function GlobalAuraBuddy() {
  const pathname = usePathname();
  const { aura } = useAuraStore();
  const { routes, getRouteProgress } = useRouteStore();
  const { documents } = useForgeStore();
  const { sessions } = useInterviewStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  const routeSignals = useMemo(
    () => deriveRoutePresenceSignals(routes, documents, sessions, getRouteProgress),
    [routes, documents, sessions, getRouteProgress]
  );
  const phenotype = useMemo(() => derivePresencePhenotype(routeSignals), [routeSignals]);
  const profile = useMemo(
    () => (aura ? derivePresenceProfile(aura, phenotype) : null),
    [aura, phenotype]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % ROTATING_EVENTS.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, []);

  if (!aura || !profile) return null;

  const primaryEvent =
    resolvePresenceEvent({
      aura,
      phenotype,
      pathname,
    }) ?? "idle";

  const rotatedEvent =
    primaryEvent === "idle"
      ? ROTATING_EVENTS[pulseIndex]
      : primaryEvent;

  const message = getPresenceReaction({
    aura,
    phenotype,
    event: rotatedEvent,
  });

  const needsAttention = aura.energy <= 24 || (phenotype.urgencyLevel ?? 0) >= 0.72;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 42, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex max-w-sm flex-col items-end lg:hidden"
      >
          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="pointer-events-auto mb-4 w-80 overflow-hidden rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Presença em bordo
                    </div>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{message}</p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Metric label="Adaptação" value={`${Math.round((phenotype.adaptationLevel ?? 0.18) * 100)}%`} />
                  <Metric label="Documento" value={`${Math.round((phenotype.documentReadiness ?? 0.22) * 100)}%`} />
                  <Metric label="Entrevista" value={`${Math.round((phenotype.interviewReadiness ?? 0.18) * 100)}%`} />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rota ativa</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{phenotype.routeLabel || "Sem rota ativa"}</div>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    Nv. {aura.level}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsExpanded((current) => !current)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="pointer-events-auto relative overflow-hidden rounded-[26px] border border-white/70 bg-white/70 px-3 py-3 shadow-[0_18px_52px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_rgba(255,255,255,0.6))]">
                <ProceduralAuraFigure spec={profile.figure} size={62} active />
              </div>

              <div className="w-40 text-left">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {needsAttention ? <AlertTriangle className="h-3.5 w-3.5 text-clay-600" /> : <Activity className="h-3.5 w-3.5 text-brand-600" />}
                  {profile.mood}
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-700">{message}</p>
              </div>
            </div>

            {needsAttention ? (
              <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-600 px-1.5 text-[10px] font-semibold text-white">
                !
              </span>
            ) : null}
          </motion.button>
        </motion.div>
    </AnimatePresence>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
