import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PerformanceGuaranteeBadgeProps {
  showDetails?: boolean;
  performanceBound?: boolean;
  successRate?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * PerformanceGuaranteeBadge - Exibe badge "Garantia de Resultado" em serviços
 * 
 * Funcionalidades:
 * - Badge "Garantia de Resultado" para serviços com performance_bound
 * - Tooltip explicando proteção de escrow
 * - Exibe taxa de sucesso do provedor
 * - Usa tokens MMXD para estilização
 * 
 * Requirements: 4.3
 */
export const PerformanceGuaranteeBadge: React.FC<PerformanceGuaranteeBadgeProps> = ({
  showDetails = true,
  performanceBound = false,
  successRate,
  size = 'md',
  className,
}) => {
  // Don't render if service doesn't have performance guarantee
  if (!performanceBound) {
    return null;
  }

  // Format success rate as percentage
  const formatSuccessRate = (rate?: number): string => {
    if (rate === undefined || rate === null) return 'N/A';
    return `${Math.round(rate)}%`;
  };

  // Get success rate color
  const getSuccessRateColor = (rate?: number): string => {
    if (!rate) return 'text-neutral-600';
    if (rate >= 90) return 'text-semantic-success';
    if (rate >= 75) return 'text-lumina-600';
    return 'text-warning';
  };

  const badgeContent = (
    <Badge
      variant="success"
      size={size}
      className={cn('cursor-default', className)}
    >
      <Shield className="w-3.5 h-3.5" />
      <span>Garantia de Resultado</span>
    </Badge>
  );

  if (!showDetails) {
    return badgeContent;
  }

  const tooltipContent = (
    <div className="space-y-3 min-w-[260px]">
      <div>
        <p className="text-xs font-semibold text-lux-100 mb-2">
          Proteção de Pagamento com Escrow
        </p>
        <p className="text-xs text-lux-200 leading-relaxed">
          30% do pagamento fica retido até que a melhoria de prontidão seja confirmada.
          Se o resultado não for alcançado, você recebe reembolso automático.
        </p>
      </div>

      {successRate !== undefined && successRate !== null && (
        <div className="pt-2 border-t border-neutral-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-lux-100">
              Taxa de Sucesso do Provedor
            </span>
            <span className={cn('text-sm font-bold', getSuccessRateColor(successRate))}>
              {formatSuccessRate(successRate)}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                successRate >= 90
                  ? 'bg-semantic-success'
                  : successRate >= 75
                  ? 'bg-lumina-600'
                  : 'bg-warning'
              )}
              style={{ width: `${Math.min(successRate, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-neutral-600 space-y-2">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-semantic-success mt-0.5 flex-shrink-0" />
          <p className="text-xs text-lux-200">
            Melhoria mínima de 10 pontos no score de prontidão
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-lumina-300 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-lux-200">
            Pagamento liberado apenas após confirmação de resultados
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-600">
        <p className="text-xs text-lux-300 italic">
          Esta garantia protege seu investimento e incentiva provedores a entregar resultados reais
        </p>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="bottom" delay={300}>
      {badgeContent}
    </Tooltip>
  );
};
