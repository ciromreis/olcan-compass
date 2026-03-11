import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm",
  secondary:
    "bg-white border border-cream-500 text-text-primary hover:bg-cream-100 active:bg-cream-200",
  ghost:
    "text-text-secondary hover:bg-cream-200 hover:text-text-primary active:bg-cream-300",
  danger:
    "bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  accent:
    "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-body-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-body gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-lg justify-center",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-heading font-semibold transition-colors duration-fast focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
