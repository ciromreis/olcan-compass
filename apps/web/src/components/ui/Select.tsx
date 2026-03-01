import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchable = false,
  multiple = false,
  disabled = false,
  error = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
    ? [value]
    : [];

  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues as string[]);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const newValues = selectedValues.filter((v) => v !== optionValue);
      onChange?.(newValues as string[]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        break;
    }
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer',
          'bg-neutral-50 border-neutral-300',
          'hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan',
          error && 'border-semantic-error focus:ring-semantic-error',
          disabled && 'opacity-50 cursor-not-allowed hover:border-neutral-300',
          isOpen && 'border-cyan ring-2 ring-cyan/50'
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[24px]">
          {selectedLabels.length > 0 ? (
            multiple ? (
              selectedLabels.map((label, idx) => (
                <span
                  key={`${selectedValues[idx]}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-blue/10 text-cyan rounded text-sm"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(selectedValues[idx] as string, e)}
                    className="hover:text-white"
                    aria-label={`Remover ${label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-neutral-900">{selectedLabels[0]}</span>
            )
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-500 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
          role="listbox"
          aria-multiselectable={multiple}
        >
          {searchable && (
            <div className="p-2 border-b border-neutral-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan/50"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                      'hover:bg-primary-blue/5',
                      isSelected && 'bg-primary-blue/10 text-primary-blue font-medium',
                      isFocused && 'bg-primary-blue/5',
                      option.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan" />}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-neutral-500 text-center">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
