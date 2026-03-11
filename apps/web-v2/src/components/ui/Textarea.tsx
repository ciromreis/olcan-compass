import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-body-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-white text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent",
            "transition-colors duration-fast resize-none",
            "px-4 py-2.5",
            error ? "border-error" : "border-cream-500",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {error && <p className="text-caption text-error">{error}</p>}
        {hint && !error && <p className="text-caption text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea, type TextareaProps };
