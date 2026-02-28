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
      <Card className={cn('liquid-glass', className)} noPadding>
        <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-700/60 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-800/40 border border-white/10 rounded-xl" />
            ))}
          </div>
        </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('liquid-glass', className)} noPadding>
        <div className="p-6">
        <p className="text-sm text-neutral-300">
          Não foi possível carregar recomendações de rotas.
        </p>
        </div>
      </Card>
    );
  }

  if (!matchedRoutes || matchedRoutes.length === 0) {
    return (
      <Card className={cn('liquid-glass', className)} noPadding>
        <div className="p-6 text-center py-8">
          <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-300">
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
    <Card className={cn('liquid-glass', className)} noPadding>
      <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Rotas Recomendadas para Você
            </h3>
            <p className="text-sm text-neutral-300 mt-1">
              Baseado no seu perfil: {getPreferenceLabel(temporalPreference)}
            </p>
          </div>
          {temporalPreference !== undefined && (
            <Badge variant="lumina" size="md" className="font-mono">
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
                  'bg-neutral-800/30 hover:bg-neutral-800/40',
                  'border-white/10 hover:border-lumina-200/30',
                  'hover:shadow-card',
                  onRouteSelect && 'cursor-pointer'
                )}
                onClick={() => onRouteSelect?.(route.route_template_id)}
              >
                {/* Match Score Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={route.match_score >= 80 ? 'success' : 'lumina'}
                    size="sm"
                    className="font-mono"
                  >
                    {route.match_score}% compatível
                  </Badge>
                </div>

                <div className="space-y-3 pr-24">
                  {/* Route Title */}
                  <div>
                    <h4 className="text-base font-semibold text-white group-hover:text-lumina-200 transition-colors">
                      {route.name_pt}
                    </h4>
                    {route.description_pt && (
                      <p className="text-sm text-neutral-300 mt-1 line-clamp-2">
                        {route.description_pt}
                      </p>
                    )}
                  </div>

                  {/* Match Reason */}
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-lumina-400" />
                    </div>
                    <p className="text-sm text-lumina-200 font-medium italic">
                      {route.match_reason}
                    </p>
                  </div>

                  {/* Route Details */}
                  <div className="flex items-center gap-4 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.estimated_duration_months} meses</span>
                    </div>
                    {route.route_type && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-neutral-500" />
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
                        className="text-lumina-200 hover:text-lumina-100"
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
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-neutral-400 italic">
            Estas rotas foram selecionadas para alinhar com seu ritmo natural de trabalho.
            Você pode explorar outras rotas a qualquer momento.
          </p>
        </div>
      </div>
      </div>
    </Card>
  );
};
