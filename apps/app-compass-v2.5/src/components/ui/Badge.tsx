import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "moss" | "clay" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-slate-50 text-slate-700 border border-slate-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  moss: "bg-slate-100 text-slate-600 border border-slate-200",
  clay: "bg-slate-200 text-slate-800 border border-slate-300",
  outline: "bg-transparent border border-slate-200 text-slate-600",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-caption",
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
