import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  error?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  error = false,
  className,
  id,
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-center w-5 h-5 rounded border-2 transition-all cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-lumina-500 focus:ring-offset-2',
          checked || indeterminate
            ? 'bg-lumina-600 border-lumina-600'
            : 'bg-white border-neutral-400',
          error && !checked && !indeterminate && 'border-semantic-error',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !checked && !indeterminate && 'hover:border-lumina-500'
        )}
      >
        {indeterminate ? (
          <Minus className="w-3 h-3 text-white" strokeWidth={3} />
        ) : checked ? (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        ) : null}
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          onClick={handleChange}
          className={cn(
            'text-sm text-neutral-900 cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
