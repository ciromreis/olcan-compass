"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { getCommandPaletteEntries } from "@/lib/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AppCommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const entries = useMemo(() => getCommandPaletteEntries(), []);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return entries;
    return entries.filter(
      (e) =>
        e.label.toLowerCase().includes(t) ||
        e.href.toLowerCase().includes(t) ||
        e.group.toLowerCase().includes(t),
    );
  }, [entries, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar busca"
      />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-label="Busca e navegação rápida"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ir para página…"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[min(60vh,22rem)] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500">Nenhum resultado.</li>
          ) : (
            filtered.map((e) => (
              <li key={e.href}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
                  onClick={() => {
                    router.push(e.href);
                    onClose();
                  }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {e.group}
                  </span>
                  <span className="font-medium text-slate-900">{e.label}</span>
                  <span className="text-xs text-slate-400">{e.href}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          Dica: use <kbd className="rounded bg-slate-100 px-1">⌘</kbd>{" "}
          <kbd className="rounded bg-slate-100 px-1">K</kbd> para abrir de qualquer lugar.
        </p>
      </div>
    </div>
  );
}
