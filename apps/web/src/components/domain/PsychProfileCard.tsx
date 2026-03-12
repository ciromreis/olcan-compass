import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Shield, Zap, Heart } from 'lucide-react';
import type { PsychProfile } from '@/store/psych';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface PsychProfileCardProps {
  profile: PsychProfile;
  className?: string;
}

export function PsychProfileCard({ profile, className }: PsychProfileCardProps) {
  const certaintyScore = useMemo(() => {
    return profile.certainty_score || 0;
  }, [profile]);

  const readinessScore = useMemo(() => {
    return profile.readiness_score || 0;
  }, [profile]);

  const getCertaintyColor = (score: number) => {
    if (score >= 80) return 'sage';
    if (score >= 60) return 'moss';
    if (score >= 40) return 'clay';
    return 'clay';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-brand-500" />
          <h3 className="font-heading text-h4 text-text-primary">Perfil Psicológico</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-500" />
                <span className="text-body-sm text-text-secondary">Score de Certeza</span>
              </div>
              <span className="font-heading text-h3 text-brand-500">{certaintyScore}%</span>
            </div>
            <Progress
              value={certaintyScore}
              variant={getCertaintyColor(certaintyScore)}
              size="sm"
            />
            <p className="text-caption text-text-muted mt-2">
              {certaintyScore >= 80
                ? 'Você tem alta certeza sobre sua decisão'
                : certaintyScore >= 60
                ? 'Você tem certeza moderada'
                : 'Sua certeza está em desenvolvimento'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-sage-500" />
              <span className="text-body-sm text-text-secondary">Prontidão</span>
            </div>
            <Progress
              value={readinessScore}
              variant={readinessScore >= 60 ? 'sage' : 'clay'}
              size="sm"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-clay-500" />
              <span className="text-body-sm text-text-secondary">Motivação</span>
            </div>
            <Progress
              value={profile.motivation_score || 0}
              variant="clay"
              size="sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Heart className="w-3 h-3" />
            <span>Risco: {profile.risk_tolerance || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-body-xs text-text-muted">
            <Shield className="w-3 h-3" />
            <span>Compromisso: {profile.commitment_level || 'N/A'}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
