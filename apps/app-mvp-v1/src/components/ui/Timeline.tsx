import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: 'completed' | 'current' | 'upcoming';
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
  className,
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-start justify-between">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const status = item.status || 'upcoming';

            return (
              <div key={item.id} className="flex flex-col items-center flex-1">
                {/* Icon/Status */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors z-10',
                      status === 'completed' &&
                        'bg-lumina-600 border-lumina-600 text-white',
                      status === 'current' &&
                        'bg-white border-lumina-600 text-lumina-600',
                      status === 'upcoming' &&
                        'bg-white border-neutral-300 text-neutral-400'
                    )}
                  >
                    {item.icon ? (
                      item.icon
                    ) : status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute left-1/2 top-5 h-0.5 transition-colors',
                        status === 'completed'
                          ? 'bg-lumina-600'
                          : 'bg-neutral-300'
                      )}
                      style={{
                        width: 'calc(100% + 2rem)',
                        transform: 'translateX(50%)',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 text-center max-w-[150px]">
                  <h4
                    className={cn(
                      'text-sm font-semibold',
                      status === 'completed' || status === 'current'
                        ? 'text-neutral-900'
                        : 'text-neutral-500'
                    )}
                  >
                    {item.title}
                  </h4>
                  {item.date && (
                    <p className="text-xs text-neutral-500 mt-1">{item.date}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical orientation
  return (
    <div className={cn('relative', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status || 'upcoming';

        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="relative flex flex-col items-center">
              {/* Icon/Status */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors z-10',
                  status === 'completed' &&
                    'bg-lumina-600 border-lumina-600 text-white',
                  status === 'current' &&
                    'bg-white border-lumina-600 text-lumina-600',
                  status === 'upcoming' &&
                    'bg-white border-neutral-300 text-neutral-400'
                )}
              >
                {item.icon ? (
                  item.icon
                ) : status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 mt-2 transition-colors',
                    status === 'completed' ? 'bg-lumina-600' : 'bg-neutral-300'
                  )}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    status === 'completed' || status === 'current'
                      ? 'text-neutral-900'
                      : 'text-neutral-500'
                  )}
                >
                  {item.title}
                </h4>
                {item.date && (
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {item.date}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-neutral-600 mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
