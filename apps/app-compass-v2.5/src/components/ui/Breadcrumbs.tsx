/**
 * @component Breadcrumbs
 * @layer Navigation / UI
 * @purpose Show user position in ASPIRATION → EXECUTION flow
 * 
 * Usage:
 * <Breadcrumbs items={[
 *   { label: "Dashboard", href: "/dashboard" },
 *   { label: "Applications", href: "/applications" },
 *   { label: "MIT PhD", href: "/applications/123" }
 * ]} />
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
            )}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast && "font-medium text-slate-900 dark:text-slate-100"
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Helper to generate breadcrumbs from pathname
 * Maps routes to ASPIRATION → EXECUTION flow
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Painel", href: "/dashboard" }
  ];

  // Map first segment to flow stage
  if (segments.length === 0) return breadcrumbs;

  const firstSegment = segments[0];
  
  const flowMap: Record<string, { label: string; stage: string }> = {
    "routes": { label: "Caminhos", stage: "ASPIRATION" },
    "readiness": { label: "Prontidão", stage: "ASPIRATION" },
    "applications": { label: "Candidaturas", stage: "OPPORTUNITY" },
    "forge": { label: "Documentos", stage: "DOSSIER" },
    "tasks": { label: "Tarefas", stage: "DOSSIER" },
    "interviews": { label: "Sessões", stage: "EXECUTION" },
    "sprints": { label: "Sprints", stage: "EXECUTION" },
    "marketplace": { label: "Mercado", stage: "SUPPORT" },
    "profile": { label: "Perfil", stage: "BASE" },
    "wiki": { label: "Arquétipo", stage: "BASE" },
  };

  const mapping = flowMap[firstSegment];
  if (mapping) {
    breadcrumbs.push({
      label: mapping.label,
      href: `/${firstSegment}`
    });
  }

  // Add detail pages (e.g., /applications/123)
  if (segments.length > 1 && segments[1] !== "new") {
    // For dynamic routes, show generic label
    // In real usage, you'd fetch the actual title from store
    const detailLabels: Record<string, string> = {
      "routes": "Detalhes do Caminho",
      "applications": "Detalhes da Candidatura",
      "forge": "Editor de Documento",
      "interviews": "Sessão de Entrevista",
    };

    if (detailLabels[firstSegment]) {
      breadcrumbs.push({
        label: detailLabels[firstSegment]
      });
    }
  }

  // Add "new" pages
  if (segments.includes("new")) {
    const newLabels: Record<string, string> = {
      "routes": "Novo Caminho",
      "applications": "Nova Candidatura",
      "forge": "Novo Documento",
      "interviews": "Nova Sessão",
      "sprints": "Novo Sprint",
    };

    if (newLabels[firstSegment]) {
      breadcrumbs.push({
        label: newLabels[firstSegment]
      });
    }
  }

  return breadcrumbs;
}
