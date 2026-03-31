import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Search } from 'lucide-react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { ProviderCard } from '@/components/domain/ProviderCard'
import type { Provider } from '@/components/domain/ProviderCard'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { useNavigate } from 'react-router-dom'

type ProviderItem = Provider

export function MarketplaceBrowse() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  
  const { providers, isLoading, error } = useMarketplace({
    service_type: serviceFilter !== 'all' ? serviceFilter : undefined,
    min_rating: ratingFilter !== 'all' ? Number(ratingFilter) : undefined,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar marketplace. Tente novamente.</Alert>
  }

  const filteredProviders =
    providers?.filter((p: ProviderItem) =>
      p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Marketplace</h1>
        <p className="text-body text-neutral-300 mt-1">
          Encontre profissionais especializados em mobilidade
        </p>
      </div>

      <Card className="liquid-glass">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar provedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={serviceFilter}
              onChange={(value) => setServiceFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todos os serviços' },
                { value: 'visa_consulting', label: 'Consultoria de Visto' },
                { value: 'career_coaching', label: 'Coaching de Carreira' },
                { value: 'language_tutoring', label: 'Tutoria de Idiomas' },
              ]}
            />
            <Select
              value={ratingFilter}
              onChange={(value) => setRatingFilter(Array.isArray(value) ? value[0] || 'all' : value || 'all')}
              options={[
                { value: 'all', label: 'Todas as avaliações' },
                { value: '4', label: '4+ estrelas' },
                { value: '4.5', label: '4.5+ estrelas' },
              ]}
            />
          </div>
        </div>
      </Card>

      {!filteredProviders || filteredProviders.length === 0 ? (
        <Card className="liquid-glass">
          <EmptyState
            icon={<Store className="w-12 h-12" />}
            title="Nenhum provedor encontrado"
            description="Ajuste os filtros para ver mais provedores."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider: ProviderItem, index: number) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProviderCard
                provider={provider}
                onViewProfile={(providerId) => navigate(`/marketplace/provider/${providerId}`)}
                onBookService={(providerId) => navigate(`/marketplace/provider/${providerId}`)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
