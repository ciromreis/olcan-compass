import { motion, AnimatePresence } from 'framer-motion'
import { Map as MapIcon, Flame, Plus, Target } from 'lucide-react'
import { useRoutes } from '@/hooks/useRoutes'
import { useUIMode } from '@/hooks/useUIMode'
import { RouteTimeline } from '@/components/domain/RouteTimeline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'
import type { Route, RouteMilestone } from '@/store/route'

/**
 * My Routes page — displays user routes with Map/Forge mode support.
 * Map mode: shows all routes simultaneously.
 * Forge mode: focuses on current active milestone.
 */
export function MyRoutes() {
  const navigate = useNavigate()
  const { routes, updateMilestone, isLoading, error } = useRoutes()
  const { mode, toggleMode } = useUIMode()

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
        Erro ao carregar rotas. Tente novamente.
      </Alert>
    )
  }

  const hasRoutes = routes && routes.length > 0
  const activeRoute = routes?.find((r: Route) => r.status === 'active')
  const activeMilestone = activeRoute?.milestones?.find((m: RouteMilestone) => !m.completed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">
            Minhas Rotas
          </h1>
          <p className="text-body text-neutral-300 mt-1">
            Acompanhe seu progresso na jornada de mobilidade
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <Button
            variant="ghost"
            onClick={toggleMode}
            icon={mode === 'map' ? <Flame className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />} iconPosition="left"
          >
            {mode === 'map' ? 'Modo Forge' : 'Modo Map'}
          </Button>
          <Button
            onClick={() => navigate('/routes/templates')}
            icon={<Plus className="w-4 h-4" />} iconPosition="left"
          >
            Nova Rota
          </Button>
        </div>
      </div>

      {!hasRoutes ? (
        /* Empty State */
        <Card>
          <EmptyState
            icon={<MapIcon className="w-12 h-12" />}
            title="Nenhuma rota criada"
            description="Comece sua jornada escolhendo um template de rota estruturado para seu destino."
            onAction={() => navigate('/routes/templates')}
          />
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {mode === 'forge' ? (
            /* Forge Mode - Focus on Active Milestone */
            <motion.div
              key="forge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {activeMilestone && activeRoute ? (
                <Card>
                  <div className="p-8">
                    {/* Mode Indicator */}
                    <div className="flex items-center gap-2 mb-6">
                      <Flame className="w-5 h-5 text-lumina" />
                      <span className="text-body-sm text-lumina font-medium">
                        Modo Forge — Foco Total
                      </span>
                    </div>

                    {/* Route Context */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-body-sm text-neutral-400 mb-2">
                        <Target className="w-4 h-4" />
                        {activeRoute.name}
                      </div>
                      <h2 className="font-heading text-h2 text-white mb-2">
                        {activeMilestone.title}
                      </h2>
                      <p className="text-body text-neutral-300">
                        {activeMilestone.description}
                      </p>
                    </div>

                    {/* Milestone Details */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                        <p className="text-body-sm text-neutral-400 mb-1">Status</p>
                        <Badge variant="warning">Em Progresso</Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                        <p className="text-body-sm text-neutral-400 mb-1">Prazo</p>
                        <p className="text-body text-white">
                          {activeMilestone.target_date
                            ? new Date(activeMilestone.target_date).toLocaleDateString('pt-BR')
                            : 'Não definido'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20">
                        <p className="text-body-sm text-neutral-400 mb-1">Ordem</p>
                        <p className="text-body text-white">
                          Marco {activeMilestone.order_index + 1}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => updateMilestone({ routeId: activeRoute.id, milestoneId: activeMilestone.id, updates: { completed: true } })}
                      >
                        Marcar como Completo
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={toggleMode}
                      >
                        Ver Todas as Rotas
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <EmptyState
                    icon={<Target className="w-12 h-12" />}
                    title="Nenhum marco ativo"
                    description="Você não tem marcos em progresso no momento."
                    onAction={toggleMode}
                  />
                </Card>
              )}
            </motion.div>
          ) : (
            /* Map Mode - Show All Routes */
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Mode Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lumina/5 border border-lumina/20 w-fit">
                <MapIcon className="w-4 h-4 text-lumina" />
                <span className="text-body-sm text-lumina font-medium">
                  Modo Map — Visão Completa
                </span>
              </div>

              {routes.map((route: Route, index: number) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <div className="p-6">
                      {/* Route Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-heading text-h3 text-white mb-1">
                            {route.name}
                          </h3>
                          <p className="text-body-sm text-neutral-400">
                            {route.name}
                          </p>
                        </div>
                        <Badge
                          variant={
                            route.status === 'completed'
                              ? 'success'
                              : route.status === 'active'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {route.status === 'completed'
                            ? 'Completa'
                            : route.status === 'active'
                            ? 'Ativa'
                            : 'Planejada'}
                        </Badge>
                      </div>

                      {/* Timeline */}
                      <RouteTimeline route={route} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
