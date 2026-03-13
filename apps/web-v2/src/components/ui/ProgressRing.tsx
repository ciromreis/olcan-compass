"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "moss" | "clay" | "gradient" | "auto";
  showValue?: boolean;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantColors: Record<string, string> = {
  moss: "stroke-brand-500",
  clay: "stroke-clay-500",
  gradient: "stroke-blue-500",
};

function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "auto",
  showValue = true,
  label,
  className,
  children,
}: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const resolvedVariant =
    variant === "auto"
      ? pct >= 65
        ? "moss"
        : pct >= 40
        ? "gradient"
        : "clay"
      : variant;

  const textColor =
    resolvedVariant === "moss"
      ? "text-brand-500"
      : resolvedVariant === "gradient"
      ? "text-blue-500"
      : "text-clay-500";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-cream-300"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", variantColors[resolvedVariant])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : (
          <>
            {showValue && (
              <span className={cn("font-heading font-bold", textColor, size >= 100 ? "text-h2" : "text-h4")}>
                {Math.round(pct)}
              </span>
            )}
            {label && <span className="text-caption text-text-muted">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
}

export { ProgressRing, type ProgressRingProps };
