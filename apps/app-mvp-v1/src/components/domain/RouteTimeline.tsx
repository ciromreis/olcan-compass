import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import type { Route, RouteMilestone } from '@/store/route';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDeadline } from '@/lib/utils';

interface RouteTimelineProps {
  route: Route;
  milestones: RouteMilestone[];
  className?: string;
}

export function RouteTimeline({ route, milestones, className }: RouteTimelineProps) {
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return aDate - bDate;
    });
  }, [milestones]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-sage-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Map className="w-5 h-5 text-brand-500" />
        <h3 className="font-heading text-h4 text-text-primary">Linha do Tempo</h3>
      </div>

      <div className="space-y-4">
        {sortedMilestones.length > 0 ? (
          sortedMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(milestone.status || 'pending')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-body-sm font-medium text-text-primary truncate">
                    {milestone.name_pt || milestone.name_en || 'Milestone'}
                  </h4>
                  {milestone.due_date && (
                    <span className="text-caption text-text-muted">
                      {formatDeadline(milestone.due_date)}
                    </span>
                  )}
                </div>
                <p className="text-body-xs text-text-secondary mb-2">
                  {milestone.description_pt || milestone.description_en || ''}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={milestone.status === 'completed' ? 'success' : 'default'}>
                    {milestone.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                  {milestone.category && (
                    <span className="text-caption text-text-muted">
                      {milestone.category}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-text-muted" />
            <p className="text-body-sm text-text-muted">Nenhum milestone definido</p>
          </div>
        )}
      </div>
    </Card>
  );
}
