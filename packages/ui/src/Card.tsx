import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "elevated" | "glass" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "surface",
      padding = "md",
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-lg transition-all duration-base";

    const variants = {
      surface:
        "bg-surface-card shadow-card border border-cream-300/50",
      elevated:
        "bg-surface-elevated shadow-lg border border-cream-300/30",
      glass:
        "glass-panel shadow-glass",
      outlined:
        "bg-transparent border border-cream-500",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    };

    const interactiveStyles = interactive
      ? "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
