import React from 'react';
import { Timeline, TimelineItem } from '@/components/ui/Timeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Route, RouteMilestone } from '@/store/route';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, Circle, Lock } from 'lucide-react';

export interface RouteTimelineProps {
  route: Route;
  onMilestoneSelect?: (milestone: RouteMilestone) => void;
  selectedMilestoneId?: string;
  showActions?: boolean;
  className?: string;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  route,
  onMilestoneSelect,
  selectedMilestoneId,
  showActions = true,
  className,
}) => {
  // Sort milestones by order
  const sortedMilestones = [...route.milestones].sort(
    (a, b) => a.order_index - b.order_index
  );
  const completedMilestones = route.milestones.filter((m) => m.completed).length;
  const progressPercentage =
    route.milestones.length > 0
      ? (completedMilestones / route.milestones.length) * 100
      : 0;

  // Determine milestone status
  const getMilestoneStatus = (
    milestone: RouteMilestone
  ): 'completed' | 'current' | 'upcoming' => {
    if (milestone.completed) return 'completed';

    // Check if dependencies are met
    const dependencies = milestone.dependencies || [];
    const allDependenciesMet = dependencies.every((depId) => {
      const depMilestone = route.milestones.find((m) => m.id === depId);
      return depMilestone?.completed;
    });

    if (!allDependenciesMet) return 'upcoming';

    // Check if this is the next available milestone
    const previousMilestones = sortedMilestones.filter(
      (m) => m.order_index < milestone.order_index
    );
    const allPreviousCompleted = previousMilestones.every((m) => m.completed);

    return allPreviousCompleted ? 'current' : 'upcoming';
  };

  // Convert milestones to timeline items
  const timelineItems: TimelineItem[] = sortedMilestones.map((milestone) => {
    const status = getMilestoneStatus(milestone);
    const hasUnmetDependencies =
      milestone.dependencies &&
      milestone.dependencies.length > 0 &&
      !milestone.dependencies.every((depId) => {
        const depMilestone = route.milestones.find((m) => m.id === depId);
        return depMilestone?.completed;
      });

    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description || undefined,
      date: milestone.target_date
        ? new Date(milestone.target_date).toLocaleDateString('pt-BR')
        : undefined,
      status,
      icon: hasUnmetDependencies ? (
        <Lock className="w-5 h-5" />
      ) : status === 'completed' ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <Circle className="w-4 h-4" />
      ),
    };
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Route Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {route.name}
            </h3>
            {route.description && (
              <p className="text-sm text-neutral-600 mt-1">
                {route.description}
              </p>
            )}
          </div>
          <Badge variant="lumina">
            {completedMilestones} /{' '}
            {route.milestones.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-lumina-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <Timeline items={timelineItems} orientation="vertical" />

      {/* Milestone Details (if selected) */}
      {selectedMilestoneId && (
        <div className="border-t border-neutral-200 pt-6">
          {sortedMilestones
            .filter((m) => m.id === selectedMilestoneId)
            .map((milestone) => {
              const status = getMilestoneStatus(milestone);
              const dependencies = milestone.dependencies || [];
              const dependencyMilestones = dependencies
                .map((depId) => route.milestones.find((m) => m.id === depId))
                .filter(Boolean) as RouteMilestone[];

              return (
                <div key={milestone.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-neutral-900">
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        status === 'completed'
                          ? 'success'
                          : status === 'current'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {status === 'completed'
                        ? 'Concluído'
                        : status === 'current'
                        ? 'Em Andamento'
                        : 'Pendente'}
                    </Badge>
                  </div>

                  {/* Target Date */}
                  {milestone.target_date && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Data alvo:{' '}
                        {new Date(milestone.target_date).toLocaleDateString(
                          'pt-BR',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {/* Dependencies */}
                  {dependencyMilestones.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-neutral-700">
                        Dependências
                      </h5>
                      <ul className="space-y-1">
                        {dependencyMilestones.map((dep) => (
                          <li
                            key={dep.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            {dep.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-400" />
                            )}
                            <span
                              className={cn(
                                dep.completed
                                  ? 'text-neutral-600 line-through'
                                  : 'text-neutral-900'
                              )}
                            >
                              {dep.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {showActions && status === 'current' && !milestone.completed && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onMilestoneSelect?.(milestone)}
                      >
                        Marcar como Concluído
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Interactive Milestone Selection */}
      {!selectedMilestoneId && onMilestoneSelect && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neutral-700">
            Marcos Disponíveis
          </h4>
          <div className="space-y-2">
            {sortedMilestones
              .filter((m) => !m.completed && getMilestoneStatus(m) === 'current')
              .map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => onMilestoneSelect(milestone)}
                  className="w-full text-left px-4 py-3 bg-lumina-50 hover:bg-lumina-100 border border-lumina-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900">
                      {milestone.title}
                    </span>
                    {milestone.target_date && (
                      <span className="text-xs text-neutral-600">
                        {new Date(milestone.target_date).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
