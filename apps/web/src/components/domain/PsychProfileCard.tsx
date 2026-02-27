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
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-semantic-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-semantic-error" />;
    if (trend === 'stable') return <Minus className="w-3 h-3 text-neutral-500" />;
    return null;
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Perfil Psicológico
            </h3>
            {profile.last_assessment_date && (
              <p className="text-sm text-neutral-600 mt-1">
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
        <div className="bg-neutral-50 rounded-lg p-4">
          <RadarChartComponent
            data={radarData}
            dataKeys={['score']}
            nameKey="dimension"
            height={280}
          />
        </div>

        {/* Dimension Scores */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-700">
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
                      <span className="text-sm font-medium text-neutral-900">
                        {getDimensionLabel(dimension)}
                      </span>
                      {getTrendIcon(trend)}
                    </div>
                    <span className="text-sm font-semibold text-lumina-600">
                      {score}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-lumina-600 h-2 rounded-full transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-600">
                    {getDimensionDescription(dimension)}
                  </p>
                </div>
              );
            }
          )}
        </div>

        {/* Interpretation */}
        {showRecommendation && (
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                Recomendação de Interface
              </h4>
              <p className="text-sm text-neutral-600">
                {interpretation.modeReason}
              </p>
            </div>

            {interpretation.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                  Seus Pontos Fortes
                </h4>
                <ul className="space-y-1">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-semantic-success mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interpretation.considerations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-2">
                  Considerações
                </h4>
                <ul className="space-y-1">
                  {interpretation.considerations.map((consideration, idx) => (
                    <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-lumina-600 mt-0.5">•</span>
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
