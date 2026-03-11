import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "moss" | "clay" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-cream-200 text-text-secondary",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  moss: "bg-brand-50 text-brand-600 border border-brand-200",
  clay: "bg-clay-50 text-clay-600 border border-clay-200",
  outline: "bg-transparent border border-cream-500 text-text-secondary",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-caption",
};

function Badge({ variant = "default", size = "md", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-heading font-semibold rounded-full whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
