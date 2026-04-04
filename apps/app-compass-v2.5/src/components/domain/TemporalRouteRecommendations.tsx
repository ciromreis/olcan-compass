"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Map, Calendar, ArrowRight } from "lucide-react";

// Assuming RouteTemplate interface from routes.ts
// We redefine the subset here if needed to avoid deep coupling, or import from store.
// We'll use a local minimal interface to make the component resilient.
interface TemporalRouteTemplate {
  id: string;
  name_pt?: string;
  name_en?: string;
  description_pt?: string;
  description_en?: string;
  estimated_duration_months?: number;
  competitiveness?: "low" | "medium" | "high";
}

interface TemporalRouteRecommendationsProps {
  templates: TemporalRouteTemplate[];
  className?: string;
}

export const TemporalRouteRecommendations: React.FC<TemporalRouteRecommendationsProps> = ({ 
  templates, 
  className = "" 
}) => {
  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const aDuration = a.estimated_duration_months || 0;
      const bDuration = b.estimated_duration_months || 0;
      return aDuration - bDuration;
    });
  }, [templates]);

  const formatDuration = (months: number) => {
    if (!months) return "Flexível";
    if (months < 12) return `${months} meses`;
    const years = Math.floor(months / 12);
    const m = months % 12;
    return `${years} ano${years > 1 ? "s" : ""} ${m > 0 ? `e ${m} m` : ""}`;
  };

  const getCompetitivenessColor = (level?: string) => {
    switch (level) {
      case "low": return "bg-sage-100 text-sage-700 border-sage-200";
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium":
      default: return "bg-blue-100 text-blue-700 border-blue-200";
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
        <Clock className="w-5 h-5 text-brand-500" />
        <h3 className="font-heading text-h4 text-text-primary">Rotas Temporais</h3>
      </div>

      <div className="space-y-4">
        {sortedTemplates.length > 0 ? (
          sortedTemplates.slice(0, 3).map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border border-cream-200 hover:border-brand-300 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-heading font-medium text-body text-text-primary group-hover:text-brand-600 transition-colors line-clamp-1">
                    {template.name_pt || template.name_en || "Rota Estratégica"}
                  </h4>
                  <p className="text-body-xs text-text-muted line-clamp-1 mt-0.5">
                    {template.description_pt || template.description_en || "Baseado no seu perfil Aura"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 pl-4">
                <div className="flex items-center gap-1.5 text-body-sm font-medium text-text-secondary">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span>{formatDuration(template.estimated_duration_months || 0)}</span>
                </div>
                {template.competitiveness && (
                  <span className={`px-2 py-0.5 rounded-full border text-caption font-medium capitalize ${getCompetitivenessColor(template.competitiveness)}`}>
                    {template.competitiveness === "low" ? "Baixa" : template.competitiveness === "medium" ? "Média" : "Alta"}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 transition-colors" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 bg-cream-50 rounded-xl border border-dashed border-cream-300">
            <Clock className="w-8 h-8 mx-auto mb-3 text-cream-400" />
            <p className="text-body-sm text-text-muted font-medium">Nenhuma recomendação temporal disponível</p>
            <p className="text-caption text-text-muted mt-1">Conclua o diagnóstico para destravar rotas</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
