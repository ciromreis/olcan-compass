import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "moss"
  | "clay"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-steel-100 text-steel-700",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-steel-100 text-steel-600 border border-steel-200",
  error: "bg-error/10 text-error border border-error/20",
  info: "bg-info/10 text-info border border-info/20",
  moss: "bg-steel-100 text-steel-600 border border-steel-200",
  clay: "bg-steel-200 text-steel-800 border border-steel-300",
  outline: "bg-transparent border border-steel-200 text-steel-600",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-caption",
  md: "px-2.5 py-0.5 text-caption",
};

function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-heading font-semibold rounded-full whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
