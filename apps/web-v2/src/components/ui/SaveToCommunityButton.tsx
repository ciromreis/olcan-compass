import { BookmarkPlus } from "lucide-react";
import { Button, type ButtonProps } from "./Button";

interface SaveToCommunityButtonProps extends Omit<ButtonProps, "children"> {
  label?: string;
}

export function SaveToCommunityButton({
  label = "Salvar na Comunidade",
  className,
  variant = "secondary",
  size = "md",
  ...props
}: SaveToCommunityButtonProps) {
  return (
    <Button variant={variant} size={size} className={className} {...props}>
      <BookmarkPlus className="h-4 w-4 text-sage-500" />
      {label}
    </Button>
  );
}

export type { SaveToCommunityButtonProps };
