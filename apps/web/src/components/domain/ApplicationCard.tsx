import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDeadline, daysUntil } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface Application {
  id: string;
  opportunity_id: string;
  opportunity_name: string;
  opportunity_type?: string;
  institution?: string;
  location?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  deadline?: string;
  match_score?: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCardProps {
  application: Application;
  onViewDetails?: (applicationId: string) => void;
  onUpdateStatus?: (applicationId: string, status: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetails,
  onUpdateStatus,
  showActions = true,
  compact = false,
  className,
}) => {
  const getStatusVariant = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' | 'lumina' => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'submitted':
        return 'lumina';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'submitted':
        return 'Enviada';
      case 'under_review':
        return 'Em Análise';
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDeadlineUrgency = (deadline?: string): 'critical' | 'warning' | 'normal' => {
    if (!deadline) return 'normal';
    const days = daysUntil(deadline);
    if (days < 0) return 'critical';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'normal';
  };

  const deadlineUrgency = getDeadlineUrgency(application.deadline);

  if (compact) {
    return (
      <Card
        className={cn(
          'p-4 hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
        onClick={() => onViewDetails?.(application.id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-neutral-900 truncate">
              {application.opportunity_name}
            </h4>
            {application.institution && (
              <p className="text-xs text-neutral-600 mt-1 truncate">
                {application.institution}
              </p>
            )}
          </div>
          <Badge variant={getStatusVariant(application.status)} size="sm">
            {getStatusLabel(application.status)}
          </Badge>
        </div>
        {application.deadline && (
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600">
            <Calendar className="w-3 h-3" />
            <span>{formatDeadline(application.deadline)}</span>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {application.opportunity_name}
                </h3>
                {application.opportunity_type && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {application.opportunity_type}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(application.status)}>
              {getStatusIcon(application.status)}
              {getStatusLabel(application.status)}
            </Badge>
            {application.match_score !== undefined && (
              <Badge variant="lumina" size="sm">
                <TrendingUp className="w-3 h-3" />
                {application.match_score}% match
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {application.institution && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Building2 className="w-4 h-4 text-neutral-500" />
              <span>{application.institution}</span>
            </div>
          )}
          {application.location && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>{application.location}</span>
            </div>
          )}
        </div>

        {/* Deadline */}
        {application.deadline && (
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              deadlineUrgency === 'critical' &&
                'bg-semantic-error/10 border border-semantic-error/30',
              deadlineUrgency === 'warning' &&
                'bg-semantic-warning/10 border border-semantic-warning/30',
              deadlineUrgency === 'normal' &&
                'bg-neutral-100 border border-neutral-200'
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar
                className={cn(
                  'w-4 h-4',
                  deadlineUrgency === 'critical' && 'text-semantic-error',
                  deadlineUrgency === 'warning' && 'text-semantic-warning',
                  deadlineUrgency === 'normal' && 'text-neutral-600'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  deadlineUrgency === 'critical' && 'text-semantic-error',
                  deadlineUrgency === 'warning' && 'text-semantic-warning',
                  deadlineUrgency === 'normal' && 'text-neutral-700'
                )}
              >
                {formatDeadline(application.deadline)}
              </span>
            </div>
            {deadlineUrgency === 'critical' && daysUntil(application.deadline) >= 0 && (
              <Badge variant="error" size="sm">
                Urgente
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails?.(application.id)}
            >
              Ver Detalhes
              <ExternalLink className="w-4 h-4" />
            </Button>
            {application.status === 'draft' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onUpdateStatus?.(application.id, 'submitted')}
              >
                Enviar Candidatura
              </Button>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
          <span>
            Criada em {new Date(application.created_at).toLocaleDateString('pt-BR')}
          </span>
          <span>
            Atualizada {new Date(application.updated_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </Card>
  );
};
