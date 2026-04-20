"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DetailTab {
  key: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  /** Hide from tab bar but still accessible via direct URL */
  hidden?: boolean;
}

export interface DetailPageShellProps {
  /** Back link destination */
  backHref: string;
  /** Back link label */
  backLabel: string;
  /** Page title (e.g. document name, route name) */
  title: string;
  /** Optional subtitle/badge area */
  subtitle?: React.ReactNode;
  /** Tab definitions — the currently active tab is inferred from pathname */
  tabs: DetailTab[];
  /** Content for the right metadata sidebar (bento column). If omitted, full width is used. */
  sidebar?: React.ReactNode;
  /** Header action buttons (e.g. Save, Delete, Share) */
  actions?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
}

/**
 * Shared shell for all detail pages (Forge editor, Route detail, Interview detail).
 *
 * Provides:
 * 1. Back navigation link
 * 2. Title + action bar
 * 3. Persistent horizontal tab bar for sub-pages
 * 4. Optional right sidebar (bento-column) for metadata
 *
 * Usage example:
 * ```tsx
 * <DetailPageShell
 *   backHref="/forge"
 *   backLabel="Documentos"
 *   title={doc.title}
 *   tabs={FORGE_TABS(docId)}
 *   sidebar={<ForgeMetadataSidebar doc={doc} />}
 *   actions={<Button>Salvar</Button>}
 * >
 *   {children}
 * </DetailPageShell>
 * ```
 */
export function DetailPageShell({
  backHref,
  backLabel,
  title,
  subtitle,
  tabs,
  sidebar,
  actions,
  children,
}: DetailPageShellProps) {
  const pathname = usePathname();

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.hidden), [tabs]);

  const activeTabKey = useMemo(() => {
    // Match the most specific tab first (longest href match)
    const sorted = [...tabs].sort((a, b) => b.href.length - a.href.length);
    const match = sorted.find((tab) => pathname === tab.href || pathname.startsWith(tab.href + "/"));
    return match?.key ?? tabs[0]?.key;
  }, [pathname, tabs]);

  return (
    <div className="space-y-4">
      {/* Back + Title + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="truncate font-heading text-h3 text-text-primary">{title}</h1>
            {subtitle}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {/* Tab Bar */}
      {visibleTabs.length > 1 ? (
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/50 p-1.5 backdrop-blur-sm">
          {visibleTabs.map((tab) => {
            const isActive = tab.key === activeTabKey;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-slate-950 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {/* Content + Optional Sidebar */}
      {sidebar ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">{children}</div>
          <aside className="hidden space-y-4 lg:block">
            <div className="sticky top-24 space-y-4">{sidebar}</div>
          </aside>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────
 * Pre-built tab configs for each domain.
 * Future models: import these and pass to DetailPageShell.
 * ─────────────────────────────────────────────────────── */

export function forgeDetailTabs(docId: string): DetailTab[] {
  const base = `/forge/${docId}`;
  return [
    { key: "editor", label: "Editor", href: base },
    { key: "versions", label: "Versões", href: `${base}/versions` },
    { key: "analysis", label: "Análise", href: `${base}/analysis` },
    { key: "ats", label: "ATS", href: `${base}/ats-optimizer` },
    { key: "cv", label: "CV Builder", href: `${base}/cv-builder` },
    { key: "coach", label: "Coach", href: `${base}/coach` },
    { key: "alignment", label: "Alinhamento", href: `${base}/alignment` },
    { key: "compare", label: "Comparar", href: `${base}/compare` },
    { key: "competitiveness", label: "Competitividade", href: `${base}/competitiveness` },
    { key: "export", label: "Exportar", href: `${base}/export` },
  ];
}

export function routeDetailTabs(routeId: string): DetailTab[] {
  const base = `/routes/${routeId}`;
  return [
    { key: "overview", label: "Visão Geral", href: base },
    { key: "milestones", label: "Milestones", href: `${base}/milestones` },
    { key: "timeline", label: "Linha do Tempo", href: `${base}/timeline` },
    { key: "graph", label: "Dependências", href: `${base}/graph` },
    { key: "risk", label: "Riscos", href: `${base}/risk` },
    { key: "iterate", label: "Iterar", href: `${base}/iterate` },
    { key: "settings", label: "Ajustes", href: `${base}/settings` },
  ];
}

export function interviewDetailTabs(sessionId: string): DetailTab[] {
  const base = `/interviews/${sessionId}`;
  return [
    { key: "overview", label: "Visão Geral", href: base },
    { key: "session", label: "Simulação", href: `${base}/session` },
    { key: "feedback", label: "Feedback", href: `${base}/feedback` },
    { key: "voice", label: "Voz", href: `${base}/voice` },
  ];
}
