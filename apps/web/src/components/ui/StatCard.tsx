import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  description,
  className,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-semantic-success';
    if (trend === 'down') return 'text-semantic-error';
    return 'text-neutral-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>

          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-1 mt-2">
              {change !== undefined && (
                <>
                  <TrendIcon className={cn('w-4 h-4', getTrendColor())} />
                  <span className={cn('text-sm font-medium', getTrendColor())}>
                    {change > 0 ? '+' : ''}
                    {change}%
                  </span>
                </>
              )}
              {changeLabel && (
                <span className="text-sm text-neutral-500 ml-1">
                  {changeLabel}
                </span>
              )}
            </div>
          )}

          {description && (
            <p className="text-sm text-neutral-600 mt-2">{description}</p>
          )}
        </div>

        {Icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-lumina-100">
            <Icon className="w-6 h-6 text-lumina-600" />
          </div>
        )}
      </div>
    </Card>
  );
};
