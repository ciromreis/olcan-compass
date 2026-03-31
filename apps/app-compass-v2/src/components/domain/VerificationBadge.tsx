"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { useEconomicsStore } from "@/stores/economics";

// Note: Ensure @/components/ui/Badge and Tooltip exist in V2, if not we fall back to generic divs
// Using standard V2 tailwind tokens

export interface VerificationBadgeProps {
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  showTooltip = true,
  size = "md",
  className = "",
}) => {
  const { credentials, hasActiveCredential, isLoading, copyVerificationLink } = useEconomicsStore();
  const [copied, setCopied] = React.useState(false);

  const activeCredential = credentials.find((c) => c.is_active);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (isLoading || !hasActiveCredential() || !activeCredential) {
    return null;
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyVerificationLink(activeCredential.verification_url);
    if (success) {
      setCopied(true);
    }
  };

  const getCredentialTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      readiness: "Prontidão",
      milestone: "Marco",
      assessment: "Avaliação",
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const badgeContent = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sage-300 bg-sage-50 text-sage-700 cursor-default ${
        size === "sm" ? "text-caption" : "text-body-sm"
      } ${className}`}
    >
      <CheckCircle2 className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`} />
      <span className="font-medium">Perfil Verificado</span>
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <div className="group relative inline-block">
      {badgeContent}
      
      {/* Tooltip implementation */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
        <div className="space-y-3">
          <div>
            <p className="text-caption font-medium text-slate-300 mb-0.5">
              Credencial de {getCredentialTypeName(activeCredential.credential_type)}
            </p>
            <p className="text-body-sm text-slate-100">
              Score: <span className="font-semibold text-brand-400">{activeCredential.score_value}</span>/100
            </p>
          </div>

          <div className="text-caption text-slate-400 space-y-0.5">
            <p>Emitida: {formatDate(activeCredential.issued_at)}</p>
            {activeCredential.expires_at && (
              <p>Válida até: {formatDate(activeCredential.expires_at)}</p>
            )}
            {activeCredential.verification_clicks > 0 && (
              <p className="text-brand-300">Verificações de perfil: {activeCredential.verification_clicks}</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-caption font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sage-400" />
                  <span className="text-sage-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Validação</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};
