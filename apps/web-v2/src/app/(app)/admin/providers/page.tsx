"use client";

import { useState, useMemo } from "react";
import { Search, Star, CheckCircle, Clock, X, MoreHorizontal } from "lucide-react";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState, useToast } from "@/components/ui";

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  approved: { label: "Aprovado", color: "text-moss-500", icon: CheckCircle },
  pending: { label: "Pendente", color: "text-clay-400", icon: Clock },
  rejected: { label: "Rejeitado", color: "text-clay-500", icon: X },
  suspended: { label: "Suspenso", color: "text-clay-500", icon: X },
};

export default function AdminProvidersPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { providers, setProviderVerified, removeProvider } = useMarketplaceStore();
  const { logAdminAction } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mapped = useMemo(() => providers.map((p) => ({
    id: p.id,
    name: p.name,
    specialty: p.specialties.join(", ") || p.bio.slice(0, 40),
    pei: p.verified ? Math.round(p.rating * 20) : null,
    rating: p.rating,
    reviews: p.reviews.length,
    status: p.verified ? "approved" : "pending",
  })), [providers]);

  const filtered = useMemo(() => {
    let list = mapped;
    if (search) { const q = search.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q)); }
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [mapped, search, statusFilter]);

  const pendingCount = mapped.filter((p) => p.status === "pending").length;

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Provedores" subtitle={`${mapped.length} provedores · ${pendingCount} aguardando aprovação`} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar provedores..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-moss-400 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-secondary text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-moss-400">
          <option value="all">Todos</option>
          <option value="approved">Aprovados</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum provedor encontrado" description="Ajuste a busca ou filtro." />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Provedor</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">PEI</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Rating</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Reviews</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = STATUS_MAP[p.status] || STATUS_MAP.pending;
                return (
                  <tr key={p.id} className={`border-b border-cream-200 hover:bg-cream-50 transition-colors ${p.status === "pending" ? "bg-clay-50/30" : ""}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-text-primary">{p.name}</p>
                      <p className="text-caption text-text-muted">{p.specialty}</p>
                    </td>
                    <td className="py-3 px-4 text-center">{p.pei ? <span className="font-bold text-moss-500">{p.pei}</span> : <span className="text-text-muted">—</span>}</td>
                    <td className="py-3 px-4 text-center">{p.rating ? <span className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-clay-500 fill-current" />{p.rating}</span> : "—"}</td>
                    <td className="py-3 px-4 text-center text-text-muted">{p.reviews}</td>
                    <td className="py-3 px-4"><span className={`flex items-center gap-1 ${st.color}`}><st.icon className="w-3.5 h-3.5" />{st.label}</span></td>
                    <td className="py-3 px-4">
                      {p.status === "pending" ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setProviderVerified(p.id, true);
                              logAdminAction({
                                actor: actorEmail,
                                module: "providers",
                                action: "approve_provider",
                                target: p.id,
                                summary: `Provedor ${p.name} aprovado no marketplace.`,
                              });
                              toast({
                                title: "Provedor aprovado",
                                description: `${p.name} agora está aprovado no marketplace.`,
                                variant: "success",
                              });
                            }}
                            className="px-2 py-1 rounded bg-moss-500 text-white text-caption font-medium"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              removeProvider(p.id);
                              logAdminAction({
                                actor: actorEmail,
                                module: "providers",
                                action: "reject_provider",
                                target: p.id,
                                summary: `Provedor ${p.name} removido da base de provedores.`,
                              });
                              toast({
                                title: "Provedor removido",
                                description: `${p.name} foi removido da lista de provedores.`,
                                variant: "warning",
                              });
                            }}
                            className="px-2 py-1 rounded border border-clay-300 text-clay-500 text-caption font-medium"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <button className="p-1 rounded hover:bg-cream-200"><MoreHorizontal className="w-4 h-4 text-text-muted" /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
