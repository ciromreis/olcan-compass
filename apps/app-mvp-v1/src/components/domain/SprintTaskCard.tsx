import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export interface SprintTask {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  order: number;
  dependencies?: string[];
  notes?: string;
  estimated_duration?: number; // minutes
}

export interface SprintTaskCardProps {
  task: SprintTask;
  allTasks: SprintTask[];
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onUpdateNotes?: (taskId: string, notes: string) => void;
  showDependencies?: boolean;
  className?: string;
}

export const SprintTaskCard: React.FC<SprintTaskCardProps> = ({
  task,
  allTasks,
  onToggleComplete,
  onUpdateNotes,
  showDependencies = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Check if dependencies are met
  const dependencies = task.dependencies || [];
  const dependencyTasks = dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter(Boolean) as SprintTask[];

  const allDependenciesMet = dependencyTasks.every((dep) => dep.completed);
  const isLocked = dependencies.length > 0 && !allDependenciesMet;

  const handleToggleComplete = () => {
    if (isLocked) return;
    onToggleComplete?.(task.id, !task.completed);
  };

  const handleSaveNotes = () => {
    onUpdateNotes?.(task.id, notes);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(task.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <Card
      className={cn(
        'liquid-glass transition-all',
        isLocked && 'opacity-60',
        className
      )}
      noPadding
    >
      <div className="p-4 space-y-3">
        {/* Main Task Row */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-0.5">
            {isLocked ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <Lock className="w-4 h-4 text-neutral-400" />
              </div>
            ) : (
              <Checkbox
                checked={task.completed}
                onChange={handleToggleComplete}
                disabled={isLocked}
              />
            )}
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    task.completed
                      ? 'text-neutral-400 line-through'
                      : 'text-white'
                  )}
                >
                  {task.name}
                </h4>
                {task.description && (
                  <p
                    className={cn(
                      'text-sm mt-1',
                      task.completed ? 'text-neutral-400' : 'text-neutral-300'
                    )}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {task.completed && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Concluída
                  </Badge>
                )}
                {isLocked && (
                  <Badge variant="default" size="sm">
                    <Lock className="w-3 h-3" />
                    Bloqueada
                  </Badge>
                )}
                {task.estimated_duration && (
                  <Badge variant="default" size="sm">
                    {task.estimated_duration} min
                  </Badge>
                )}
              </div>
            </div>

            {/* Expand/Collapse Button */}
            {(showDependencies && dependencyTasks.length > 0) ||
            task.notes ||
            !task.completed ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-cyan hover:text-cyan-400 mt-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Ocultar detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Ver detalhes
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="pl-8 space-y-3 pt-2 border-t border-white/10">
            {/* Dependencies */}
            {showDependencies && dependencyTasks.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-neutral-200">
                  Dependências
                </h5>
                <ul className="space-y-1">
                  {dependencyTasks.map((dep) => (
                    <li
                      key={dep.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {dep.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-400" />
                      )}
                      <span
                        className={cn(
                          dep.completed
                            ? 'text-neutral-400 line-through'
                            : 'text-neutral-100'
                        )}
                      >
                        {dep.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {!task.completed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-neutral-200">
                    Notas
                  </h5>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-cyan hover:text-cyan-400"
                    >
                      {task.notes ? 'Editar' : 'Adicionar'}
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione notas sobre esta tarefa..."
                      className={cn(
                        'w-full min-h-[80px] p-3 rounded-xl border border-white/10',
                        'bg-neutral-900/30 text-neutral-100 placeholder:text-neutral-500',
                        'focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/30',
                        'resize-y text-sm'
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveNotes}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelNotes}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : task.notes ? (
                  <p className="text-sm text-neutral-300 bg-neutral-800/30 border border-white/10 p-3 rounded-xl">
                    {task.notes}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500 italic">
                    Nenhuma nota adicionada
                  </p>
                )}
              </div>
            )}

            {/* Completed Notes (read-only) */}
            {task.completed && task.notes && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-neutral-200">Notas</h5>
                <p className="text-sm text-neutral-300 bg-neutral-900/30 border border-white/10 p-3 rounded-xl">
                  {task.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
