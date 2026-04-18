import { motion } from 'framer-motion'
import { Calendar, Star } from 'lucide-react'
import { useMarketplace } from '@/hooks/useMarketplace'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

type BookingItem = {
  id: string
  provider_id: string
  provider_name: string
  service_name: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string
  scheduled_date?: string
  price?: number
  reviewed?: boolean
}

export function MyBookings() {
  const { bookings, submitReview, isLoading, error } = useMarketplace()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="error">Erro ao carregar agendamentos. Tente novamente.</Alert>
  }

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'default',
    cancelled: 'error',
  } as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1 text-white">Meus Agendamentos</h1>
        <p className="text-body text-neutral-300 mt-1">
          Gerencie seus serviços contratados
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Nenhum agendamento"
            description="Você ainda não contratou nenhum serviço."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: BookingItem, index: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-h4 text-white mb-1">{booking.service_name}</h3>
                      <p className="text-body-sm text-neutral-400">
                        com {booking.provider_name}
                      </p>
                    </div>
                    <Badge variant={statusColors[booking.status as keyof typeof statusColors] ?? 'default'}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-neutral-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.scheduled_date
                        ? new Date(booking.scheduled_date).toLocaleDateString('pt-BR')
                        : 'Data a confirmar'}
                    </div>
                    <span>${booking.price}</span>
                  </div>
                  {booking.status === 'completed' && !booking.reviewed && (
                    <Button
                      size="sm"
                      icon={<Star className="w-4 h-4" />} iconPosition="left"
                      onClick={() => submitReview({ providerId: booking.provider_id, bookingId: booking.id, rating: 5, comment: '' })}
                    >
                      Avaliar Serviço
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
