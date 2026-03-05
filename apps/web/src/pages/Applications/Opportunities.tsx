import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Search, Plus } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { useCreateApplication } from '@/hooks/useApplications'
import type { Application } from '@/components/domain/ApplicationCard'
import { GrowthPotentialWidget } from '@/components/domain/GrowthPotentialWidget'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { formatDeadline, daysUntil } from '@/lib/utils'

const opportunityTypeLabels: Record<string, string> = {
  scholarship: 'Bolsa de Estudos',
  job: 'Emprego',
  research_position: 'Pesquisa',
  exchange_program: 'Intercâmbio',
  grant: 'Grant / Auxílio',
  fellowship: 'Fellowship',
  internship: 'Estágio',
}

type OpportunityCardItem = Application & {
  opportunity_cost_daily?: number
  opportunity_type?: string
  description?: string
}

export function Opportunities() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchTerm, 500)
  const createApplication = useCreateApplication()
  
  const { opportunities, isLoading, error } = useApplications({
    search: debouncedSearch,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    location: locationFilter !== 'all' ? locationFilter : undefined,
  })

  const handleApply = async (opportunityId: string) => {
    setApplyingId(opportunityId)
    try {
      const result = await createApplication.mutateAsync({ opportunity_id: opportunityId })
      navigate(`/applications/detail/${result.id}`)
    } catch (err) {
      console.error('Failed to create application:', err)
    } finally {
      setApplyingId(null)
    }
  }

  const handleViewDetails = (opportunityId: string) => {
    navigate(`/applications/opportunities/${opportunityId}`)
  }

  const handleUpgrade = (tier: 'pro' | 'premium') => {
    navigate('/more', {
      state: {
        focus: 'subscription',
        tier,
        source: 'growth-potential-widget',
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar oportunidades. Tente novamente.</Alert>
  }

  const urgentOpportunities: OpportunityCardItem[] =
    ((opportunities || []) as OpportunityCardItem[])
      .filter((o: OpportunityCardItem) => !!o.deadline)
      .sort((a: OpportunityCardItem, b: OpportunityCardItem) => daysUntil(a.deadline!) - daysUntil(b.deadline!))
      .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h2 text-white">Candidaturas</h1>
          <p className="text-body text-neutral-300 mt-1">
            Oportunidades para adicionar ao seu pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/applications/my-applications')}
            icon={<MaterialSymbol name="folder_open" size={18} />}
            iconPosition="left"
          >
            Minhas
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/applications/simulator')}
            icon={<MaterialSymbol name="model_training" size={18} />}
            iconPosition="left"
          >
            Simulador
          </Button>
        </div>
      </div>

      <Card className="liquid-glass">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar oportunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todos os tipos' },
                { value: 'scholarship', label: 'Bolsa de Estudos' },
                { value: 'job', label: 'Emprego' },
                { value: 'research_position', label: 'Pesquisa' },
                { value: 'exchange_program', label: 'Intercâmbio' },
                { value: 'grant', label: 'Grant / Auxílio' },
                { value: 'fellowship', label: 'Fellowship' },
                { value: 'internship', label: 'Estágio' },
              ]}
            />
            <Select
              value={locationFilter}
              onChange={(value) => setLocationFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todas as localizações' },
                { value: 'Estados Unidos', label: 'Estados Unidos' },
                { value: 'Reino Unido', label: 'Reino Unido' },
                { value: 'Alemanha', label: 'Alemanha' },
                { value: 'França', label: 'França' },
                { value: 'Suíça', label: 'Suíça' },
                { value: 'Portugal', label: 'Portugal' },
                { value: 'Europa', label: 'Europa (Geral)' },
              ]}
            />
          </div>
        </div>
      </Card>

      {urgentOpportunities.length > 0 && (
        <Card className="liquid-glass">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MaterialSymbol name="warning" size={20} className="text-warning" />
                <h2 className="font-heading text-h3 text-white">Riscos</h2>
              </div>
              <p className="text-body-sm text-neutral-300 mt-1">
                Prazos mais próximos na sua lista atual.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentOpportunities.map((o) => (
              <button
                key={o.id}
                onClick={() => handleViewDetails(o.id)}
                className="text-left rounded-xl border border-white/10 bg-neutral-800/30 hover:bg-neutral-800/40 transition-colors p-4"
              >
                <p className="text-body font-semibold text-white">{o.opportunity_name}</p>
                <p className="text-body-sm text-neutral-400 mt-1">{o.institution || '—'}</p>
                <p className="text-body-sm text-neutral-200 mt-3 font-mono">
                  {o.deadline ? formatDeadline(o.deadline) : 'Sem prazo'}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Growth Potential Widget - shown when momentum is low */}
      <GrowthPotentialWidget
        opportunityCostDaily={
          opportunities && opportunities.length > 0 && opportunities[0].opportunity_cost_daily
            ? opportunities[0].opportunity_cost_daily
            : 0
        }
        onUpgradeClick={handleUpgrade}
      />

      {!opportunities || opportunities.length === 0 ? (
        <Card className="liquid-glass">
          <EmptyState
            icon={<Briefcase className="w-12 h-12" />}
            title="Nenhuma oportunidade encontrada"
            description="Ajuste os filtros para ver mais oportunidades."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity: OpportunityCardItem, index: number) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="liquid-glass hover:border-cyan/30 transition-colors h-full" noPadding>
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-body font-semibold text-white line-clamp-2">
                        {opportunity.opportunity_name}
                      </h3>
                      {opportunity.institution && (
                        <p className="text-body-sm text-slate mt-1 truncate">
                          {opportunity.institution}
                        </p>
                      )}
                    </div>
                    {opportunity.opportunity_type && (
                      <Badge variant="default" className="shrink-0">
                        {opportunityTypeLabels[opportunity.opportunity_type] || opportunity.opportunity_type}
                      </Badge>
                    )}
                  </div>

                  {opportunity.description && (
                    <p className="text-body-sm text-slate line-clamp-2 mb-3">
                      {opportunity.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-body-sm text-slate mb-3">
                    {opportunity.location && (
                      <span className="flex items-center gap-1">
                        <MaterialSymbol name="location_on" size={14} />
                        {opportunity.location}
                      </span>
                    )}
                    {opportunity.deadline && (
                      <span className="flex items-center gap-1">
                        <MaterialSymbol name="schedule" size={14} />
                        {formatDeadline(opportunity.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/10 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(opportunity.opportunity_id || opportunity.id)}
                      isLoading={applyingId === (opportunity.opportunity_id || opportunity.id)}
                      icon={<Plus className="w-4 h-4" />}
                      iconPosition="left"
                      fullWidth
                    >
                      Candidatar-se
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
