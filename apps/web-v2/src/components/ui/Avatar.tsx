import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  sm: "w-7 h-7 text-caption",
  md: "w-9 h-9 text-body-sm",
  lg: "w-12 h-12 text-body",
  xl: "w-16 h-16 text-h4",
};

const pixelSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name || "Avatar"}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        unoptimized
        className={cn("rounded-full object-cover flex-shrink-0", sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center bg-moss-50 text-moss-600 font-heading font-semibold",
        sizeStyles[size],
        className
      )}
      aria-label={name || "Avatar"}
    >
      {getInitials(name)}
    </div>
  );
}

export { Avatar, type AvatarProps };
