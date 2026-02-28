import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RadarChartComponent } from '@/components/ui/Chart';
import { PsychProfile, PsychScoreHistory } from '@/store/psych';
import {
  interpretProfile,
  getDimensionLabel,
  getDimensionDescription,
} from '@/lib/psych-adapter';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface PsychProfileCardProps {
  profile: PsychProfile;
  scoreHistory?: PsychScoreHistory[];
  showRecommendation?: boolean;
  className?: string;
}

export const PsychProfileCard: React.FC<PsychProfileCardProps> = ({
  profile,
  scoreHistory = [],
  showRecommendation = true,
  className,
}) => {
  const interpretation = interpretProfile(profile);

  // Prepare data for radar chart
  const radarData = [
    {
      dimension: getDimensionLabel('openness'),
      score: profile.openness,
    },
    {
      dimension: getDimensionLabel('conscientiousness'),
      score: profile.conscientiousness,
    },
    {
      dimension: getDimensionLabel('extraversion'),
      score: profile.extraversion,
    },
    {
      dimension: getDimensionLabel('agreeableness'),
      score: profile.agreeableness,
    },
    {
      dimension: getDimensionLabel('neuroticism'),
      score: profile.neuroticism,
    },
  ];

  // Calculate trends if history available
  const getTrend = (dimension: keyof PsychScoreHistory) => {
    if (scoreHistory.length < 2) return null;

    const latest = scoreHistory[scoreHistory.length - 1][dimension];
    const previous = scoreHistory[scoreHistory.length - 2][dimension];
    
    if (typeof latest !== 'number' || typeof previous !== 'number') return null;
    
    const diff = latest - previous;

    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | null) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-error" />;
    if (trend === 'stable') return <Minus className="w-3 h-3 text-neutral-500" />;
    return null;
  };

  return (
    <Card className={cn('liquid-glass', className)} noPadding>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Perfil Psicológico
            </h3>
            {profile.last_assessment_date && (
              <p className="text-sm text-neutral-300 mt-1">
                Última avaliação:{' '}
                {new Date(profile.last_assessment_date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {showRecommendation && (
            <Badge
              variant={
                interpretation.recommendedMode === 'forge' ? 'warning' : 'lumina'
              }
            >
              Modo {interpretation.recommendedMode === 'forge' ? 'Forja' : 'Mapa'}
            </Badge>
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <RadarChartComponent
            data={radarData}
            dataKeys={['score']}
            nameKey="dimension"
            height={280}
          />
        </div>

        {/* Dimension Scores */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-200">
            Dimensões Detalhadas
          </h4>
          {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const).map(
            (dimension) => {
              const score = profile[dimension];
              const trend = getTrend(dimension);

              return (
                <div key={dimension} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-100">
                        {getDimensionLabel(dimension)}
                      </span>
                      {getTrendIcon(trend)}
                    </div>
                    <span className="text-sm font-semibold text-lumina-200">
                      {score}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-lumina/70 to-lumina h-2 rounded-full transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400">
                    {getDimensionDescription(dimension)}
                  </p>
                </div>
              );
            }
          )}
        </div>

        {/* Interpretation */}
        {showRecommendation && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div>
              <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                Recomendação de Interface
              </h4>
              <p className="text-sm text-neutral-300">
                {interpretation.modeReason}
              </p>
            </div>

            {interpretation.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                  Seus Pontos Fortes
                </h4>
                <ul className="space-y-1">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-success mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interpretation.considerations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                  Considerações
                </h4>
                <ul className="space-y-1">
                  {interpretation.considerations.map((consideration, idx) => (
                    <li key={idx} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-lumina-200 mt-0.5">•</span>
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
