import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Map, Users } from 'lucide-react';
import type { Opportunity } from '@/store/application';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface GrowthPotentialWidgetProps {
  opportunity: Opportunity;
  className?: string;
}

export function GrowthPotentialWidget({ opportunity, className }: GrowthPotentialWidgetProps) {
  const potentialScore = useMemo(() => {
    // Calculate potential score based on various factors
    let score = 50;

    // Base score from competitiveness
    if (opportunity.competitiveness === 'low') score += 30;
    else if (opportunity.competitiveness === 'medium') score += 20;
    else if (opportunity.competitiveness === 'high') score += 10;

    // Bonus for growth potential
    if (opportunity.growth_potential === 'high') score += 20;
    else if (opportunity.growth_potential === 'medium') score += 10;

    // Bonus for market demand
    if (opportunity.market_demand === 'high') score += 15;
    else if (opportunity.market_demand === 'medium') score += 7;

    return Math.min(100, score);
  }, [opportunity]);

  const potentialLabel = useMemo(() => {
    if (potentialScore >= 80) return 'Excelente';
    if (potentialScore >= 60) return 'Boa';
    if (potentialScore >= 40) return 'Média';
    return 'Baixa';
  }, [potentialScore]);

  const potentialColor = useMemo(() => {
    if (potentialScore >= 80) return 'sage';
    if (potentialScore >= 60) return 'moss';
    if (potentialScore >= 40) return 'clay';
    return 'clay';
  }, [potentialScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          <h3 className="font-heading text-h4 text-text-primary">Potencial de Crescimento</h3>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-body-sm text-text-secondary mb-1">Score de Potencial</p>
            <p className="font-heading text-h1 text-brand-500 leading-none">
              {potentialScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-sm font-medium text-text-primary">{potentialLabel}</p>
            <p className="text-caption text-text-muted">Avaliação de longo prazo</p>
          </div>
        </div>

        <Progress
          value={potentialScore}
          variant={potentialColor}
          size="md"
          className="mb-4"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Target className="w-3 h-3" />
            <span>Alinhamento: {opportunity.alignment_score || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Map className="w-3 h-3" />
            <span>Localização: {opportunity.location || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Users className="w-3 h-3" />
            <span>Concorrência: {opportunity.competitiveness || 'N/A'}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
