"use client";

import { useState, useMemo } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useAdminStore, type AdminUserRole, type AdminUserStatus } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";

const ROLE_COLORS: Record<string, string> = {
  USER: "bg-cream-200 text-text-muted",
  PROVIDER: "bg-brand-50 text-brand-500",
  SUPER_ADMIN: "bg-clay-50 text-clay-500",
  ORG_ADMIN: "bg-sage-50 text-sage-500",
};

export default function AdminUsersPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const actorEmail = user?.email || "admin@olcan.com";
  const { users, updateUserRole, updateUserStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = users;
    if (search) { const q = search.toLowerCase(); list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, search, roleFilter]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Usuários" subtitle={`${users.length} usuários registrados`} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-secondary text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="all">Todos</option>
          <option value="USER">Usuário</option>
          <option value="PROVIDER">Provedor</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ORG_ADMIN">Org Admin</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum usuário encontrado" description="Ajuste a busca ou filtro." />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Usuário</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Role</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Plano</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Cadastro</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-text-primary">{u.name}</p>
                    <p className="text-caption text-text-muted">{u.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(event) => updateUserRole(u.id, event.target.value as AdminUserRole, actorEmail)}
                      className={`text-caption px-2 py-0.5 rounded-full font-medium border-0 ${ROLE_COLORS[u.role] || "bg-cream-200 text-text-muted"}`}
                    >
                      <option value="USER">USER</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="ORG_ADMIN">ORG_ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{u.plan}</td>
                  <td className="py-3 px-4 text-text-muted">{formatDate(u.joined)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-caption font-medium ${u.status === "active" ? "text-brand-500" : u.status === "blocked" ? "text-clay-500" : "text-text-muted"}`}>
                      {u.status === "active" ? "Ativo" : u.status === "blocked" ? "Bloqueado" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const nextStatus: AdminUserStatus = u.status === "active" ? "inactive" : "active";
                        updateUserStatus(u.id, nextStatus, actorEmail);
                        toast({
                          title: "Status atualizado",
                          description: `${u.name} agora está ${nextStatus === "active" ? "ativo" : "inativo"}.`,
                          variant: "success",
                        });
                      }}
                      className="p-1 rounded hover:bg-cream-200"
                    >
                      <MoreHorizontal className="w-4 h-4 text-text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
