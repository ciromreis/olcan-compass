import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTemporalMatching } from '@/hooks/useTemporalMatching';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TemporalRouteRecommendationsProps {
  limit?: number;
  onRouteSelect?: (routeId: string) => void;
  className?: string;
}

/**
 * TemporalRouteRecommendations - Exibe rotas recomendadas baseadas em preferência temporal
 * 
 * Funcionalidades:
 * - Exibe rotas que combinam com o ritmo do usuário
 * - Explicações naturais em português
 * - Animações suaves com Framer Motion
 * - Score de compatibilidade para cada rota
 * 
 * Requirements: 2.5, 2.6
 */
export const TemporalRouteRecommendations: React.FC<TemporalRouteRecommendationsProps> = ({
  limit = 10,
  onRouteSelect,
  className,
}) => {
  const { matchedRoutes, temporalPreference, isLoading, error } = useTemporalMatching(limit);

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-100 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <p className="text-sm text-neutral-600">
          Não foi possível carregar recomendações de rotas.
        </p>
      </Card>
    );
  }

  if (!matchedRoutes || matchedRoutes.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-600">
            Complete sua avaliação psicológica para receber recomendações personalizadas
          </p>
        </div>
      </Card>
    );
  }

  // Get preference category label
  const getPreferenceLabel = (preference?: number): string => {
    if (!preference) return '';
    if (preference >= 70) return 'Ritmo Acelerado';
    if (preference >= 40) return 'Ritmo Equilibrado';
    return 'Ritmo Gradual';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Rotas Recomendadas para Você
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Baseado no seu perfil: {getPreferenceLabel(temporalPreference)}
            </p>
          </div>
          {temporalPreference !== undefined && (
            <Badge variant="lumina" size="md">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{temporalPreference}% Urgência</span>
            </Badge>
          )}
        </div>

        {/* Route Cards */}
        <div className="space-y-3">
          {matchedRoutes.map((route, index) => (
            <motion.div
              key={route.route_template_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
            >
              <div
                className={cn(
                  'group relative p-4 rounded-lg border transition-all duration-200',
                  'bg-white hover:bg-lumina-50/50',
                  'border-neutral-200 hover:border-lumina-300',
                  'hover:shadow-md',
                  onRouteSelect && 'cursor-pointer'
                )}
                onClick={() => onRouteSelect?.(route.route_template_id)}
              >
                {/* Match Score Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={route.match_score >= 80 ? 'success' : 'lumina'}
                    size="sm"
                  >
                    {route.match_score}% compatível
                  </Badge>
                </div>

                <div className="space-y-3 pr-24">
                  {/* Route Title */}
                  <div>
                    <h4 className="text-base font-semibold text-neutral-900 group-hover:text-lumina-600 transition-colors">
                      {route.name_pt}
                    </h4>
                    {route.description_pt && (
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                        {route.description_pt}
                      </p>
                    )}
                  </div>

                  {/* Match Reason */}
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-lumina-400" />
                    </div>
                    <p className="text-sm text-lumina-700 font-medium italic">
                      {route.match_reason}
                    </p>
                  </div>

                  {/* Route Details */}
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.estimated_duration_months} meses</span>
                    </div>
                    {route.route_type && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-neutral-400" />
                        <span className="capitalize">{route.route_type}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button (visible on hover) */}
                  {onRouteSelect && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-lumina-600 hover:text-lumina-700"
                      >
                        <span>Ver detalhes</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-600 italic">
            Estas rotas foram selecionadas para alinhar com seu ritmo natural de trabalho.
            Você pode explorar outras rotas a qualquer momento.
          </p>
        </div>
      </div>
    </Card>
  );
};
