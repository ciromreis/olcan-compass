import { motion } from 'framer-motion'
import { Zap, Target, Clock } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'

type SprintTemplateItem = {
  id: string
  name: string
  description?: string
  task_count?: number
  duration_weeks?: number
}


export function SprintTemplates() {
  const navigate = useNavigate()
  const { templates, createSprint, isLoading, error } = useSprints()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar templates. Tente novamente.</Alert>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-white">Templates</h1>
        <p className="text-body text-slate mt-1">
          Sprints estruturados para preparação de mobilidade
        </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/sprints')}>
          Meus sprints
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
          <EmptyState
            icon={<Zap className="w-12 h-12" />}
            title="Nenhum template disponível"
            description="Não há templates de sprints disponíveis no momento."
          />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: SprintTemplateItem, index: number) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full liquid-glass hover:border-cyan/30 transition-colors" noPadding>
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-blue/10 text-cyan mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-h4 text-white mb-2">{template.name}</h3>
                  <p className="text-body-sm text-slate mb-4 flex-1">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-body-sm text-slate mb-4">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {template.task_count} tarefas
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {template.duration_weeks} semanas
                    </div>
                  </div>
                  <Button
                    fullWidth
                    onClick={() =>
                      createSprint(
                        { template_id: template.id },
                        { onSuccess: (data: any) => data?.id && navigate(`/sprints/${data.id}`) }
                      )
                    }
                  >
                    Iniciar Sprint
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
