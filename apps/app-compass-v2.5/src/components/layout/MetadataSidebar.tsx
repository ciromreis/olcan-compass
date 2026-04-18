"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

export interface MetadataField {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}

export interface MetadataSection {
  title?: string;
  fields: MetadataField[];
}

export interface QuickAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "default" | "danger";
}

export interface MetadataSidebarProps {
  /** Grouped metadata sections */
  sections: MetadataSection[];
  /** Quick action buttons at the bottom */
  actions?: QuickAction[];
  /** Extra content (progress bars, charts, etc.) */
  extra?: ReactNode;
}

/**
 * Right-column metadata sidebar for detail pages (bento column pattern).
 *
 * Displays structured metadata fields grouped by section, plus quick actions.
 * Designed to pair with DetailPageShell's `sidebar` prop.
 *
 * Usage:
 * ```tsx
 * <DetailPageShell
 *   sidebar={
 *     <MetadataSidebar
 *       sections={[
 *         { title: "Detalhes", fields: [
 *           { label: "Tipo", value: "CV", icon: FileText },
 *           { label: "Palavras", value: "1,234", icon: AlignLeft },
 *         ]},
 *       ]}
 *       actions={[
 *         { label: "Exportar PDF", icon: Download, onClick: handleExport },
 *       ]}
 *     />
 *   }
 * >
 * ```
 */
export function MetadataSidebar({ sections, actions, extra }: MetadataSidebarProps) {
  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm"
        >
          {section.title ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {section.title}
            </p>
          ) : null}
          <div className="space-y-3">
            {section.fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                    <span>{field.label}</span>
                  </div>
                  <div className="text-right text-sm font-medium text-text-primary">
                    {field.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {extra}

      {actions && actions.length > 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Ações Rápidas
          </p>
          <div className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const className = `flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                action.variant === "danger"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-slate-700 hover:bg-slate-100"
              }`;

              if (action.href) {
                return (
                  <a key={action.label} href={action.href} className={className}>
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {action.label}
                  </a>
                );
              }
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={className}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
