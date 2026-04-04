import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-cream-300",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded-md h-4",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export { Skeleton, type SkeletonProps };
