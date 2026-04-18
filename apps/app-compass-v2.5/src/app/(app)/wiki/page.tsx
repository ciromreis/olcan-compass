"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  RefreshCw,
  ScanFace,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePsychStore } from "@/stores/psych";
import { useAuraStore } from "@/stores/auraStore";
import {
  OIOS_ARCHETYPE_LABELS,
  OIOS_ARCHETYPE_DESCRIPTIONS,
  OIOS_FEAR_CLUSTER_LABELS,
} from "@/lib/oios-archetype-display";

const MOBILITY_STATE_LABELS: Record<string, string> = {
  stagnant: "Estagnado",
  exploring: "Em Exploração",
  committed: "Comprometido",
  deploying: "Em Implantação",
  achieved: "Objetivo Alcançado",
};

const FEAR_ICON: Record<string, typeof Brain> = {
  freedom: Zap,
  success: Target,
  stability: ShieldAlert,
  validation: Sparkles,
};

export default function DiagnosticoPage() {
  const { oiosSnapshot, oiosAssessmentComplete } = usePsychStore();
  const { aura } = useAuraStore();

  const hasDiagnostic = oiosAssessmentComplete || Boolean(oiosSnapshot?.dominant_archetype);
  const archetype = oiosSnapshot?.dominant_archetype;
  const archetypeLabel = archetype ? (OIOS_ARCHETYPE_LABELS[archetype] ?? archetype) : null;
  const archetypeDescription = archetype ? OIOS_ARCHETYPE_DESCRIPTIONS[archetype] : null;
  const fearCluster = oiosSnapshot?.primary_fear_cluster;
  const fearLabel = fearCluster ? (OIOS_FEAR_CLUSTER_LABELS[fearCluster] ?? fearCluster) : null;
  const FearIcon = fearCluster ? (FEAR_ICON[fearCluster] ?? Brain) : Brain;
  const mobilityState = oiosSnapshot?.mobility_state;
  const mobilityLabel = mobilityState ? (MOBILITY_STATE_LABELS[mobilityState] ?? mobilityState) : null;

  if (!hasDiagnostic) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex h-20 w-20 mx-auto items-center justify-center rounded-[2rem] bg-slate-100 border border-slate-200">
            <ScanFace className="h-9 w-9 text-slate-400" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Seu perfil ainda não foi revelado
            </h1>
            <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
              O diagnóstico mapeia seu arquétipo de mobilidade, seus motivadores centrais e o estado
              atual da sua jornada — tudo isso em menos de 10 minutos.
            </p>
          </div>

          <Link
            href="/onboarding/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            Iniciar diagnóstico
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
          Diagnóstico completo
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          {archetypeLabel ?? "Perfil de Mobilidade"}
        </h1>
        {mobilityLabel && (
          <p className="text-sm text-slate-500 font-medium">Estado atual: {mobilityLabel}</p>
        )}
      </motion.div>

      {/* Archetype card */}
      {archetypeDescription && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white shadow-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Arquétipo
              </p>
              <p className="text-lg font-semibold text-slate-950">{archetypeLabel}</p>
              <p className="text-sm leading-relaxed text-slate-600">{archetypeDescription}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fear cluster + Aura row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fearLabel && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-slate-100">
                <FearIcon className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Motivador central
                </p>
                <p className="text-base font-semibold text-slate-950">{fearLabel}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Este é o núcleo emocional que orienta suas decisões de mobilidade — o que você mais
              busca proteger ou conquistar.
            </p>
          </motion.div>
        )}

        {aura && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-slate-100">
                <Sparkles className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Presença ativa
                </p>
                <p className="text-base font-semibold text-slate-950">{aura.name}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nível {aura.level} · Estágio {aura.evolutionStage}
            </p>
            <Link
              href="/aura"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Ver evolução <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 space-y-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Próximos passos recomendados
        </p>
        <div className="space-y-2">
          {[
            { href: "/routes/new", label: "Criar um caminho de mobilidade", icon: Compass },
            { href: "/forge/new", label: "Iniciar um documento estratégico", icon: ScanFace },
            { href: "/aura", label: "Explorar sua presença e conquistas", icon: Sparkles },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-[1.3rem] px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <Icon className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-950 transition-colors">
                {label}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Retake CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3 text-sm text-slate-400"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Quer refazer o diagnóstico?</span>
        <Link href="/onboarding/quiz" className="text-slate-600 font-semibold hover:text-slate-950 underline underline-offset-2 transition-colors">
          Refazer
        </Link>
      </motion.div>
    </div>
  );
}
