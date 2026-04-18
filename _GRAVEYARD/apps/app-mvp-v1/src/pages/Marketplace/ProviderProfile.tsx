import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Calendar, Star } from 'lucide-react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

type ProviderService = {
  id: string
  name: string
  description?: string
  price?: number
}

type ProviderReview = {
  id: string
  user_name: string
  user_avatar?: string
  rating: number
  comment: string
}

type ProviderData = {
  id: string
  avatar?: string
  name: string
  bio?: string
  rating?: number
  review_count?: number
  location?: string
  services?: ProviderService[]
  reviews?: ProviderReview[]
}

export function ProviderProfile() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getProvider, bookService } = useMarketplace()

  const providerQuery = getProvider(id ?? '')
  const provider = providerQuery?.data as ProviderData | undefined

  if (providerQuery?.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (providerQuery?.error || !provider) {
    return <Alert variant="error">Erro ao carregar perfil. Tente novamente.</Alert>
  }

  return (
    <div className="space-y-6">
      <Card className="liquid-glass">
        <div className="p-6">
          <div className="flex items-start gap-6">
            <Avatar src={provider.avatar}  size="xl" />
            <div className="flex-1">
              <h1 className="font-heading text-h2 text-white mb-2">{provider.name}</h1>
              <p className="text-body text-neutral-300 mb-4">{provider.bio}</p>
              <div className="flex items-center gap-4 text-body-sm text-neutral-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span>{provider.rating ?? '-'} ({provider.review_count ?? 0} avaliações)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="liquid-glass">
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Serviços</h2>
              <div className="space-y-4">
                {provider.services?.map((service: ProviderService) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-lg bg-neutral-700/30 border border-neutral-600/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-body text-white font-medium mb-1">{service.name}</h3>
                        <p className="text-body-sm text-neutral-400">{service.description}</p>
                      </div>
                      <Badge variant="default">${service.price}</Badge>
                    </div>
                    <Button size="sm" onClick={() => bookService(provider.id, service.id)}>
                      Agendar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="liquid-glass">
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Avaliações</h2>
              <div className="space-y-4">
                {provider.reviews?.map((review: ProviderReview) => (
                  <div key={review.id} className="pb-4 border-b border-neutral-600/30 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar src={review.user_avatar}  size="sm" />
                      <div>
                        <p className="text-body-sm text-white font-medium">{review.user_name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-warning fill-warning' : 'text-neutral-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-body-sm text-neutral-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="liquid-glass">
            <div className="p-6">
              <h2 className="font-heading text-h3 text-white mb-4">Disponibilidade</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-body-sm text-neutral-300">
                  <Calendar className="w-4 h-4" />
                  <span>Próximos horários disponíveis</span>
                </div>
                <Button fullWidth>Ver Agenda</Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => navigate('/marketplace/messages')}
                >
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
