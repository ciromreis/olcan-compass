"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Star, Plus, Trash2, ArrowRight, Eye } from "lucide-react";
import { useApplicationStore } from "@/stores/applications";
import { ConfirmationModal, EmptyState, PageHeader, useToast } from "@/components/ui";
import { daysUntil, formatDate } from "@/lib/format";

export default function WatchlistPage() {
  const { toast } = useToast();
  const { applications, removeApplication } = useApplicationStore();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  // Watchlist = draft applications that haven't been actively worked on
  const watched = applications
    .filter((a) => a.status === "draft" || a.status === "waitlisted")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleRemove = () => {
    if (!pendingRemoveId) return;
    removeApplication(pendingRemoveId);
    toast({
      title: "Removido da watchlist",
      description: "A candidatura foi removida da sua lista de acompanhamento.",
      variant: "warning",
    });
    setPendingRemoveId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Watchlist"
        subtitle={`${watched.length} oportunidades sendo acompanhadas`}
        backHref="/applications"
        actions={
          <Link href="/applications/opportunities" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
            <Plus className="w-4 h-4" /> Explorar
          </Link>
        }
      />

      {watched.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Nenhuma oportunidade na watchlist"
          description="Explore oportunidades ou crie uma nova candidatura como rascunho."
          action={
            <div className="flex gap-3">
              <Link href="/applications/opportunities" className="text-moss-500 font-medium hover:underline">Explorar →</Link>
              <Link href="/applications/new" className="text-moss-500 font-medium hover:underline">Criar nova →</Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          {watched.map((item) => {
            const dl = daysUntil(item.deadline);
            return (
              <div key={item.id} className="card-surface p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading text-h4 text-text-primary">{item.program}</h3>
                    <div className="flex gap-3 mt-1 text-body-sm text-text-secondary">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.country}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(item.deadline)}</span>
                      {item.match > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-moss-500" />Match: {item.match}%</span>}
                      {dl <= 14 && dl > 0 && <span className="text-clay-500 font-medium">{dl} dias!</span>}
                    </div>
                  </div>
                  <button onClick={() => setPendingRemoveId(item.id)} className="p-2 rounded-lg hover:bg-cream-200 transition-colors" title="Remover"><Trash2 className="w-4 h-4 text-text-muted" /></button>
                </div>
                {item.notes && <p className="text-body-sm text-text-muted italic mb-3">{item.notes}</p>}
                <div className="flex gap-3">
                  <Link href={`/applications/${item.id}`} className="inline-flex items-center gap-1 text-body-sm font-medium text-moss-500 hover:text-moss-600 transition-colors">
                    Ver Detalhes <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        open={pendingRemoveId !== null}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={handleRemove}
        title="Remover da watchlist?"
        description="Esta candidatura deixará de aparecer na sua lista de acompanhamento."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
