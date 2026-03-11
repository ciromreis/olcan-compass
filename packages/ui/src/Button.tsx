import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-moss-500 text-white hover:bg-moss-600 active:bg-moss-700 focus-visible:ring-moss-400 focus-visible:ring-offset-cream-300",
      secondary:
        "bg-cream-200 text-text-primary border border-cream-500 hover:bg-cream-300 active:bg-cream-400 focus-visible:ring-moss-400 focus-visible:ring-offset-cream-300",
      accent:
        "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 focus-visible:ring-clay-400 focus-visible:ring-offset-cream-300",
      ghost:
        "bg-transparent text-text-secondary hover:bg-cream-200 active:bg-cream-300 focus-visible:ring-moss-400 focus-visible:ring-offset-cream-300",
      danger:
        "bg-error text-white hover:opacity-90 active:opacity-80 focus-visible:ring-error focus-visible:ring-offset-cream-300",
    };

    const sizes = {
      sm: "text-body-sm px-3 py-1.5 gap-1.5",
      md: "text-body px-4 py-2 gap-2",
      lg: "text-body-lg px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
