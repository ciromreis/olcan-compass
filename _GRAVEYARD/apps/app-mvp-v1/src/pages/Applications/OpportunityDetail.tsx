import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { useOpportunity, useCreateApplication } from '@/hooks/useApplications'
import { formatDeadline, formatDateShort } from '@/lib/utils'

export function OpportunityDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const opportunityQuery = useOpportunity(id || '')
  const createApplication = useCreateApplication()

  const opportunity = opportunityQuery.data

  const headerMeta = useMemo(() => {
    const location = opportunity?.location || '—'
    const institution = opportunity?.institution || '—'
    return { location, institution }
  }, [opportunity])

  if (opportunityQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (opportunityQuery.error || !opportunity) {
    return <Alert variant="error">Não foi possível carregar a oportunidade.</Alert>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-body-sm text-slate hover:text-white"
          >
            <MaterialSymbol name="arrow_back" size={18} />
            Voltar
          </button>
          <h1 className="font-heading text-h2 text-white mt-3 truncate">
            {opportunity.opportunity_name}
          </h1>
          <p className="text-body text-slate mt-1">
            {headerMeta.institution} • {headerMeta.location}
          </p>
        </div>

        <Badge variant="default" className="font-mono">
          {opportunity.opportunity_type || 'Oportunidade'}
        </Badge>
      </div>

      <Card className="liquid-glass">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-body-sm text-slate">Deadline</p>
            <div className="flex items-center gap-2">
              <MaterialSymbol name="event" size={18} className="text-cyan" />
              <p className="text-body font-semibold text-white">
                {opportunity.deadline ? formatDeadline(opportunity.deadline) : 'Sem prazo'}
              </p>
            </div>
            {opportunity.deadline && (
              <p className="text-body-sm text-slate">
                {formatDateShort(opportunity.deadline)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {typeof opportunity.match_score === 'number' && (
              <Badge variant="lumina" className="font-mono">
                Match {Math.round(opportunity.match_score)}%
              </Badge>
            )}
            <Button
              onClick={() => createApplication.mutate({ opportunity_id: opportunity.opportunity_id })}
              isLoading={createApplication.isPending}
            >
              Adicionar
              <MaterialSymbol name="add" size={18} />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="liquid-glass">
        <div className="flex items-center gap-2 mb-3">
          <MaterialSymbol name="description" size={20} className="text-cyan" />
          <h2 className="font-heading text-h3 text-white">Descrição</h2>
        </div>
        <p className="text-body text-slate leading-relaxed whitespace-pre-wrap">
          {opportunity.description || 'Sem descrição disponível.'}
        </p>
      </Card>

      {createApplication.isError && (
        <Alert variant="error">
          Não foi possível adicionar esta oportunidade às suas candidaturas.
        </Alert>
      )}

      {createApplication.isSuccess && (
        <Alert variant="success">
          Oportunidade adicionada. Abra em “Minhas candidaturas” para acompanhar.
        </Alert>
      )}
    </div>
  )
}

