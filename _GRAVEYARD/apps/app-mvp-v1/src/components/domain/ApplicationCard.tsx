import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import type { UserApplication } from '@/store/application';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDeadline } from '@/lib/utils';

interface ApplicationCardProps {
  application: UserApplication;
  className?: string;
}

export function ApplicationCard({ application, className }: ApplicationCardProps) {
  const statusColor = useMemo(() => {
    switch (application.status) {
      case 'submitted':
        return 'blue';
      case 'accepted':
        return 'sage';
      case 'rejected':
        return 'clay';
      case 'urgent':
        return 'clay';
      default:
        return 'default';
    }
  }, [application.status]);

  const statusLabel = useMemo(() => {
    switch (application.status) {
      case 'submitted':
        return 'Enviada';
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Rejeitada';
      case 'urgent':
        return 'Urgente';
      default:
        return application.status;
    }
  }, [application.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-5 ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-heading text-h4 text-text-primary truncate">
                {application.program}
              </h3>
              <p className="text-body-sm text-text-secondary truncate">
                {application.institution}
              </p>
            </div>
          </div>
          <Badge variant={statusColor}>
            {statusLabel}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Calendar className="w-3 h-3" />
            <span>Deadline: {formatDeadline(application.deadline)}</span>
          </div>
          {application.documents && application.documents.length > 0 && (
            <div className="flex items-center gap-2 text-body-xs text-text-muted">
              <FileText className="w-3 h-3" />
              <span>{application.documents.filter((d) => d.status === 'ready').length} de {application.documents.length} documentos prontos</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {application.status === 'urgent' && (
              <div className="flex items-center gap-1 text-body-xs text-clay-600 font-medium">
                <AlertTriangle className="w-3 h-3" />
                Urgente
              </div>
            )}
          </div>
          {application.deadline && (
            <span className="text-body-xs text-text-muted">
              {formatDeadline(application.deadline)}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
