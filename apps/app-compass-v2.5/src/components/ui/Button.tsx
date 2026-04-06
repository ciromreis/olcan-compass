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
    "btn-liquid bg-gradient-to-br from-brand-500 to-brand-700 text-white border border-brand-400/20",
  secondary:
    "bg-white/90 backdrop-blur-sm border border-cream-400/60 text-text-primary hover:bg-white hover:border-cream-500 active:bg-cream-50 shadow-sm",
  ghost:
    "text-text-secondary hover:bg-cream-200/80 hover:backdrop-blur-sm hover:text-text-primary active:bg-cream-300/80",
  danger:
    "bg-gradient-to-br from-error to-red-700 text-white hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 shadow-sm border border-red-400/20",
  accent:
    "bg-gradient-to-br from-clay-500 to-clay-700 text-white hover:from-clay-600 hover:to-clay-800 active:from-clay-700 active:to-clay-900 shadow-sm border border-clay-400/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-md",
  lg: "h-10 px-6 text-sm gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-md justify-center",
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
