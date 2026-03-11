import Link from "next/link";
import { ArrowRight, Bookmark, MessageSquare } from "lucide-react";
import type { CommunityItem } from "@/stores/community";

interface CommunityContextSectionProps {
  title: string;
  description: string;
  ctaLabel?: string;
  items: CommunityItem[];
  columns?: 2 | 3;
  emptyWhenNoItems?: boolean;
}

export function CommunityContextSection({
  title,
  description,
  ctaLabel = "Ver Conteúdo",
  items,
  columns = 3,
  emptyWhenNoItems = false,
}: CommunityContextSectionProps) {
  if (!items.length && !emptyWhenNoItems) return null;

  const gridClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <div className="card-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-h4 text-text-primary">{title}</h3>
          <p className="mt-1 text-body-sm text-text-secondary">{description}</p>
        </div>
        <Link href="/community" className="inline-flex items-center gap-2 text-body-sm font-medium text-brand-500 transition-colors hover:text-brand-600">
          {ctaLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className={`grid gap-3 ${gridClass}`}>
        {items.map((item) => (
          <Link key={item.id} href="/community" className="rounded-xl border border-cream-300 bg-cream-50 p-4 transition-colors hover:bg-cream-100">
            <div className="mb-2 flex items-center gap-2 text-caption text-text-muted">
              {item.type === "question" ? <MessageSquare className="w-3.5 h-3.5 text-brand-500" /> : <Bookmark className="w-3.5 h-3.5 text-sage-500" />}
              <span>{item.type === "question" ? "Pergunta útil" : "Referência útil"}</span>
            </div>
            <p className="text-body-sm font-semibold text-text-primary">{item.title}</p>
            <p className="mt-1 text-caption text-text-secondary">{item.description}</p>
            {(item.savedCount > 0 || item.replyCount > 0) && (
              <div className="mt-3 flex items-center gap-3 text-caption text-text-muted">
                <span>{item.savedCount} saves</span>
                <span>{item.replyCount} respostas</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export type { CommunityContextSectionProps };
