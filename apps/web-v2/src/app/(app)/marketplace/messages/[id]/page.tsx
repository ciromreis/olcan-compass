"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Paperclip, Shield, User, MessageSquare, X, FileText } from "lucide-react";
import { CATEGORY_LABELS, useMarketplaceStore } from "@/stores/marketplace";
import { useHydration } from "@/hooks";
import { EmptyState, Input, PageHeader, Skeleton, useToast } from "@/components/ui";

export default function MessageThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydration();
  const { toast } = useToast();
  const { conversations, getProviderById, sendMessage, markConversationRead } = useMarketplaceStore();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number; type: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const conversation = hydrated ? conversations.find((conv) => conv.id === id) : undefined;
  const provider = conversation ? getProviderById(conversation.providerId) : undefined;

  useEffect(() => {
    if (conversation && conversation.unread > 0) {
      markConversationRead(conversation.id);
    }
  }, [conversation, markConversationRead]);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon={MessageSquare}
          title="Conversa não encontrada"
          description="Esta conversa não está mais disponível."
          action={<button onClick={() => router.push("/marketplace/messages")} className="px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors">Voltar às mensagens</button>}
        />
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    sendMessage(conversation.id, input.trim(), attachments);
    setInput("");
    setAttachments([]);
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      })),
    ]);

    toast({
      title: "Anexo preparado",
      description: `${files.length} arquivo${files.length > 1 ? "s" : ""} pronto${files.length > 1 ? "s" : ""} para envio nesta conversa.`,
      variant: "success",
    });

    event.target.value = "";
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((item) => item.id !== attachmentId));
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader backHref="/marketplace/messages" title={conversation.providerName} subtitle={provider ? provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ") : "Conversa ativa"} />

      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-cream-300">
        <div className="w-10 h-10 rounded-full bg-moss-50 flex items-center justify-center flex-shrink-0 text-moss-500 font-heading font-bold text-body-sm">{conversation.providerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-text-primary">{conversation.providerName}</p>
          <p className="text-caption text-text-muted">{provider ? provider.specialties.map((s) => CATEGORY_LABELS[s]).join(" · ") : "Profissional do marketplace"}</p>
        </div>
        <div className="flex items-center gap-1 text-caption text-moss-500">
          <Shield className="w-3 h-3" /> Escrow ativo
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {conversation.messages.map((msg) => {
          const isUser = msg.senderId === "me";
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-moss-50 flex items-center justify-center flex-shrink-0 text-moss-500 font-bold text-caption">{conversation.providerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
              )}
              <div className={`max-w-[75%] p-4 rounded-xl ${isUser ? "bg-moss-500 text-white" : "card-surface"}`}>
                {msg.content ? (
                  <p className={`text-body-sm ${isUser ? "text-white" : "text-text-primary"}`}>{msg.content}</p>
                ) : null}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`space-y-2 ${msg.content ? "mt-3" : ""}`}>
                    {msg.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-caption ${
                          isUser ? "bg-moss-600 text-moss-50" : "bg-cream-100 text-text-secondary"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{attachment.name}</span>
                        <span className={`${isUser ? "text-moss-100" : "text-text-muted"}`}>{formatFileSize(attachment.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className={`text-[10px] mt-1 ${isUser ? "text-moss-200" : "text-text-muted"}`}>{new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-text-muted" /></div>
              )}
            </div>
          );
        })}
      </div>

      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1.5 text-caption text-text-secondary">
              <FileText className="w-3.5 h-3.5" />
              <span>{attachment.name}</span>
              <span className="text-text-muted">{formatFileSize(attachment.size)}</span>
              <button type="button" onClick={() => removeAttachment(attachment.id)} className="text-text-muted hover:text-clay-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />
        <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-xl border border-cream-500 hover:bg-cream-200 transition-colors"><Paperclip className="w-5 h-5 text-text-muted" /></button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={attachments.length > 0 ? "Adicione contexto para acompanhar os anexos..." : "Escreva sua mensagem..."}
          className="flex-1"
        />
        <button onClick={handleSend} className="px-4 py-3 rounded-xl bg-moss-500 text-white hover:bg-moss-600 transition-colors">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
