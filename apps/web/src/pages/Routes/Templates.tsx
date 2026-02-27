import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Clock, Target, ChevronRight } from 'lucide-react'
import { useRoutes } from '@/hooks/useRoutes'
import { TemporalRouteRecommendations } from '@/components/domain/TemporalRouteRecommendations'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface RouteTemplate {
  id: string
  name: string
  description: string
  destination_country: string
  milestone_count: number
  estimated_duration_months: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Route Templates page — browse and select mobility route templates.
 */
export function RouteTemplates() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { templates, createRouteFromTemplateAsync, isLoading, error } = useRoutes()
  const [selectedTemplate, setSelectedTemplate] = useState<RouteTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoute = async () => {
    if (!selectedTemplate) return

    setIsCreating(true)
    try {
      await createRouteFromTemplateAsync({ template_id: selectedTemplate.id })
      setSelectedTemplate(null)
      navigate('/routes')
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsCreating(false)
    }
  }

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
        Erro ao carregar templates de rotas. Tente novamente.
      </Alert>
    )
  }

  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'error',
  } as const

  const difficultyLabels = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-h1 text-white">
          Templates de Rotas
        </h1>
        <p className="text-body text-neutral-300 mt-1">
          Escolha um caminho estruturado para sua jornada de mobilidade internacional
        </p>
      </div>

      {/* Temporal Route Recommendations */}
      {user && (
        <TemporalRouteRecommendations
          limit={5}
          onRouteSelect={(routeId) => {
            const template = templates?.find((t: RouteTemplate) => t.id === routeId);
            if (template) {
              setSelectedTemplate(template);
            }
          }}
        />
      )}

      {!templates || templates.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Map className="w-12 h-12" />}
            title="Nenhum template disponível"
            description="Não há templates de rotas disponíveis no momento."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: RouteTemplate, index: number) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-lumina/40 transition-colors cursor-pointer group">
                <div
                  className="p-6 h-full flex flex-col"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-lumina/10 text-lumina group-hover:bg-lumina/20 transition-colors">
                      <Map className="w-6 h-6" />
                    </div>
                    <Badge variant={difficultyColors[template.difficulty as keyof typeof difficultyColors]}>
                      {difficultyLabels[template.difficulty as keyof typeof difficultyLabels]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-h4 text-white mb-2 group-hover:text-lumina transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-body-sm text-neutral-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Destination */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-700/50 text-body-sm text-neutral-300 mb-4">
                      <Target className="w-4 h-4" />
                      {template.destination_country}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-600/30">
                    <div className="flex items-center gap-4 text-body-sm text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.estimated_duration_months} meses
                      </div>
                      <div>
                        {template.milestone_count} marcos
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-lumina group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Detail Modal */}
      <Modal
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name || ''}
      >
        {selectedTemplate && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-heading text-h4 text-white mb-2">Sobre esta rota</h3>
              <p className="text-body text-neutral-300">
                {selectedTemplate.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                <p className="text-body-sm text-neutral-400 mb-1">Destino</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.destination_country}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                <p className="text-body-sm text-neutral-400 mb-1">Duração</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.estimated_duration_months} meses
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                <p className="text-body-sm text-neutral-400 mb-1">Marcos</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.milestone_count} etapas
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                <p className="text-body-sm text-neutral-400 mb-1">Dificuldade</p>
                <Badge variant={difficultyColors[selectedTemplate.difficulty]}>
                  {difficultyLabels[selectedTemplate.difficulty]}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateRoute}
                isLoading={isCreating}
                fullWidth
              >
                Criar Minha Rota
              </Button>
              <Button
                onClick={() => setSelectedTemplate(null)}
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
