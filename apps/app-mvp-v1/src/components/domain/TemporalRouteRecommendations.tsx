import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, Calendar, ArrowRight } from 'lucide-react';
import type { RouteTemplate } from '@/store/route';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';

interface TemporalRouteRecommendationsProps {
  templates: RouteTemplate[];
  className?: string;
}

export function TemporalRouteRecommendations({ templates, className }: TemporalRouteRecommendationsProps) {
  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const aDuration = a.estimated_duration_months || 0;
      const bDuration = b.estimated_duration_months || 0;
      return aDuration - bDuration;
    });
  }, [templates]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-brand-500" />
          <h3 className="font-heading text-h4 text-text-primary">Recomendações Temporais</h3>
        </div>

        <div className="space-y-4">
          {sortedTemplates.length > 0 ? (
            sortedTemplates.slice(0, 3).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-cream-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Map className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {template.name_pt || template.name_en || 'Rota'}
                    </h4>
                    <p className="text-body-xs text-text-muted">
                      {template.description_pt || template.description_en || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-body-xs text-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDuration(template.estimated_duration_months || 0)}</span>
                  </div>
                  <Badge variant={template.competitiveness === 'low' ? 'sage' : template.competitiveness === 'medium' ? 'moss' : 'clay'}>
                    {template.competitiveness}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 mx-auto mb-2 text-text-muted" />
              <p className="text-body-sm text-text-muted">Nenhuma recomendação disponível</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
