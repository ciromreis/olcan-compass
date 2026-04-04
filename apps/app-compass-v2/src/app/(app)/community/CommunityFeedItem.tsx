"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Heart, Link2, MessageSquare, Send } from "lucide-react";
import { Textarea } from "@/components/ui";
import { COMMUNITY_ENGINE_ACTION_LABELS, getCommunityDirectReuseTarget, getCommunityWorkflowTarget } from "@/lib/community-reuse";
import { formatDate } from "@/lib/format";
import type { CommunityItem, CommunityItemTopic, CommunityItemType, CommunitySourceRef } from "@/stores/community";
import { GlassCard } from "@olcan/ui-components";
import { cn } from "@/lib/utils";

interface CommunityFeedItemProps {
  item: CommunityItem;
  collectionId?: string;
  collectionNames: string[];
  activeCollectionName?: string;
  replyDraft: string;
  engineLabels: Record<string, string>;
  topicLabels: Record<CommunityItemTopic, string>;
  typeLabels: Record<CommunityItemType, string>;
  onToggleSave: (itemId: string, collectionId?: string) => void;
  onToggleLike: (itemId: string) => void;
  onReplyChange: (itemId: string, value: string) => void;
  onReplySubmit: (itemId: string) => void;
}

export function CommunityFeedItem({
  item,
  collectionId,
  collectionNames,
  activeCollectionName,
  replyDraft,
  engineLabels,
  topicLabels,
  typeLabels,
  onToggleSave,
  onToggleLike,
  onReplyChange,
  onReplySubmit,
}: CommunityFeedItemProps) {
  const isExternalHref = !!item.href && item.href.startsWith("http");
  const engineLabel = item.sourceRef ? engineLabels[item.sourceRef.engine] : null;
  const engineActionLabel = item.sourceRef ? COMMUNITY_ENGINE_ACTION_LABELS[item.sourceRef.engine] : null;
  const workflowTarget = getCommunityWorkflowTarget(item);
  const directReuseTarget = getCommunityDirectReuseTarget(item);
  const detailHref = `/community/${item.id}`;

  const workflowContext = [
    engineLabel ? { label: "Engine", value: engineLabel } : null,
    workflowTarget ? { label: "Etapa sugerida", value: workflowTarget.label } : null,
    item.sourceRef?.entityLabel ? { label: "Origem conectada", value: item.sourceRef.entityLabel } : null,
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry));

  return (
    <GlassCard variant="olcan" padding="lg" hover className="border-[#001338]/10 group">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#001338]/5 px-2.5 py-1 text-caption font-semibold text-[#001338]">{typeLabels[item.type]}</span>
            <span className="rounded-full bg-[#001338]/5 px-2.5 py-1 text-caption text-[#001338]/60">{topicLabels[item.topic]}</span>
            {item.source ? <span className="rounded-full bg-[#001338]/5 px-2.5 py-1 text-caption text-[#001338]/60">{item.source}</span> : null}
            {engineLabel ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-emerald-700">Origem: {engineLabel}</span> : null}
          </div>
          <Link href={detailHref} className="block group">
            <h2 className="font-heading text-h4 text-[#001338] group-hover:text-[#001338]/80 transition-colors">{item.title}</h2>
            <p className="mt-2 text-body-sm text-[#001338]/60 line-clamp-2 leading-relaxed">{item.description}</p>
          </Link>
          
          {workflowContext.length > 0 && (
            <div className="grid gap-3 rounded-2xl border border-[#001338]/5 bg-[#001338]/5 p-4 md:grid-cols-3">
              {workflowContext.map((entry) => (
                <div key={entry.label} className="space-y-1">
                  <p className="text-caption font-bold uppercase tracking-wider text-[#001338]/40">{entry.label}</p>
                  <p className="text-caption text-[#001338] font-medium">{entry.value}</p>
                </div>
              ))}
            </div>
          )}

          {collectionNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collectionNames.map((name) => (
                <span key={name} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption transition-colors", 
                  activeCollectionName === name 
                    ? "bg-[#001338] text-white font-semibold" 
                    : "bg-[#001338]/5 text-[#001338]/60 border border-[#001338]/10")}>
                  <Bookmark className="w-3 h-3" /> {name}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 text-caption text-[#001338]/40 pt-2">
            <span className="font-medium text-[#001338]/60">Por {item.author}</span>
            <span>•</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:w-48 md:justify-end shrink-0">
          <Link href={detailHref} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#001338]/10 px-4 py-2.5 text-body-sm font-semibold text-[#001338] transition-all hover:bg-[#001338]/5">
            Abrir Post
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          {item.sourceRef && item.href && !isExternalHref && (
            <Link href={item.href} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#001338] px-4 py-2.5 text-body-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#001338]/20">
              {engineActionLabel}
            </Link>
          )}

          {directReuseTarget && (
            <Link href={directReuseTarget.href} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-body-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100">
              {directReuseTarget.label}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-[#001338]/5 pt-6 mt-4">
        <div className="flex items-center gap-4">
          <button onClick={() => onToggleLike(item.id)} className={cn("inline-flex items-center gap-2 transition-colors", item.isLiked ? "text-rose-600" : "text-[#001338]/40 hover:text-rose-600")}>
            <Heart className={cn("h-4 w-4", item.isLiked && "fill-current")} />
            <span className="text-body-sm font-medium">{item.likeCount}</span>
          </button>
          <button onClick={() => onToggleSave(item.id, collectionId)} className={cn("inline-flex items-center gap-2 transition-colors", item.isSaved ? "text-[#001338]" : "text-[#001338]/40 hover:text-[#001338]")}>
            <Bookmark className={cn("h-4 w-4", item.isSaved && "fill-current")} />
            <span className="text-body-sm font-medium">{item.savedCount}</span>
          </button>
          <div className="inline-flex items-center gap-2 text-[#001338]/40">
            <MessageSquare className="h-4 w-4" />
            <span className="text-body-sm font-medium">{item.replyCount}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <input
            value={replyDraft}
            onChange={(event) => onReplyChange(item.id, event.target.value)}
            placeholder="Responder à comunidade..."
            className="flex-1 bg-[#001338]/5 rounded-xl border-none px-4 py-2 text-body-sm text-[#001338] placeholder:text-[#001338]/30 focus:ring-1 focus:ring-[#001338]/10 h-10"
          />
          <button
            onClick={() => onReplySubmit(item.id)}
            disabled={!replyDraft.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#001338] text-white disabled:opacity-30 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
