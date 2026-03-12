import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, Clock } from 'lucide-react';
import type { ProviderProfile } from '@/store/marketplace';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

interface ProviderCardProps {
  provider: ProviderProfile;
  className?: string;
}

export function ProviderCard({ provider, className }: ProviderCardProps) {
  const averageRating = useMemo(() => {
    if (!provider.reviews || provider.reviews.length === 0) return 0;
    const sum = provider.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / provider.reviews.length).toFixed(1);
  }, [provider.reviews]);

  const totalReviews = provider.reviews?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-5 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-heading font-bold text-xl">
              {provider.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-heading text-h4 text-text-primary truncate">
                  {provider.name}
                </h3>
                <p className="text-body-sm text-text-secondary truncate">
                  {provider.specialty || provider.description}
                </p>
              </div>
              {provider.verified && (
                <div className="flex-shrink-0 ml-2">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-clay-500 fill-current" />
                <span className="text-body-sm font-medium text-text-primary">
                  {averageRating}
                </span>
                <span className="text-body-xs text-text-muted">
                  ({totalReviews})
                </span>
              </div>
              {provider.location && (
                <div className="flex items-center gap-1 text-body-xs text-text-muted">
                  <MapPin className="w-3 h-3" />
                  {provider.location}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {provider.experience_years && (
                  <div className="flex items-center gap-1 text-body-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {provider.experience_years} anos
                  </div>
                )}
                {provider.services_count && (
                  <div className="flex items-center gap-1 text-body-xs text-text-muted">
                    {provider.services_count} serviços
                  </div>
                )}
              </div>
              {provider.price && (
                <span className="text-body-sm font-semibold text-brand-600">
                  {formatPrice(provider.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
