import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Clock, Target, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
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
import { Input } from '@/components/ui/Input'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState<'all' | 'bolsas' | 'trabalho' | 'pesquisa' | 'visto' | 'intercambio'>('all')

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

  const filteredTemplates = (templates || []).filter((t: RouteTemplate) => {
    const matchesSearch =
      !searchTerm.trim() ||
      t.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.trim().toLowerCase())

    const lower = `${t.name} ${t.description} ${t.destination_country}`.toLowerCase()
    const matchesCategory =
      category === 'all'
        ? true
        : category === 'bolsas'
          ? lower.includes('scholar') || lower.includes('bolsa')
          : category === 'trabalho'
            ? lower.includes('job') || lower.includes('trabalho')
            : category === 'pesquisa'
              ? lower.includes('research') || lower.includes('pesquisa')
              : category === 'visto'
                ? lower.includes('visa') || lower.includes('visto')
                : lower.includes('exchange') || lower.includes('intercâmbio') || lower.includes('intercambio')

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-white">Templates</h1>
          <p className="text-body text-slate mt-1">
            Escolha um caminho estruturado para sua jornada.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/routes')}>
          Minhas rotas
        </Button>
      </div>

      {/* Search + Filters */}
      <Card className="liquid-glass" noPadding>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar rota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <button
              type="button"
              className="touch-target inline-flex items-center justify-center rounded-xl border border-white/10 bg-void-primary/30 px-3 text-silver hover:bg-void-primary/40 transition-colors"
              aria-label="Filtros"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'bolsas', label: 'Bolsas' },
              { id: 'trabalho', label: 'Trabalho' },
              { id: 'pesquisa', label: 'Pesquisa' },
              { id: 'visto', label: 'Visto' },
              { id: 'intercambio', label: 'Intercâmbio' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as any)}
                className={[
                  'whitespace-nowrap rounded-full px-3 py-1 text-body-sm border transition-colors',
                  category === (c.id as any)
                    ? 'bg-primary-blue/10 border-cyan/30 text-cyan'
                    : 'bg-void-primary/20 border-white/10 text-slate hover:bg-void-primary/30',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

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
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
          <EmptyState
            icon={<Map className="w-12 h-12" />}
            title="Nenhum template disponível"
            description="Não há templates de rotas disponíveis no momento."
          />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: RouteTemplate, index: number) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full liquid-glass hover:border-cyan/30 transition-colors cursor-pointer group" noPadding>
                <div
                  className="p-6 h-full flex flex-col"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-blue/10 text-cyan group-hover:bg-primary-blue/20 transition-colors">
                      <Map className="w-6 h-6" />
                    </div>
                    <Badge variant={difficultyColors[template.difficulty as keyof typeof difficultyColors]}>
                      {difficultyLabels[template.difficulty as keyof typeof difficultyLabels]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-heading text-h4 text-white mb-2 group-hover:text-cyan transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-body-sm text-slate mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Destination */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-primary/40 border border-white/10 text-body-sm text-silver mb-4">
                      <Target className="w-4 h-4" />
                      {template.destination_country}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-body-sm text-slate">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.estimated_duration_months} meses
                      </div>
                      <div>
                        {template.milestone_count} marcos
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan group-hover:translate-x-1 transition-transform" />
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
              <p className="text-body text-slate">
                {selectedTemplate.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-panel">
                <p className="text-body-sm text-slate mb-1">Destino</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.destination_country}
                </p>
              </div>
              <div className="stat-panel">
                <p className="text-body-sm text-slate mb-1">Duração</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.estimated_duration_months} meses
                </p>
              </div>
              <div className="stat-panel">
                <p className="text-body-sm text-slate mb-1">Marcos</p>
                <p className="text-body text-white font-medium">
                  {selectedTemplate.milestone_count} etapas
                </p>
              </div>
              <div className="stat-panel">
                <p className="text-body-sm text-slate mb-1">Dificuldade</p>
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
