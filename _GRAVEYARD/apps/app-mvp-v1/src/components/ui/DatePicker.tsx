import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  error = false,
  minDate,
  maxDate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const displayValue = value
    ? format(value, 'dd/MM/yyyy', { locale: ptBR })
    : placeholder;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer',
          'bg-neutral-50 border-neutral-300',
          'hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-lumina-500 focus:border-lumina-500',
          error && 'border-semantic-error focus:ring-semantic-error',
          disabled && 'opacity-50 cursor-not-allowed hover:border-neutral-300',
          isOpen && 'border-lumina-500 ring-2 ring-lumina-500'
        )}
      >
        <span
          className={cn(
            'text-sm',
            value ? 'text-neutral-900' : 'text-neutral-500'
          )}
        >
          {displayValue}
        </span>
        <Calendar className="w-5 h-5 text-neutral-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg p-3">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            locale={ptBR}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            modifiersClassNames={{
              selected: 'bg-lumina-600 text-white hover:bg-lumina-700',
              today: 'font-bold text-lumina-600',
              disabled: 'text-neutral-300 cursor-not-allowed',
            }}
            className="rdp-custom"
          />
        </div>
      )}

      <style>{`
        .rdp-custom {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #eff6ff;
        }
        
        .rdp-custom .rdp-head_cell {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .rdp-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #f3f4f6;
        }
        
        .rdp-custom .rdp-button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .rdp-custom .rdp-day_selected {
          background-color: #3b82f6;
          color: white;
        }
        
        .rdp-custom .rdp-day_selected:hover {
          background-color: #2563eb;
        }
        
        .rdp-custom .rdp-day_today:not(.rdp-day_selected) {
          font-weight: bold;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};
