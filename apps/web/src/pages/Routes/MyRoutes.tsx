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
import { Progress } from '@/components/ui/Progress'

/**
 * My Routes page — displays user routes with Map/Forge mode support.
 * Map mode: shows all routes simultaneously.
 * Forge mode: focuses on current active milestone.
 */
export function MyRoutes() {
  const navigate = useNavigate()
  const { routes, updateMilestone, isLoading, error } = useRoutes()
  const { mode, setMode } = useUIMode()

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
  const otherRoutes = (routes || []).filter((r: Route) => r.id !== activeRoute?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-white">Rotas</h1>
          <p className="text-body text-neutral-300 mt-1">
            Execução com visibilidade. Progresso com intenção.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-neutral-800/20 p-1">
            <button
              type="button"
              onClick={() => setMode('map')}
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-body-sm transition-colors',
                mode === 'map'
                  ? 'bg-lumina/10 text-lumina-200'
                  : 'text-neutral-300 hover:text-neutral-100',
              ].join(' ')}
            >
              <MapIcon className="w-4 h-4" />
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setMode('forge')}
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-body-sm transition-colors',
                mode === 'forge'
                  ? 'bg-lumina/10 text-lumina-200'
                  : 'text-neutral-300 hover:text-neutral-100',
              ].join(' ')}
            >
              <Flame className="w-4 h-4" />
              Forja
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/routes/templates')}>
            Explorar templates
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/routes/templates')}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
          >
            Criar
          </Button>
        </div>
      </div>

      {!hasRoutes ? (
        /* Empty State */
        <Card className="liquid-glass" noPadding>
          <div className="p-6">
          <EmptyState
            icon={<MapIcon className="w-12 h-12" />}
            title="Nenhuma rota criada"
            description="Comece sua jornada escolhendo um template de rota estruturado para seu destino."
            onAction={() => navigate('/routes/templates')}
          />
          </div>
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
                <Card className="liquid-glass" noPadding>
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
                      <div className="p-4 rounded-2xl bg-neutral-800/30 border border-white/10">
                        <p className="text-body-sm text-neutral-400 mb-1">Status</p>
                        <Badge variant="warning">Em Progresso</Badge>
                      </div>
                      <div className="p-4 rounded-2xl bg-neutral-800/30 border border-white/10">
                        <p className="text-body-sm text-neutral-400 mb-1">Prazo</p>
                        <p className="text-body text-white">
                          {activeMilestone.target_date
                            ? new Date(activeMilestone.target_date).toLocaleDateString('pt-BR')
                            : 'Não definido'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-neutral-800/30 border border-white/10">
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
                        onClick={() => setMode('map')}
                      >
                        Ver Todas as Rotas
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="liquid-glass" noPadding>
                  <div className="p-6">
                  <EmptyState
                    icon={<Target className="w-12 h-12" />}
                    title="Nenhum marco ativo"
                    description="Você não tem marcos em progresso no momento."
                    onAction={() => setMode('map')}
                  />
                  </div>
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
              {/* Active Route Card */}
              <Card className="liquid-glass" noPadding>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-body-sm text-neutral-400">Rota ativa</p>
                      <h2 className="font-heading text-h3 text-white truncate">
                        {activeRoute?.name || 'Nenhuma rota ativa'}
                      </h2>
                      {activeMilestone && (
                        <p className="text-body-sm text-neutral-300 mt-1">
                          Próximo passo: <span className="text-neutral-100 font-medium">{activeMilestone.title}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(activeRoute ? '/routes' : '/routes/templates')}
                      >
                        {activeRoute ? 'Retomar' : 'Explorar'}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Progress value={activeRoute?.progress_percentage || 0} showLabel />
                  </div>
                </div>
              </Card>

              {activeRoute && (
                <Card className="liquid-glass" noPadding>
                  <div className="p-6">
                    <h3 className="font-heading text-h3 text-white mb-4">Linha do tempo</h3>
                    <RouteTimeline route={activeRoute} />
                  </div>
                </Card>
              )}

              {otherRoutes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading text-h3 text-white">Outras rotas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherRoutes.map((route: Route, index: number) => (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="liquid-glass" noPadding>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-body font-semibold text-white truncate">{route.name}</p>
                                <p className="text-body-sm text-neutral-400 mt-0.5">
                                  {route.status === 'completed'
                                    ? 'Completa'
                                    : route.status === 'active'
                                      ? 'Ativa'
                                      : 'Planejada'}
                                </p>
                              </div>
                              <Badge variant={route.status === 'completed' ? 'success' : route.status === 'active' ? 'warning' : 'default'} className="font-mono">
                                {Math.round(route.progress_percentage || 0)}%
                              </Badge>
                            </div>
                            <div className="mt-4">
                              <Progress value={route.progress_percentage || 0} />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
