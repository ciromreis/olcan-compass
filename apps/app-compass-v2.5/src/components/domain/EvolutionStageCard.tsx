"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Hexagon, Zap, ArrowUpCircle } from "lucide-react";
import { useNudgeStore } from "@/stores/nudge";

interface EvolutionStageCardProps {
  className?: string;
  onClickUpgrade?: () => void;
}

export const EvolutionStageCard: React.FC<EvolutionStageCardProps> = ({
  className = "",
  onClickUpgrade
}) => {
  const { evolutionStage, kineticEnergy, getArchetypeData, getFearClusterName } = useNudgeStore();
  const archetype = getArchetypeData();
  const fearName = getFearClusterName();

  const stageLabel = useMemo(() => {
    switch (evolutionStage) {
      case 1: return "Base em organização";
      case 2: return "Ritmo em consolidação";
      case 3: return "Momento de alavancagem";
      default: return "Base em organização";
    }
  }, [evolutionStage]);

  const progressCopy = useMemo(() => {
    if (kineticEnergy >= 100) {
      return "Sua atividade recente já permite liberar uma nova leitura da presença.";
    }

    if (kineticEnergy >= 70) {
      return "Sua presença já percebe consistência. Falta pouco para abrir a próxima leitura.";
    }

    if (kineticEnergy >= 35) {
      return "Os sinais estão ficando mais claros conforme você fecha entregas práticas.";
    }

    return "Quando você conclui etapas reais do plano, a presença ganha contexto para orientar melhor seus próximos movimentos.";
  }, [kineticEnergy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card-surface overflow-hidden border border-brand-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(231,240,255,0.88),rgba(244,247,252,0.92))] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(214,226,244,0.85))] shadow-sm">
            <Hexagon className="absolute h-8 w-8 text-brand-400" />
            <span className="z-10 font-heading text-body-sm font-bold text-brand-700">{evolutionStage}</span>
          </div>
          <div>
            <h3 className="font-heading text-h4 text-text-primary">Leitura da presença</h3>
            <p className="text-caption text-text-secondary">{stageLabel}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <p className="mb-1 text-caption text-text-muted">Sinal predominante</p>
            <p className={`font-heading text-body font-semibold ${archetype?.color || "text-text-primary"}`}>
              {archetype ? archetype.name : "Análise Pendente"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <p className="mb-1 text-caption text-text-muted">Ponto de atenção</p>
            <p className="line-clamp-2 font-heading text-body font-semibold text-brand-700">
              {fearName || "Análise Pendente"}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-500" />
              <span className="text-body-sm font-medium text-text-secondary">Reserva de impulso</span>
            </div>
            <span className="font-heading font-bold text-brand-700">{kineticEnergy}/100</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full border border-brand-100 bg-slate-200/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${kineticEnergy}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-[linear-gradient(90deg,#123a73,#4d78b7,#c6d4e6)]"
            />
          </div>
          <p className="mt-2 text-caption text-text-secondary">
            {progressCopy}
          </p>
        </div>

        <button
          onClick={onClickUpgrade}
          disabled={kineticEnergy < 100}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white/80 px-4 py-2.5 font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUpCircle className="w-4 h-4" />
          {kineticEnergy >= 100 ? "Liberar nova leitura" : "Continue usando os módulos para liberar a próxima leitura"}
        </button>
      </div>
    </motion.div>
  );
};
