import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOpportunityCost } from '@/hooks/useOpportunityCost';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GrowthPotentialWidgetProps {
  opportunityId?: string;
  opportunityCostDaily?: number;
  onUpgradeClick?: (tier: 'pro' | 'premium') => void;
  className?: string;
}

/**
 * GrowthPotentialWidget - Exibe custo de oportunidade durante baixo momentum
 * 
 * Funcionalidades:
 * - Exibe custo de oportunidade acumulado
 * - Mensagens motivacionais em português
 * - CTA para upgrade Pro/Premium
 * - Rastreamento automático de impressões e cliques
 * - Só renderiza quando shouldShowWidget é true
 * 
 * Requirements: 3.5, 3.6, 3.7
 */
export const GrowthPotentialWidget: React.FC<GrowthPotentialWidgetProps> = ({
  opportunityId,
  opportunityCostDaily = 0,
  onUpgradeClick,
  className,
}) => {
  const {
    shouldShowWidget,
    momentum,
    milestonesCompleted30d,
    trackImpression,
    trackClick,
    isLoadingMomentum,
  } = useOpportunityCost();

  const hasTrackedImpression = useRef(false);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track impression when widget becomes visible
  useEffect(() => {
    if (shouldShowWidget && !hasTrackedImpression.current && opportunityCostDaily > 0) {
      trackImpression({
        opportunity_id: opportunityId,
        opportunity_cost_shown: opportunityCostDaily,
        session_id: sessionId.current,
      });
      hasTrackedImpression.current = true;
    }
  }, [shouldShowWidget, opportunityId, opportunityCostDaily, trackImpression]);

  // Don't render if loading or widget shouldn't be shown
  if (isLoadingMomentum || !shouldShowWidget) {
    return null;
  }

  // Calculate cumulative opportunity cost (30 days)
  const cumulativeCost = opportunityCostDaily * 30;

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleUpgradeClick = (tier: 'pro' | 'premium') => {
    // Track click event
    trackClick({
      opportunity_id: opportunityId,
      session_id: sessionId.current,
    });

    // Call parent handler
    onUpgradeClick?.(tier);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
      className={className}
    >
      <Card
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-br from-lumina-50 via-white to-lumina-50/30',
          'border-lumina-200 shadow-lg'
        )}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lumina-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-semantic-success/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-lumina-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-lumina-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                Potencial de Crescimento
              </h3>
              <p className="text-sm text-neutral-600 mt-0.5">
                Acelere sua jornada com ferramentas premium
              </p>
            </div>
          </div>

          {/* Momentum Status */}
          <div className="p-3 bg-white/80 rounded-lg border border-lumina-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700">
                Momentum Atual
              </span>
              <span className="text-xs text-neutral-600">
                {milestonesCompleted30d || 0} marcos em 30 dias
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-lumina-400 to-lumina-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((momentum || 0) * 20, 100)}%` }}
              />
            </div>
          </div>

          {/* Opportunity Cost Display */}
          {opportunityCostDaily > 0 && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <TrendingUp className="w-5 h-5 text-semantic-success mt-1" />
                <div>
                  <p className="text-sm text-neutral-700">
                    Cada dia de preparação te aproxima de
                  </p>
                  <p className="text-2xl font-bold text-lumina-700 mt-1">
                    {formatCurrency(opportunityCostDaily)}<span className="text-base font-normal text-neutral-600">/mês</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-semantic-success/5 border border-semantic-success/20 rounded-lg">
                <p className="text-xs text-neutral-700">
                  <span className="font-semibold">Potencial acumulado:</span>{' '}
                  {formatCurrency(cumulativeCost)} em oportunidades nos próximos 30 dias
                </p>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="pt-2">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Ferramentas premium ajudam você a manter o ritmo e alcançar seus objetivos mais rapidamente.
              Desbloqueie recursos avançados de planejamento e acompanhamento.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleUpgradeClick('premium')}
              className="flex-1 bg-gradient-to-r from-lumina-600 to-lumina-700 hover:from-lumina-700 hover:to-lumina-800"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade para Premium</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleUpgradeClick('pro')}
              className="flex-1"
            >
              <span>Ver Plano Pro</span>
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-neutral-600 italic text-center pt-2">
            Investir em sua preparação é investir em seu futuro
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
