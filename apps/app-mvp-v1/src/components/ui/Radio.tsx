import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  disabled?: boolean;
  error?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Radio: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name: _name,
  disabled = false,
  error = false,
  orientation = 'vertical',
  className,
}) => {
  const [_focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex(
      (opt) => opt.value === options[index].value
    );

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        if (currentEnabledIndex < enabledOptions.length - 1) {
          const nextOption = enabledOptions[currentEnabledIndex + 1];
          onChange?.(nextOption.value);
          setFocusedIndex(options.findIndex((opt) => opt.value === nextOption.value));
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        if (currentEnabledIndex > 0) {
          const prevOption = enabledOptions[currentEnabledIndex - 1];
          onChange?.(prevOption.value);
          setFocusedIndex(options.findIndex((opt) => opt.value === prevOption.value));
        }
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!options[index].disabled) {
          onChange?.(options[index].value);
        }
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option, index) => {
        const isChecked = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-2 cursor-pointer',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              role="radio"
              aria-checked={isChecked}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : isChecked ? 0 : -1}
              onClick={() => !isDisabled && onChange?.(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              className={cn(
                'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all mt-0.5',
                'focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-offset-2',
                isChecked
                  ? 'border-cyan bg-void-primary'
                  : 'border-neutral-400 bg-white',
                error && !isChecked && 'border-semantic-error',
                !isDisabled && !isChecked && 'hover:border-cyan/50'
              )}
            >
              {isChecked && (
                <div className="w-2.5 h-2.5 rounded-full bg-cyan" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm text-neutral-900 select-none">
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-neutral-600 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

export const RadioGroup = Radio;
