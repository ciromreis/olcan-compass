/**
 * Aura Visual Display - v2.5
 *
 * Uses a deterministic procedural figure instead of fixed mascot art.
 * This keeps the visual system adaptable across routes and readiness states.
 */

"use client";

import { type ReactNode, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Sparkles, Star, Zap } from "lucide-react";
import type { PresencePhenotype } from "@/lib/presence-phenotype";
import {
  derivePresenceProfile,
  getPresenceReaction,
  resolvePresenceEvent,
} from "@/lib/aura-presence";
import { getArchetype } from "@/lib/archetypes";
import type { CareActivityType, EvolutionStage, ArchetypeType, AuraStats, Aura } from "@/stores/auraStore";
import { ProceduralAuraFigure } from "@/components/aura/ProceduralAuraFigure";

interface AuraVisualProps {
  evolutionStage: EvolutionStage;
  archetype: ArchetypeType;
  name: string;
  level: number;
  stats: AuraStats;
  happiness: number;
  energy: number;
  isPerformingActivity?: boolean;
  activityType?: CareActivityType;
  phenotype?: PresencePhenotype;
  pathnameHint?: string;
  ritualAffinity?: Record<string, number>;
}

const STAGE_LABELS: Record<EvolutionStage, string> = {
  egg: "Núcleo inicial",
  sprout: "Despertar operacional",
  young: "Expansão em curso",
  mature: "Consistência alta",
  master: "Domínio articulado",
  legendary: "Forma soberana",
};

function toneClass(value: number): string {
  if (value >= 75) return "text-slate-800";
  if (value >= 50) return "text-slate-600";
  return "text-slate-400";
}

export function AuraVisual({
  evolutionStage,
  archetype,
  name,
  level,
  stats,
  happiness,
  energy,
  isPerformingActivity,
  activityType,
  phenotype,
  pathnameHint,
  ritualAffinity,
}: AuraVisualProps) {
  const [isHovered, setIsHovered] = useState(false);

  const auraSnapshot = useMemo<Aura>(
    () => ({
      id: `visual-${name}-${archetype}`,
      userId: "visual",
      name,
      archetype,
      evolutionStage,
      level,
      experiencePoints: level * 100,
      xpToNextLevel: (level + 1) * 100,
      health: 100,
      maxHealth: 100,
      happiness,
      energy,
      maxEnergy: 100,
      stats,
      abilities: [],
      createdAt: "",
      updatedAt: "",
      lastCaredAt: null,
      ritualAffinity,
    }),
    [name, archetype, evolutionStage, level, happiness, energy, stats, ritualAffinity]
  );

  const profile = useMemo(
    () => derivePresenceProfile(auraSnapshot, phenotype),
    [auraSnapshot, phenotype]
  );

  const reaction = useMemo(
    () =>
      getPresenceReaction({
        aura: auraSnapshot,
        phenotype,
        event: resolvePresenceEvent({
          aura: auraSnapshot,
          phenotype,
          pathname: pathnameHint,
          activityType,
        }),
        activityType,
      }),
    [activityType, auraSnapshot, pathnameHint, phenotype]
  );

  const activityLabel = activityType
    ? {
        feed: "calibração biológica",
        train: "potencialização",
        play: "interação ativa",
        rest: "recomposição",
        groom: "refino",
        socialize: "expansão relacional",
      }[activityType]
    : null;

  const adaptationScore = Math.round((phenotype?.adaptationLevel ?? 0.18) * 100);
  const documentScore = Math.round((phenotype?.documentReadiness ?? 0.22) * 100);
  const interviewScore = Math.round((phenotype?.interviewReadiness ?? 0.18) * 100);

  return (
    <div
      className="relative flex items-center justify-center p-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phantom Ring Background (Crisp, High-End) */}
      <motion.div
        className="absolute inset-10 rounded-full border border-slate-300/20 bg-transparent shadow-[0_0_80px_rgba(148,163,184,0.12)]"
        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <AnimatePresence>
          <motion.div
            key={profile.figure.seed}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative"
          >
            <ProceduralAuraFigure
              spec={profile.figure}
              size={260}
              active={!isPerformingActivity}
            />

            <motion.div
              className="absolute -bottom-3 left-1/2 h-5 w-40 -translate-x-1/2 rounded-full bg-navy-900/10 blur-2xl"
              animate={{ opacity: [0.28, 0.44, 0.28], scaleX: [0.95, 1.02, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-md rounded-[28px] border border-white/60 bg-white/70 px-5 py-4 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            {profile.title}
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{reaction}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{profile.descriptor}</p>
          {activityLabel ? (
            <div className="mt-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {activityLabel}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="absolute bottom-[-18%] z-40 w-full max-w-xl"
          >
            <div className="rounded-[28px] border border-white/60 bg-white/78 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {STAGE_LABELS[evolutionStage]} • {getArchetype(archetype as any)?.name || String(archetype).replaceAll("_", " ")}
                  </p>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Nível {level}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatItem label="Impulso" value={stats.power} icon={<Zap className="h-3.5 w-3.5" />} color="text-slate-600" />
                <StatItem label="Conexão" value={stats.wisdom} icon={<Star className="h-3.5 w-3.5" />} color="text-slate-400" />
                <StatItem label="Foco" value={stats.charisma} icon={<Heart className="h-3.5 w-3.5" />} color="text-slate-500" />
                <StatItem label="Fluxo" value={stats.agility} icon={<Activity className="h-3.5 w-3.5" />} color="text-slate-300" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Adaptação</div>
                  <div className={`mt-1 text-sm font-semibold ${toneClass(adaptationScore)}`}>{adaptationScore}%</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Documento</div>
                  <div className={`mt-1 text-sm font-semibold ${toneClass(documentScore)}`}>{documentScore}%</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Entrevista</div>
                  <div className={`mt-1 text-sm font-semibold ${toneClass(interviewScore)}`}>{interviewScore}%</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
      <div className="flex items-center gap-1.5">
        <span className={color}>{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function AuraAvatar({
  evolutionStage,
  archetype = "strategist" as ArchetypeType,
  size = "md",
  showLevel = false,
  level,
}: {
  evolutionStage: EvolutionStage;
  archetype?: ArchetypeType;
  size?: "sm" | "md" | "lg";
  showLevel?: boolean;
  level?: number;
}) {
  const visualSize = {
    sm: 48,
    md: 68,
    lg: 84,
  }[size];

  const auraSnapshot = {
    id: `avatar-${evolutionStage}-${archetype}`,
    userId: "avatar",
    name: "Aura",
    archetype,
    evolutionStage,
    level: level || 1,
    experiencePoints: 0,
    xpToNextLevel: 100,
    health: 100,
    maxHealth: 100,
    happiness: 72,
    energy: 68,
    maxEnergy: 100,
    stats: { power: 50, wisdom: 50, charisma: 50, agility: 50, battlesWon: 0, battlesLost: 0 },
    abilities: [],
    createdAt: "",
    updatedAt: "",
    lastCaredAt: null,
  } as Aura;

  const profile = derivePresenceProfile(auraSnapshot);

  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="rounded-full border border-white/60 bg-white/70 p-1 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <ProceduralAuraFigure spec={profile.figure} size={visualSize} active />
      </div>
      {showLevel && level ? (
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white shadow-lg">
          {level}
        </div>
      ) : null}
    </div>
  );
}

export function EvolutionBadge({
  stage,
  showGlow = false,
}: {
  stage: EvolutionStage;
  showGlow?: boolean;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700 backdrop-blur-xl"
      style={showGlow ? { boxShadow: "0 0 32px rgba(37, 99, 235, 0.14)" } : undefined}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-400 to-navy-700" />
      {STAGE_LABELS[stage]}
    </div>
  );
}
