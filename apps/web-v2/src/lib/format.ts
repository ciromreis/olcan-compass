/**
 * Shared formatting utilities — single source of truth for date, score, and text formatting.
 * Eliminates 30+ duplicated toLocaleDateString/score-color patterns across pages.
 */

// ── Date formatting ──────────────────────────────────────────────────────────

const PT_BR = "pt-BR";

export function formatDate(date: string | Date, style: "short" | "medium" | "long" = "medium"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  switch (style) {
    case "short":
      return d.toLocaleDateString(PT_BR, { day: "2-digit", month: "short" });
    case "medium":
      return d.toLocaleDateString(PT_BR);
    case "long":
      return d.toLocaleDateString(PT_BR, { day: "2-digit", month: "long", year: "numeric" });
  }
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const raw = d.toLocaleDateString(PT_BR, { month: "long", year: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return formatDate(d, "short");
}

// ── Score / Color utilities ──────────────────────────────────────────────────

export type ScoreTier = "high" | "mid" | "low";

export function scoreTier(score: number, highThreshold = 70, midThreshold = 50): ScoreTier {
  if (score >= highThreshold) return "high";
  if (score >= midThreshold) return "mid";
  return "low";
}

export function scoreColor(score: number, highThreshold = 70, midThreshold = 50): string {
  const tier = scoreTier(score, highThreshold, midThreshold);
  return tier === "high" ? "text-moss-500" : tier === "mid" ? "text-amber-500" : "text-clay-500";
}

export function scoreBgColor(score: number, highThreshold = 70, midThreshold = 50): string {
  const tier = scoreTier(score, highThreshold, midThreshold);
  return tier === "high" ? "bg-moss-500" : tier === "mid" ? "bg-amber-400" : "bg-clay-400";
}

export function scoreBarColor(score: number, highThreshold = 75, midThreshold = 60): string {
  const tier = scoreTier(score, highThreshold, midThreshold);
  return tier === "high" ? "bg-moss-500" : tier === "mid" ? "bg-clay-300" : "bg-clay-500";
}

// ── Text utilities ───────────────────────────────────────────────────────────

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function charCount(text: string): number {
  return text.length;
}

export function paragraphCount(text: string): number {
  return text.split("\n\n").filter(Boolean).length;
}

export function readingTime(text: string, wpm = 200): number {
  return Math.max(1, Math.ceil(wordCount(text) / wpm));
}

export function truncate(text: string, maxLen = 100): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

// ── Deadline status ──────────────────────────────────────────────────────────

export type DeadlineUrgency = "overdue" | "urgent" | "soon" | "normal";

export function deadlineUrgency(date: string | Date, urgentDays = 14, soonDays = 30): DeadlineUrgency {
  const days = daysUntil(date);
  if (days <= 0) return "overdue";
  if (days <= urgentDays) return "urgent";
  if (days <= soonDays) return "soon";
  return "normal";
}

export function deadlineColor(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case "overdue": return "text-clay-500";
    case "urgent": return "text-clay-500";
    case "soon": return "text-amber-500";
    case "normal": return "text-text-muted";
  }
}
