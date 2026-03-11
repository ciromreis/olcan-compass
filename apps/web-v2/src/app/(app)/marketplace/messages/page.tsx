"use client";

import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default function MessagesListPage() {
  const hydrated = useHydration();
  const { conversations, markConversationRead } = useMarketplaceStore();

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const activeConversations = conversations.filter((conversation) => conversation.lastMessage.trim().length > 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Mensagens" subtitle={totalUnread > 0 ? `${totalUnread} não lida${totalUnread > 1 ? "s" : ""}` : `${conversations.length} conversas`} backHref="/marketplace" />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">{conversations.length}</p>
          <p className="text-caption text-text-muted">Conversas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-brand-500">{totalUnread}</p>
          <p className="text-caption text-text-muted">Não lidas</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-heading font-bold text-h3 text-text-primary">{activeConversations}</p>
          <p className="text-caption text-text-muted">Com atividade</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Nenhuma conversa" description="Inicie uma conversa com um profissional do marketplace." />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/marketplace/messages/${conv.id}`}
              onClick={() => conv.unread > 0 && markConversationRead(conv.id)}
              className="card-surface p-4 flex items-center gap-4 group hover:bg-cream-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-500 font-heading font-bold">
                {conv.providerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-semibold text-body-sm text-text-primary">{conv.providerName}</p>
                  {conv.unread > 0 && <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">{conv.unread}</span>}
                </div>
                <p className="text-caption text-text-muted truncate">{conv.lastMessage}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-caption text-text-muted">{formatDate(conv.lastMessageAt)}</span>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
