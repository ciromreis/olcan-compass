"use client";

import Link from "next/link";
import { type LucideIcon, Construction } from "lucide-react";

interface ComingSoonPanelProps {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Honest placeholder when a route exists but the product slice is not shipped yet.
 */
export function ComingSoonPanel({
  title,
  description,
  backHref = "/dashboard",
  backLabel = "Voltar ao painel",
}: ComingSoonPanelProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-[2rem] border border-slate-200/80 bg-slate-50/90 px-8 py-12 text-center shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
        <Construction className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h1 className="font-heading text-xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-800/80">Em desenvolvimento</p>
      <Link
        href={backHref}
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {backLabel}
      </Link>
    </div>
  );
}

export function ComingSoonBanner({
  title,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/95 px-4 py-3 text-left text-sm text-slate-950">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" strokeWidth={1.75} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-slate-900/85">{description}</p>
      </div>
    </div>
  );
}
