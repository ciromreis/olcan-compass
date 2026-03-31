import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './Checkbox';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  sortable?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
}

type SortState = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function Table<T = any>({
  columns,
  data,
  keyExtractor,
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onSort,
  emptyMessage = 'Nenhum dado disponível',
  className,
  stickyHeader = false,
}: TableProps<T>) {
  const [sortState, setSortState] = useState<SortState>(null);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    const newDirection: 'asc' | 'desc' =
      sortState?.key === columnKey && sortState.direction === 'asc'
        ? 'desc'
        : 'asc';

    const newSortState: SortState = { key: columnKey, direction: newDirection };
    setSortState(newSortState);
    onSort?.(columnKey, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allKeys = data.map((row: any, index: number) => keyExtractor(row, index));
      onSelectionChange(allKeys);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, key]);
    } else {
      onSelectionChange(selectedRows.filter((k) => k !== key));
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead
          className={cn(
            'bg-neutral-100 border-b border-neutral-300',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                  aria-
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-sm font-semibold text-neutral-700',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align !== 'center' && column.align !== 'right' && 'text-left',
                  column.sortable && sortable && 'cursor-pointer select-none hover:bg-neutral-200'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div
                  className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}
                >
                  <span>{column.label}</span>
                  {column.sortable && sortable && (
                    <span className="text-neutral-500">
                      {sortState?.key === column.key ? (
                        sortState.direction === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row: any, index: number) => {
              const rowKey = keyExtractor(row, index);
              const isSelected = selectedRows.includes(rowKey);

              return (
                <tr
                  key={rowKey}
                  className={cn(
                    'border-b border-neutral-200 transition-colors',
                    'hover:bg-neutral-50',
                    isSelected && 'bg-primary-blue/5'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={(checked) => handleSelectRow(rowKey, checked)}
                        aria-label={`Selecionar linha ${index + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render
                      ? column.render(value, row, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-neutral-900',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-neutral-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
