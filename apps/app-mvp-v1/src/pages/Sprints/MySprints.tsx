import { motion } from 'framer-motion'
import { Zap, Plus, TrendingUp } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'

type SprintItem = {
  id: string
  name: string
  total_tasks: number
  completed_tasks: number
  status?: string
}

export function MySprints() {
  const navigate = useNavigate()
  const { sprints, gapAnalysis, readinessOverview, isLoading, error } = useSprints()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar sprints. Tente novamente.</Alert>
  }

  const urgentTasks = readinessOverview?.urgent_tasks?.slice(0, 3) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 text-white">Sprints</h1>
          <p className="text-body text-slate mt-1">
            Acompanhe seu progresso de preparação
          </p>
        </div>
        <Button onClick={() => navigate('/sprints/templates')} icon={<Plus className="w-4 h-4" />} iconPosition="left">
          Novo Sprint
        </Button>
      </div>

      {gapAnalysis && (
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-cyan" />
              <h2 className="font-heading text-h3 text-white">Análise de Gaps</h2>
            </div>
            <p className="text-body text-slate mb-4">{gapAnalysis.summary}</p>
            <div className="space-y-2">
              {gapAnalysis.recommendations?.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-body-sm text-slate">
                  <span className="text-cyan">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {urgentTasks.length > 0 && (
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MaterialSymbol name="warning" size={20} className="text-warning" />
              <h2 className="font-heading text-h3 text-white">Tarefas de hoje</h2>
            </div>
            <div className="space-y-2">
              {urgentTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-void-primary/30 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-white truncate">{t.title}</p>
                    <p className="text-caption text-slate mt-0.5">
                      {t.estimated_minutes ? `${t.estimated_minutes} min` : '—'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/sprints/${t.sprint_id}`)}
                  >
                    Abrir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {!sprints || sprints.length === 0 ? (
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
          <EmptyState
            icon={<Zap className="w-12 h-12" />}
            title="Nenhum sprint ativo"
            description="Inicie um sprint para estruturar sua preparação."
            onAction={() => navigate('/sprints/templates')}
          />
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {sprints.map((sprint: SprintItem, index: number) => (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="liquid-glass" noPadding>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-h3 text-white mb-1">{sprint.name}</h3>
                      <p className="text-body-sm text-slate">
                        {sprint.completed_tasks} de {sprint.total_tasks} tarefas completas
                      </p>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/sprints/${sprint.id}`)}>
                      Ver Detalhes
                    </Button>
                  </div>
                  <Progress
                    value={
                      sprint.total_tasks > 0
                        ? (sprint.completed_tasks / sprint.total_tasks) * 100
                        : 0
                    }
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
