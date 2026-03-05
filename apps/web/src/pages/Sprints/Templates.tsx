import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Target, Clock, ChevronRight, ListChecks } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
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
  gap_category?: string
}

type TemplateTask = {
  title?: string
  description?: string
  estimated_minutes?: number
  priority?: string
}

export function SprintTemplates() {
  const navigate = useNavigate()
  const { templates, createSprint, isLoading, error } = useSprints()
  const [selectedTemplate, setSelectedTemplate] = useState<SprintTemplateItem | null>(null)
  const [templateTasks, setTemplateTasks] = useState<TemplateTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [customName, setCustomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (selectedTemplate) {
      setCustomName(selectedTemplate.name)
      setLoadingTasks(true)
      api.get(`/sprints/templates/${selectedTemplate.id}`)
        .then((res) => {
          const tasks = res.data?.default_tasks || []
          setTemplateTasks(tasks)
        })
        .catch(() => setTemplateTasks([]))
        .finally(() => setLoadingTasks(false))
    }
  }, [selectedTemplate])

  const handleStartSprint = () => {
    if (!selectedTemplate) return
    setIsCreating(true)
    createSprint(
      { template_id: selectedTemplate.id },
      {
        onSuccess: (data: any) => {
          setIsCreating(false)
          setSelectedTemplate(null)
          if (data?.id) navigate(`/sprints/${data.id}`)
        },
        onError: () => setIsCreating(false),
      }
    )
  }

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
                    onClick={() => setSelectedTemplate(template)}
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Ver e Iniciar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview / Customization Modal */}
      <Modal
        open={!!selectedTemplate}
        onClose={() => {
          setSelectedTemplate(null)
          setTemplateTasks([])
        }}
        title={selectedTemplate?.name || 'Sprint'}
      >
        <div className="space-y-5">
          {selectedTemplate?.description && (
            <p className="text-body-sm text-slate">{selectedTemplate.description}</p>
          )}

          <div className="flex items-center gap-3">
            {selectedTemplate?.gap_category && (
              <Badge variant="default">{selectedTemplate.gap_category}</Badge>
            )}
            <Badge variant="default">
              <Clock className="w-3 h-3 mr-1" />
              {selectedTemplate?.duration_weeks} semanas
            </Badge>
            <Badge variant="default">
              <ListChecks className="w-3 h-3 mr-1" />
              {selectedTemplate?.task_count} tarefas
            </Badge>
          </div>

          <Input
            label="Nome do Sprint (personalize se quiser)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ex: Meu sprint de documentação"
          />

          {/* Task Preview */}
          <div className="space-y-2">
            <h3 className="text-body-sm font-semibold text-silver flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-cyan" />
              Tarefas incluídas
            </h3>
            {loadingTasks ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : templateTasks.length === 0 ? (
              <p className="text-body-sm text-slate">Nenhuma tarefa pré-definida.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {templateTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-void-primary/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-caption font-mono text-cyan">{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-medium text-white">{task.title}</p>
                      {task.description && (
                        <p className="text-caption text-slate mt-0.5 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    {task.estimated_minutes && (
                      <Badge variant="default" className="shrink-0">
                        {task.estimated_minutes} min
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleStartSprint}
              isLoading={isCreating}
              fullWidth
            >
              Iniciar Sprint
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedTemplate(null)
                setTemplateTasks([])
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
