import { cn } from "@/lib/utils";
import { scoreColor } from "@/lib/format";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg" | "display";
  highThreshold?: number;
  midThreshold?: number;
  fallback?: string;
  className?: string;
}

const sizeStyles = {
  sm: "text-caption font-bold",
  md: "font-heading font-bold text-h4",
  lg: "font-heading font-bold text-h3",
  display: "font-heading text-display",
};

function ScoreBadge({
  score,
  size = "md",
  highThreshold = 70,
  midThreshold = 50,
  fallback = "—",
  className,
}: ScoreBadgeProps) {
  if (score == null) {
    return <span className={cn(sizeStyles[size], "text-text-muted", className)}>{fallback}</span>;
  }

  return (
    <span className={cn(sizeStyles[size], scoreColor(score, highThreshold, midThreshold), className)}>
      {score}
    </span>
  );
}

export { ScoreBadge, type ScoreBadgeProps };
