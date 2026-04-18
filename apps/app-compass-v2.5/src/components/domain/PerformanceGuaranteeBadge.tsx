"use client";

import React from "react";
import { Shield, TrendingUp } from "lucide-react";

export interface PerformanceGuaranteeBadgeProps {
  showDetails?: boolean;
  performanceBound?: boolean;
  successRate?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PerformanceGuaranteeBadge: React.FC<PerformanceGuaranteeBadgeProps> = ({
  showDetails = true,
  performanceBound = false,
  successRate,
  size = "md",
  className = "",
}) => {
  if (!performanceBound) {
    return null;
  }

  const formatSuccessRate = (rate?: number): string => {
    if (rate === undefined || rate === null) return "N/A";
    return `${Math.round(rate)}%`;
  };

  const getSuccessRateColor = (rate?: number): string => {
    if (!rate) return "text-cream-400";
    if (rate >= 90) return "text-sage-500";
    if (rate >= 75) return "text-brand-400";
    return "text-slate-500";
  };

  const badgeContent = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sage-300 bg-sage-50 text-sage-700 cursor-default ${
        size === "sm" ? "text-caption" : "text-body-sm"
      } ${className}`}
    >
      <Shield className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`} />
      <span className="font-medium">Garantia de Resultado</span>
    </div>
  );

  if (!showDetails) {
    return badgeContent;
  }

  return (
    <div className="group relative inline-block">
      {badgeContent}

      {/* Tooltip implementation */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
        <div className="space-y-4">
          <div>
            <p className="text-body-sm font-semibold text-slate-100 mb-1.5">
              Proteção de Pagamento com Escrow
            </p>
            <p className="text-caption text-slate-300 leading-relaxed">
              30% do pagamento fica retido até que a melhoria de prontidão seja confirmada.
              Se o resultado não for alcançado, você recebe reembolso automático.
            </p>
          </div>

          {successRate !== undefined && successRate !== null && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption font-medium text-slate-300">
                  Taxa de Sucesso do Provedor
                </span>
                <span className={`text-body-sm font-bold ${getSuccessRateColor(successRate)}`}>
                  {formatSuccessRate(successRate)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    successRate >= 90 ? "bg-sage-500" : successRate >= 75 ? "bg-brand-500" : "bg-slate-500"
                  }`}
                  style={{ width: `${Math.min(successRate, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-sage-500 mt-0.5 shrink-0" />
              <p className="text-caption text-slate-300 leading-tight">
                Melhoria mínima de 10 pontos no score de prontidão
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <p className="text-caption text-slate-300 leading-tight">
                Pagamento liberado apenas após confirmação de resultados
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-caption text-slate-400 italic">
              Esta garantia protege seu investimento e incentiva provedores a entregar resultados reais.
            </p>
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};
