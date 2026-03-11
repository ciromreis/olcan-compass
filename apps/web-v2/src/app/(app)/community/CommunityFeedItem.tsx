import Link from "next/link";
import { ArrowRight, Bookmark, Heart, Link2, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui";
import { COMMUNITY_ENGINE_ACTION_LABELS, getCommunityDirectReuseTarget, getCommunityWorkflowTarget } from "@/lib/community-reuse";
import { formatDate } from "@/lib/format";
import type { CommunityItem, CommunityItemTopic, CommunityItemType, CommunitySourceRef } from "@/stores/community";

type EngineFilter = "all" | CommunitySourceRef["engine"];

interface CommunityFeedItemProps {
  item: CommunityItem;
  collectionId?: string;
  collectionNames: string[];
  activeCollectionName?: string;
  replyDraft: string;
  engineLabels: Record<Exclude<EngineFilter, "all">, string>;
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
  const workflowContext = [
    engineLabel ? { label: "Engine", value: engineLabel } : null,
    workflowTarget ? { label: "Etapa sugerida", value: workflowTarget.label } : null,
    item.sourceRef?.entityLabel ? { label: "Origem conectada", value: item.sourceRef.entityLabel } : null,
    item.href ? { label: "Acesso", value: isExternalHref ? "Referência externa" : "Fluxo interno" } : null,
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry));

  return (
    <article className="card-surface p-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-moss-50 px-2.5 py-1 text-caption font-medium text-moss-600">{typeLabels[item.type]}</span>
            <span className="rounded-full bg-cream-100 px-2.5 py-1 text-caption text-text-secondary">{topicLabels[item.topic]}</span>
            {item.source ? <span className="rounded-full bg-cream-100 px-2.5 py-1 text-caption text-text-secondary">{item.source}</span> : null}
            {engineLabel ? <span className="rounded-full bg-sage-50 px-2.5 py-1 text-caption font-medium text-sage-600">Origem: {engineLabel}</span> : null}
          </div>
          <div>
            <h2 className="font-heading text-h4 text-text-primary">{item.title}</h2>
            <p className="mt-1 text-body-sm text-text-secondary">{item.description}</p>
            {item.sourceRef?.entityLabel ? (
              <p className="mt-2 text-caption text-text-muted">Conectado a: {item.sourceRef.entityLabel}</p>
            ) : null}
            {workflowTarget ? (
              <p className="mt-2 text-caption font-medium text-sage-700">Próximo passo sugerido: {workflowTarget.label}</p>
            ) : null}
            {workflowContext.length ? (
              <div className="mt-3 grid gap-2 rounded-xl border border-sage-200 bg-sage-50/70 p-3 md:grid-cols-2">
                {workflowContext.map((entry) => (
                  <div key={entry.label} className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sage-600">{entry.label}</p>
                    <p className="text-caption text-sage-800">{entry.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {collectionNames.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {collectionNames.map((collectionName) => {
                  const isActiveCollection = activeCollectionName === collectionName;
                  return (
                    <span
                      key={collectionName}
                      className={`rounded-full px-2.5 py-1 text-caption ${isActiveCollection ? "bg-sage-100 font-medium text-sage-700" : "bg-cream-100 text-text-secondary"}`}
                    >
                      Coleção: {collectionName}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 text-caption text-text-muted">
            <span>Por {item.author}</span>
            <span>•</span>
            <span>{formatDate(item.createdAt)}</span>
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-cream-100 px-2 py-0.5">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {item.sourceRef && item.href && !isExternalHref ? (
            <Link href={item.href} className="inline-flex items-center gap-2 rounded-lg bg-moss-500 px-4 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-moss-600">
              <ArrowRight className="h-4 w-4" />
              {engineActionLabel}
            </Link>
          ) : null}
          {directReuseTarget ? (
            <Link href={directReuseTarget.href} className="inline-flex items-center gap-2 rounded-lg border border-moss-300 bg-moss-50 px-4 py-2.5 text-body-sm font-medium text-moss-700 transition-colors hover:bg-moss-100">
              <ArrowRight className="h-4 w-4" />
              {directReuseTarget.label}
            </Link>
          ) : null}
          {workflowTarget ? (
            <Link href={workflowTarget.href} className="inline-flex items-center gap-2 rounded-lg border border-sage-300 bg-sage-50 px-4 py-2.5 text-body-sm font-medium text-sage-700 transition-colors hover:bg-sage-100">
              <ArrowRight className="h-4 w-4" />
              {workflowTarget.label}
            </Link>
          ) : null}
          {item.href ? (
            <a href={item.href} target={isExternalHref ? "_blank" : undefined} rel={isExternalHref ? "noreferrer" : undefined} className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-4 py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:bg-cream-200">
              <Link2 className="h-4 w-4" />
              {item.sourceRef && !isExternalHref ? `Ver na ${engineLabel}` : "Abrir"}
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-cream-200 pt-4">
        <button onClick={() => onToggleSave(item.id, collectionId)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors ${item.isSaved ? "bg-moss-50 text-moss-600" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>
          <Bookmark className="h-4 w-4" />
          Salvar ({item.savedCount})
        </button>
        <button onClick={() => onToggleLike(item.id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors ${item.isLiked ? "bg-clay-50 text-clay-500" : "border border-cream-500 text-text-secondary hover:bg-cream-200"}`}>
          <Heart className="h-4 w-4" />
          Curtir ({item.likeCount})
        </button>
        <div className="inline-flex items-center gap-2 rounded-lg border border-cream-500 px-3 py-2 text-body-sm text-text-secondary">
          <MessageSquare className="h-4 w-4" />
          {item.replyCount} respostas
        </div>
      </div>

      <div className="rounded-xl border border-cream-300 bg-cream-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Textarea
            value={replyDraft}
            onChange={(event) => onReplyChange(item.id, event.target.value)}
            placeholder="Adicione uma resposta curta, insight ou complemento útil..."
            rows={2}
            className="flex-1"
          />
          <button
            onClick={() => onReplySubmit(item.id)}
            disabled={!replyDraft.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-moss-500 px-4 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-moss-600 disabled:pointer-events-none disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            Responder
          </button>
        </div>
      </div>

      {item.replies?.length ? (
        <div className="space-y-3 rounded-xl bg-cream-50 p-4">
          {item.replies.slice(0, 2).map((reply) => (
            <div key={reply.id} className="rounded-lg bg-white px-4 py-3">
              <p className="text-body-sm text-text-primary">{reply.body}</p>
              <p className="mt-1 text-caption text-text-muted">{reply.author} • {formatDate(reply.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
