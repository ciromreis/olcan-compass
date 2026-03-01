import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { useSprints } from '@/hooks/useSprints'
import { useMarketplace } from '@/hooks/useMarketplace'
import { formatDateShort } from '@/lib/utils'

type SprintSummary = {
  id: string
  name: string
  description?: string
  status?: string
}

type ProviderSummary = {
  id: string
  name: string
  location?: string
  rating?: number
}

export function MoreHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sprints, readinessOverview, isLoading: isSprintsLoading } = useSprints()
  const { providers, isLoading: isMarketplaceLoading } = useMarketplace()

  const focus = (location.state as any)?.focus

  const activeSprint = useMemo(() => {
    const list = (sprints || []) as SprintSummary[]
    return list.find((s: SprintSummary) => s.status === 'active') ?? list[0] ?? null
  }, [sprints])

  const readinessScore = readinessOverview?.latest_assessment?.overall_readiness

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-h2 text-white">Mais</h1>
          <p className="text-body text-slate mt-1">
            Sprints, marketplace e ajustes finos do seu sistema.
          </p>
        </div>
        {typeof readinessScore === 'number' && (
          <Badge variant="lumina" className="font-mono">
            Prontidão {Math.round(readinessScore)}/100
          </Badge>
        )}
      </div>

      {/* Sprint highlight */}
      <Card variant="elevated" className="liquid-glass">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-blue/10 flex items-center justify-center border border-white/10">
            <MaterialSymbol name="bolt" size={24} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-body-sm text-slate">Sprint ativa</p>
                <h2 className="font-heading text-h3 text-white truncate">
                  {activeSprint?.name || (isSprintsLoading ? 'Carregando…' : 'Nenhuma sprint ativa')}
                </h2>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/sprints')}
                icon={<MaterialSymbol name="arrow_forward" size={18} />}
                iconPosition="right"
              >
                Abrir
              </Button>
            </div>

            {activeSprint?.description && (
              <p className="text-body-sm text-slate mt-2 line-clamp-2">
                {activeSprint.description}
              </p>
            )}

            {readinessOverview?.urgent_tasks?.length ? (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-body-sm text-silver">
                  <MaterialSymbol name="warning" size={18} className="text-warning" />
                  <span>
                    {readinessOverview.urgent_tasks.length} tarefa(s) urgente(s) identificada(s)
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Marketplace preview */}
      <Card variant="default" className="liquid-glass">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MaterialSymbol name="storefront" size={20} className="text-cyan" />
              <h2 className="font-heading text-h3 text-white">Marketplace</h2>
            </div>
            <p className="text-body-sm text-slate mt-1">
              Encontre especialistas para remover fricção da sua rota.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/marketplace')}
          >
            Ver
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {((providers || []) as ProviderSummary[]).slice(0, 2).map((p: ProviderSummary) => (
            <button
              key={p.id}
              onClick={() => navigate(`/marketplace/provider/${p.id}`)}
              className="text-left rounded-xl border border-white/10 bg-void-primary/30 hover:bg-void-primary/40 transition-colors p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-body font-semibold text-white truncate">{p.name}</p>
                  <p className="text-body-sm text-slate truncate">
                    {p.location || 'Global'}
                  </p>
                </div>
                {typeof p.rating === 'number' && (
                  <Badge variant="default" className="font-mono">
                    {p.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </button>
          ))}

          {!providers?.length && !isMarketplaceLoading && (
            <div className="rounded-xl border border-white/10 bg-void-primary/20 p-4 text-body-sm text-slate">
              Nenhum provedor disponível agora.
            </div>
          )}
        </div>
      </Card>

      {/* System actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="liquid-glass">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-body-sm text-slate">Atalhos</p>
              <p className="text-body font-semibold text-white mt-0.5">Mensagens</p>
              <p className="text-body-sm text-slate mt-1">
                Conversas com especialistas.
              </p>
            </div>
            <MaterialSymbol name="forum" size={22} className="text-cyan" />
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/marketplace/messages')}>
              Abrir
            </Button>
          </div>
        </Card>

        <Card className={focus === 'subscription' ? 'liquid-glass border border-cyan/30' : 'liquid-glass'}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-body-sm text-slate">Conta</p>
              <p className="text-body font-semibold text-white mt-0.5">Assinatura</p>
              <p className="text-body-sm text-slate mt-1">
                Ajuste seu plano quando for a hora certa.
              </p>
            </div>
            <MaterialSymbol name="workspace_premium" size={22} className="text-cyan" />
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/applications')}>
              Ver opções
            </Button>
          </div>
        </Card>

        <Card className="liquid-glass">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-body-sm text-slate">Sistema</p>
              <p className="text-body font-semibold text-white mt-0.5">Última sincronização</p>
              <p className="text-body-sm text-slate mt-1">
                {readinessOverview?.latest_assessment?.created_at
                  ? formatDateShort(readinessOverview.latest_assessment.created_at)
                  : '—'}
              </p>
            </div>
            <MaterialSymbol name="sync" size={22} className="text-cyan" />
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/psychology')}>
              Perfil
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default MoreHub
