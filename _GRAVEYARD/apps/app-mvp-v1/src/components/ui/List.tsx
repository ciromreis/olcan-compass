import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

export interface ListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  virtualized?: boolean;
  estimateSize?: number;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
  gap?: number;
}

export function List<T = any>({
  items,
  renderItem,
  keyExtractor,
  virtualized = false,
  estimateSize = 60,
  emptyMessage = 'Nenhum item disponível',
  className,
  itemClassName,
  gap = 8,
}: ListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    enabled: virtualized,
  });

  if (items.length === 0) {
    return (
      <div className={cn('py-8 text-center text-neutral-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  if (virtualized) {
    return (
      <div
        ref={parentRef}
        className={cn('overflow-auto', className)}
        style={{ height: '100%' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = keyExtractor(item, virtualItem.index);

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className={itemClassName} style={{ marginBottom: gap }}>
                  {renderItem(item, virtualItem.index)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)} style={{ gap }}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        return (
          <div key={key} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
