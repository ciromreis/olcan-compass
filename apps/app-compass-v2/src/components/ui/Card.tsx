import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass" | "accent";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "card-surface",
  elevated: "bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-cream-200/50",
  outlined: "bg-white/90 backdrop-blur-sm rounded-xl border border-cream-400/60 shadow-sm",
  glass: "glass-panel rounded-xl shadow-glass",
  accent: "bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-xl shadow-lg border border-brand-400/20",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

function Card({ className, variant = "default", interactive = false, padding = "md", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        interactive && "cursor-pointer hover:-translate-y-0.5 transition-transform duration-fast",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-heading text-h4 text-text-primary", className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-body-sm text-text-secondary", className)} {...props}>
      {children}
    </p>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, type CardProps };
