"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  className?: string;
}

function Stat({
  label,
  value,
  delta,
  deltaType = "neutral",
  icon: Icon,
  iconColor = "text-moss-500",
  iconBg = "bg-moss-50",
  subtitle,
  className,
}: StatProps) {
  return (
    <div className={cn("card-surface p-6", className)}>
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
            <Icon className={cn("w-[18px] h-[18px]", iconColor)} />
          </div>
        )}
        <p className="text-body-sm font-heading font-semibold text-text-secondary">{label}</p>
      </div>
      <p className="font-heading text-h2 text-text-primary">{value}</p>
      {delta && (
        <p
          className={cn(
            "text-caption mt-1 font-medium",
            deltaType === "positive" && "text-green-600",
            deltaType === "negative" && "text-error",
            deltaType === "neutral" && "text-text-muted"
          )}
        >
          {delta}
        </p>
      )}
      {subtitle && <p className="text-caption text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export { Stat, type StatProps };
