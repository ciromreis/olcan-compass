import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PerformanceGuaranteeBadge } from '@/components/domain/PerformanceGuaranteeBadge';
import { cn } from '@/lib/utils';
import { MapPin, Briefcase, Calendar, ExternalLink, Star } from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  duration?: number; // minutes
  performance_bound?: boolean;
  performance_success_rate?: number;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  review_count?: number;
  services?: Service[];
  verified?: boolean;
}

export interface ProviderCardProps {
  provider: Provider;
  onViewProfile?: (providerId: string) => void;
  onBookService?: (providerId: string, serviceId?: string) => void;
  showServices?: boolean;
  compact?: boolean;
  className?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onViewProfile,
  onBookService,
  showServices = true,
  compact = false,
  className,
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating
                ? 'fill-semantic-warning text-semantic-warning'
                : 'text-neutral-300'
            )}
          />
        ))}
      </div>
    );
  };

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(price);
  };

  if (compact) {
    return (
      <Card
        className={cn(
          'p-4 hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
        onClick={() => onViewProfile?.(provider.id)}
      >
        <div className="flex items-start gap-3">
          <Avatar
            src={provider.avatar_url}
            alt={provider.name}
            initials={provider.name.charAt(0)}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-neutral-900 truncate">
                {provider.name}
              </h4>
              {provider.verified && (
                <Badge variant="success" size="sm">
                  Verificado
                </Badge>
              )}
            </div>
            {provider.rating !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                {renderStars(provider.rating)}
                <span className="text-xs text-neutral-600">
                  ({provider.review_count || 0})
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar
            src={provider.avatar_url}
            alt={provider.name}
            initials={provider.name.charAt(0)}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {provider.name}
                </h3>
                {provider.location && (
                  <div className="flex items-center gap-1 text-sm text-neutral-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.location}</span>
                  </div>
                )}
              </div>
              {provider.verified && (
                <Badge variant="success">Verificado</Badge>
              )}
            </div>

            {/* Rating */}
            {provider.rating !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                {renderStars(provider.rating)}
                <span className="text-sm font-semibold text-neutral-900">
                  {provider.rating.toFixed(1)}
                </span>
                <span className="text-sm text-neutral-600">
                  ({provider.review_count || 0}{' '}
                  {provider.review_count === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-sm text-neutral-600 leading-relaxed">
            {provider.bio}
          </p>
        )}

        {/* Specialties */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="w-4 h-4 text-neutral-500" />
            {provider.specialties.map((specialty, idx) => (
              <Badge key={idx} variant="default" size="sm">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Services */}
        {showServices && provider.services && provider.services.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h4 className="text-sm font-semibold text-neutral-700">Serviços</h4>
            <div className="space-y-2">
              {provider.services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-start justify-between gap-3 p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium text-neutral-900">
                        {service.name}
                      </h5>
                      {service.performance_bound && (
                        <PerformanceGuaranteeBadge
                          performanceBound={service.performance_bound}
                          successRate={service.performance_success_rate}
                          size="sm"
                        />
                      )}
                    </div>
                    {service.description && (
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                      {service.price !== undefined && (
                        <span className="font-semibold text-neutral-900">
                          {formatPrice(service.price, service.currency)}
                        </span>
                      )}
                      {service.duration && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{service.duration} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onBookService?.(provider.id, service.id)}
                  >
                    Agendar
                  </Button>
                </div>
              ))}
              {provider.services.length > 3 && (
                <button
                  onClick={() => onViewProfile?.(provider.id)}
                  className="text-sm text-lumina-600 hover:text-lumina-700 font-medium"
                >
                  Ver todos os {provider.services.length} serviços
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewProfile?.(provider.id)}
          >
            Ver Perfil Completo
            <ExternalLink className="w-4 h-4" />
          </Button>
          {(!showServices || !provider.services || provider.services.length === 0) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBookService?.(provider.id)}
            >
              Agendar Serviço
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
