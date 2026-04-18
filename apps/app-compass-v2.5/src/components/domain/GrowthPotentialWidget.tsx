"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Map, Users } from "lucide-react";

interface Opportunity {
  id: string;
  competitiveness?: "low" | "medium" | "high";
  growth_potential?: "low" | "medium" | "high";
  market_demand?: "low" | "medium" | "high";
  alignment_score?: number;
  location?: string;
  [key: string]: unknown;
}

interface GrowthPotentialWidgetProps {
  opportunity: Opportunity;
  className?: string;
}

export const GrowthPotentialWidget: React.FC<GrowthPotentialWidgetProps> = ({
  opportunity,
  className = "",
}) => {
  const potentialScore = useMemo(() => {
    let score = 50;

    if (opportunity.competitiveness === "low") score += 30;
    else if (opportunity.competitiveness === "medium") score += 20;
    else if (opportunity.competitiveness === "high") score += 10;

    if (opportunity.growth_potential === "high") score += 20;
    else if (opportunity.growth_potential === "medium") score += 10;

    if (opportunity.market_demand === "high") score += 15;
    else if (opportunity.market_demand === "medium") score += 7;

    return Math.min(100, Math.max(0, score));
  }, [opportunity]);

  const { label, colorPrefix } = useMemo(() => {
    if (potentialScore >= 80) return { label: "Excelente", colorPrefix: "sage" };
    if (potentialScore >= 60) return { label: "Boa", colorPrefix: "moss" };
    if (potentialScore >= 40) return { label: "Média", colorPrefix: "cream" };
    return { label: "Baixa", colorPrefix: "red" };
  }, [potentialScore]);

  // Dynamic classes for progress bar
  const getProgressColors = (prefix: string) => {
    switch (prefix) {
      case "sage": return "bg-sage-500";
      case "moss": return "bg-moss-500";
      case "red": return "bg-red-500";
      case "cream":
      default: return "bg-cream-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card-surface p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-brand-500" />
        <h3 className="font-heading text-h4 text-text-primary">Potencial de Crescimento</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-body-sm text-text-secondary mb-1 uppercase tracking-wider font-semibold">Score de Oportunidade</p>
          <p className="font-heading text-h1 text-brand-600 leading-none">
            {potentialScore}
            <span className="text-h3 text-brand-400/60">%</span>
          </p>
        </div>
        <div className="text-right">
          <p className={`text-body font-heading font-semibold capitalize text-${colorPrefix}-600`}>
            {label}
          </p>
          <p className="text-caption text-text-muted mt-0.5">Visão longo prazo</p>
        </div>
      </div>

      {/* Inline Native Progress Bar */}
      <div className="w-full h-2.5 bg-cream-100 rounded-full overflow-hidden mb-6 border border-cream-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${potentialScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${getProgressColors(colorPrefix)}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-body-sm text-text-secondary bg-cream-50 p-2 rounded-lg border border-cream-200">
          <Target className="w-4 h-4 text-brand-400" />
          <span className="truncate">Fit: {opportunity.alignment_score ? `${opportunity.alignment_score}%` : "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-text-secondary bg-cream-50 p-2 rounded-lg border border-cream-200">
          <Map className="w-4 h-4 text-brand-400" />
          <span className="truncate capitalize">{opportunity.location || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-text-secondary bg-cream-50 p-2 rounded-lg border border-cream-200">
          <Users className="w-4 h-4 text-brand-400" />
          <span className="truncate capitalize">{opportunity.competitiveness || "N/A"}</span>
        </div>
      </div>
    </motion.div>
  );
};
