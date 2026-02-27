import { motion } from 'framer-motion'
import { Brain, TrendingUp, Calendar, Plus } from 'lucide-react'
import { usePsych } from '@/hooks/usePsych'
import { PsychProfileCard } from '@/components/domain/PsychProfileCard'
import { VerificationBadge } from '@/components/domain/VerificationBadge'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

/**
 * Psychology Dashboard — displays current profile and assessment history.
 * MMXD design with Void background and Lumina accents.
 */
export function PsychologyDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { profile, assessmentHistory, isLoading, error } = usePsych()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Erro ao carregar perfil psicológico. Tente novamente.
      </Alert>
    )
  }

  const hasProfile = profile && profile.openness !== null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-h1 text-white">
              Perfil Psicológico
            </h1>
            {user && (
              <VerificationBadge 
                size="md"
              />
            )}
          </div>
          <p className="text-body text-neutral-300 mt-1">
            Compreenda suas dimensões psicológicas para uma jornada personalizada
          </p>
        </div>
        <Button
          onClick={() => navigate('/psychology/assessment')}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Nova Avaliação
        </Button>
      </div>

      {!hasProfile ? (
        /* Empty State - No Profile Yet */
        <Card>
          <EmptyState
            icon={<Brain className="w-5 h-5" />}
            title="Nenhum perfil criado"
            description="Complete sua primeira avaliação psicológica para desbloquear recomendações personalizadas e adaptação da interface."
            onAction={() => navigate('/psychology/assessment')}
          />
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Avaliações Completas"
              value={assessmentHistory?.length || 0}
              icon={Brain}
              trend={assessmentHistory && assessmentHistory.length > 1 ? 'up' : undefined}
            />
            <StatCard
              title="Última Avaliação"
              value={
                assessmentHistory && assessmentHistory.length > 0
                  ? new Date(assessmentHistory[0].completed_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'N/A'
              }
              icon={Calendar}
            />
            <StatCard
              title="Tendência"
              value="Estável"
              icon={TrendingUp}
              description="Baseado nas últimas 3 avaliações"
            />
          </div>

          {/* Current Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PsychProfileCard profile={profile} />
          </motion.div>

          {/* Assessment History */}
          {assessmentHistory && assessmentHistory.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="font-heading text-h3 text-white mb-4">
                  Histórico de Avaliações
                </h2>
                <div className="space-y-3">
                  {assessmentHistory.slice(0, 5).map((assessment: any, index: number) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20 hover:border-neutral-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lumina/10 text-lumina">
                          <span className="text-body-sm font-medium">#{assessmentHistory.length - index}</span>
                        </div>
                        <div>
                          <p className="text-body text-white">
                            Avaliação Big Five
                          </p>
                          <p className="text-body-sm text-neutral-400">
                            {new Date(assessment.completed_at).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: View assessment details
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Insights Card */}
          <Card>
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-3">
                Insights do Perfil
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-lumina/5 border border-lumina/20">
                  <p className="text-body text-neutral-200">
                    <strong className="text-lumina">Modo Recomendado:</strong>{' '}
                    {(profile.anxiety_score ?? 0) > 60 ? 'The Forge' : 'The Map'}
                  </p>
                  <p className="text-body-sm text-neutral-400 mt-1">
                    {(profile.anxiety_score ?? 0) > 60
                      ? 'Interface minimalista para reduzir sobrecarga cognitiva'
                      : 'Visualização completa de dados para máxima informação'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                  <p className="text-body text-neutral-200">
                    <strong>Pontos Fortes:</strong> Alta abertura para experiências e conscienciosidade
                  </p>
                  <p className="text-body-sm text-neutral-400 mt-1">
                    Você está bem preparado para explorar novas oportunidades de mobilidade
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
