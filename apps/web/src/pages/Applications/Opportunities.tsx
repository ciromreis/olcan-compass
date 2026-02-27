import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Search } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { ApplicationCard } from '@/components/domain/ApplicationCard'
import type { Application } from '@/components/domain/ApplicationCard'
import { GrowthPotentialWidget } from '@/components/domain/GrowthPotentialWidget'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'

type OpportunityCardItem = Application & {
  opportunity_cost_daily?: number
}

export function Opportunities() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  const { opportunities, isLoading, error } = useApplications({
    search: debouncedSearch,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    location: locationFilter !== 'all' ? locationFilter : undefined,
  })

  const handleUpgrade = (tier: 'pro' | 'premium') => {
    // Navigate to pricing or upgrade page
    // TODO: Implement upgrade flow
    console.log(`Upgrade to ${tier}`)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-white">Oportunidades</h1>
          <p className="text-body text-neutral-300 mt-1">
            Explore programas acadêmicos e profissionais
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/applications/simulator')}
        >
          Simulador de Cenários
        </Button>
      </div>

      <Card>
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
              onChange={(value) => setTypeFilter(value as string)}
              options={[
                { value: 'all', label: 'Todos os tipos' },
                { value: 'academic', label: 'Acadêmico' },
                { value: 'professional', label: 'Profissional' },
                { value: 'scholarship', label: 'Bolsa' },
              ]}
            />
            <Select
              value={locationFilter}
              onChange={(value) => setLocationFilter(value as string)}
              options={[
                { value: 'all', label: 'Todas as localizações' },
                { value: 'usa', label: 'Estados Unidos' },
                { value: 'uk', label: 'Reino Unido' },
                { value: 'canada', label: 'Canadá' },
              ]}
            />
          </div>
        </div>
      </Card>

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
        <Card>
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
              <ApplicationCard
                application={opportunity}
                />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
