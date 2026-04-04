"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageSquare,
  Send,
  ExternalLink,
  Tag,
  Share2,
  Clock,
  User,
} from "lucide-react";
import { useCommunityStore } from "@/stores/community";
import { useAuthStore } from "@/stores/auth";
import { useHydration } from "@/hooks/use-hydration";
import { GlassCard } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  olcan_post: "Conteúdo Olcan",
  saved_reference: "Referência salva",
  artifact: "Artefato",
  question: "Pergunta",
};

const TOPIC_LABELS: Record<string, string> = {
  narrative: "Narrativa",
  visa: "Vistos",
  scholarship: "Bolsas",
  interview: "Entrevistas",
  career: "Carreira",
  readiness: "Prontidão",
  community: "Comunidade",
};

export default function CommunityPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const ready = useHydration();
  const { user } = useAuthStore();
  const { items, toggleLike, toggleSave, addReply } = useCommunityStore();

  const [replyDraft, setReplyDraft] = useState("");

  const item = items.find((entry) => entry.id === postId);

  const handleReplySubmit = () => {
    if (!replyDraft.trim() || !item) return;
    addReply(item.id, {
      author: user?.full_name || "Você",
      body: replyDraft.trim(),
    });
    setReplyDraft("");
  };

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-4 w-20 bg-[#001338]/5 rounded" />
        <div className="h-32 bg-[#001338]/5 rounded-3xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <GlassCard variant="olcan" padding="xl" className="border-[#001338]/10">
          <MessageSquare className="w-12 h-12 text-[#001338]/20 mx-auto mb-4" />
          <h2 className="font-heading text-h3 text-[#001338] mb-2">Post não encontrado</h2>
          <p className="text-body text-[#001338]/60 mb-8 max-w-sm mx-auto italic">
            Este post pode ter sido removido ou o link está incorreto.
          </p>
          <Link href="/community" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#001338] text-white font-heading font-semibold text-body-sm hover:shadow-lg hover:shadow-[#001338]/20 transition-all">
            Voltar à Comunidade
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-body-sm text-[#001338]/40 hover:text-[#001338] transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar à Comunidade
      </button>

      {/* Post content */}
      <GlassCard variant="olcan" padding="xl" className="border-[#001338]/10">
        <div className="space-y-6">
          {/* Meta header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#001338]/5 text-[#001338]/80 text-caption font-semibold">
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#001338]/5 text-[#001338]/60 text-caption font-medium">
              {TOPIC_LABELS[item.topic] ?? item.topic}
            </span>
          </div>

          <div>
            <h1 className="font-heading text-h2 text-[#001338] leading-[1.15] mb-4">{item.title}</h1>
            <p className="text-body text-[#001338]/70 leading-relaxed font-normal">{item.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-caption text-[#001338]/40">
              <span className="flex items-center gap-1.5 font-medium text-[#001338]/60"><User className="w-3.5 h-3.5" />{item.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDate(item.createdAt)}</span>
            </div>
            {item.href && (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-body-sm font-semibold text-[#001338] hover:translate-x-1 transition-transform"
              >
                <ExternalLink className="w-4 h-4" />
                {item.source ?? "Ver fonte"}
              </a>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[#001338]/5">
              <Tag className="w-3.5 h-3.5 text-[#001338]/20" />
              {item.tags.map((tag) => (
                <span key={tag} className="text-caption text-[#001338]/40 px-2.5 py-0.5 rounded-full bg-[#001338]/5 hover:bg-[#001338]/10 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social actions */}
          <div className="flex items-center gap-6 pt-6 border-t border-[#001338]/5">
            <button
              onClick={() => toggleLike(item.id)}
              className={cn("inline-flex items-center gap-2 text-body-sm font-semibold transition-all", 
                item.isLiked ? "text-rose-600 scale-105" : "text-[#001338]/40 hover:text-rose-600")}
            >
              <Heart className={cn("w-5 h-5", item.isLiked && "fill-current")} />
              {item.likeCount} Curtidas
            </button>
            <button
              onClick={() => toggleSave(item.id)}
              className={cn("inline-flex items-center gap-2 text-body-sm font-semibold transition-all",
                item.isSaved ? "text-[#001338] scale-105" : "text-[#001338]/40 hover:text-[#001338]")}
            >
              <Bookmark className={cn("w-5 h-5", item.isSaved && "fill-current")} />
              {item.isSaved ? "Salvo" : "Salvar"}
            </button>
            <button className="inline-flex items-center gap-2 text-body-sm font-semibold text-[#001338]/40 hover:text-[#001338] transition-all ml-auto">
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Responses section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-h4 text-[#001338]">Comentários e Insights</h2>
          <span className="text-caption font-bold text-[#001338]/40 uppercase tracking-widest">{item.replyCount} Respostas</span>
        </div>

        {/* Reply input card */}
        <GlassCard variant="olcan" padding="lg" className="border-[#001338]/10">
          <div className="space-y-4">
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="Adicione um insight ou pergunta complementar... (⌘+Enter para enviar)"
              className="w-full min-h-[120px] p-4 rounded-2xl bg-[#001338]/5 text-[#001338] placeholder:text-[#001338]/30 focus:outline-none focus:ring-2 focus:ring-[#001338]/10 text-body-sm resize-none border-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-caption text-[#001338]/30 italic">Pense antes de postar: como este insight ajuda outros candidatos?</p>
              <button
                onClick={handleReplySubmit}
                disabled={!replyDraft.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#001338] text-white font-heading font-semibold text-body-sm hover:shadow-lg transition-all disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Replies list */}
        <div className="space-y-4">
          {(item.replies ?? []).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-sm text-[#001338]/30 italic">Ninguém compartilhou nada ainda. Quebre o gelo!</p>
            </div>
          ) : (
            (item.replies ?? [])
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((reply) => (
                <GlassCard key={reply.id} variant="olcan" padding="lg" className="border-[#001338]/5">
                  <div className="flex items-center justify-between border-b border-[#001338]/5 pb-3 mb-3">
                    <span className="font-heading font-bold text-body-sm text-[#001338]">{reply.author}</span>
                    <span className="text-caption text-[#001338]/30 font-medium">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-body-sm text-[#001338]/70 leading-relaxed">{reply.body}</p>
                </GlassCard>
              ))
          )}
        </div>
      </section>
    </div>
  );
}
