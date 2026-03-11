"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  closeOnOverlay?: boolean;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  className,
  closeOnOverlay = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (closeOnOverlay && e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-elevated animate-scale-in",
          sizeStyles[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-2">
            {title && <h2 className="font-heading text-h3 text-text-primary">{title}</h2>}
            {description && <p className="text-body-sm text-text-secondary mt-1">{description}</p>}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-cream-200 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

export { Modal, type ModalProps };
