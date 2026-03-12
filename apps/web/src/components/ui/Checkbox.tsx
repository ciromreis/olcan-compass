import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-cream-400 text-brand-500 focus:ring-brand-400 focus:ring-offset-0',
              error ? 'border-error' : 'border-cream-400',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="text-body-sm text-text-primary cursor-pointer select-none">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-caption text-error">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export { Checkbox, type CheckboxProps };
