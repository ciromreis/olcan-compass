import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "moss" | "clay" | "gradient";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const barStyles = {
  moss: "bg-brand-500",
  clay: "bg-clay-500",
  gradient: "bg-gradient-moss",
};

function Progress({
  value,
  max = 100,
  size = "md",
  variant = "moss",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-body-sm font-medium text-text-primary">{label}</span>}
          {showLabel && <span className="text-caption text-text-muted">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn("w-full rounded-full bg-cream-300 overflow-hidden", sizeStyles[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-slow", barStyles[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { Progress, type ProgressProps };
