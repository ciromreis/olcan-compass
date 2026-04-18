"use client";

import { type ReactNode } from "react";
import { Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export interface MetricCard {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  color?: "brand" | "sage" | "clay" | "cream";
}

export interface ListPageShellProps {
  /** Page title */
  title: string;
  /** Description shown below the title */
  description?: string;
  /** Metric cards shown at the top */
  metrics?: MetricCard[];
  /** Search input value */
  searchValue?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Filter controls (rendered inline after search) */
  filters?: ReactNode;
  /** CTA button at top right — href or onClick */
  createHref?: string;
  createLabel?: string;
  onCreate?: () => void;
  /** Optional sidebar for saved views, filters, categories */
  sidebar?: ReactNode;
  /** Empty state content when no items exist */
  emptyState?: ReactNode;
  /** The list content */
  children: ReactNode;
}

const COLOR_MAP: Record<string, string> = {
  brand: "text-brand-500 bg-brand-50",
  sage: "text-sage-600 bg-sage-50",
  clay: "text-clay-500 bg-clay-50",
  cream: "text-slate-600 bg-slate-50",
};

/**
 * Shared shell for all list pages (Routes, Forge, Interviews, Applications, etc.).
 *
 * Provides:
 * 1. Title + CTA button
 * 2. Metric cards row
 * 3. Search + filter bar
 * 4. Optional left sidebar (for categories / saved views)
 * 5. Empty state
 *
 * Usage:
 * ```tsx
 * <ListPageShell
 *   title="Documentos"
 *   description="Gerencie narrativas, CVs e cartas de motivação."
 *   metrics={[{ label: "Total", value: docs.length }]}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   createHref="/forge/new"
 *   createLabel="Novo Documento"
 * >
 *   {filteredDocs.map(doc => <DocCard key={doc.id} doc={doc} />)}
 * </ListPageShell>
 * ```
 */
export function ListPageShell({
  title,
  description,
  metrics,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  createHref,
  createLabel = "Novo",
  onCreate,
  sidebar,
  emptyState,
  children,
}: ListPageShellProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-h2 text-text-primary">{title}</h1>
          {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
        </div>
        {createHref ? (
          <Link href={createHref}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          </Link>
        ) : onCreate ? (
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        ) : null}
      </div>

      {/* Metrics */}
      {metrics && metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {metrics.map((m) => {
            const colorClass = COLOR_MAP[m.color || "brand"] || COLOR_MAP.brand;
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {m.label}
                  </span>
                  {Icon ? (
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
                <p className="mt-2 text-2xl font-bold text-text-primary">{m.value}</p>
                {m.trend ? <p className="mt-1 text-xs text-text-muted">{m.trend}</p> : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Search + Filters */}
      {(onSearchChange || filters) ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onSearchChange ? (
            <Input
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="sm:max-w-sm"
            />
          ) : null}
          {filters}
        </div>
      ) : null}

      {/* Content + Optional Sidebar */}
      {sidebar ? (
        <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="hidden space-y-3 lg:block">
            <div className="sticky top-24 space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
              {sidebar}
            </div>
          </aside>
          <div className="min-w-0">{children || emptyState}</div>
        </div>
      ) : (
        children || emptyState
      )}
    </div>
  );
}
