"use client";

import { useState, useMemo } from "react";
import { Search, Filter, UserPlus, MoreHorizontal, TrendingUp } from "lucide-react";
import { useHydration } from "@/hooks";
import { Button, EmptyState, Input, Modal, PageHeader, Skeleton, useToast } from "@/components/ui";
import { useOrgStore, type OrgMemberRole } from "@/stores/org";

const ROLE_LABELS: Record<OrgMemberRole, string> = {
  member: "Membro",
  coordinator: "Coordenador",
  admin: "Admin",
  owner: "Dono",
};

const ROLE_COLORS: Record<string, string> = {
  member: "bg-cream-200 text-text-muted",
  coordinator: "bg-brand-50 text-brand-500",
  admin: "bg-clay-50 text-clay-500",
  owner: "bg-brand-500 text-white",
};

export default function OrgMembersPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const {
    members,
    inviteMember,
    updateMemberRole,
    setMemberStatus,
    logActivity,
  } = useOrgStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgMemberRole>("member");

  const filtered = useMemo(() => {
    let list = members;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }
    if (roleFilter !== "all") list = list.filter((m) => m.role === roleFilter);
    return list;
  }, [members, search, roleFilter]);

  const activeCount = members.filter((m) => m.status === "active").length;

  const handleInvite = async () => {
    const normalized = inviteEmail.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      toast({
        title: "E-mail inválido",
        description: "Informe um e-mail válido para enviar o convite.",
        variant: "warning",
      });
      return;
    }

    try {
      await inviteMember(normalized, inviteRole);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      toast({
        title: "Convite enviado",
        description: `${normalized} foi adicionado como convidado.`,
        variant: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Erro ao convidar",
        description: (err as Error).message || "Não foi possível processar o convite.",
        variant: "error",
      });
    }
  };

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/org" title="Membros" subtitle={`${activeCount} membros ativos`} actions={
        <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-heading font-semibold text-body-sm hover:bg-brand-600 transition-colors">
          <UserPlus className="w-4 h-4" /> Convidar
        </button>
      } />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar membros..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-secondary text-body-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="all">Todos</option>
          <option value="member">Membro</option>
          <option value="coordinator">Coordenador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Filter} title="Nenhum membro encontrado" description="Ajuste a busca ou filtro." />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Membro</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Role</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Score</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Rota</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-text-primary">{m.name}</p>
                    <p className="text-caption text-text-muted">{m.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={m.role}
                      onChange={(event) => {
                        const nextRole = event.target.value as OrgMemberRole;
                        updateMemberRole(m.id, nextRole);
                        logActivity(`${m.name} agora está com role ${nextRole}`);
                      }}
                      className={`text-caption px-3 py-1 rounded-full font-medium border-0 focus:ring-0 cursor-pointer ${ROLE_COLORS[m.role as OrgMemberRole] || "bg-cream-200 text-text-muted"}`}
                    >
                      {Object.entries(ROLE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">{typeof m.score === "number" ? <span className="flex items-center justify-center gap-1 font-bold text-brand-500"><TrendingUp className="w-3 h-3" />{m.score}</span> : <span className="text-text-muted">—</span>}</td>
                  <td className="py-3 px-4 text-text-secondary">{m.route || "—"}</td>
                  <td className="py-3 px-4"><span className={`text-caption font-medium ${m.status === "active" ? "text-brand-500" : m.status === "invited" ? "text-clay-400" : "text-text-muted"}`}>{m.status === "active" ? "Ativo" : m.status === "invited" ? "Convidado" : "Inativo"}</span></td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const nextStatus = m.status === "active" ? "inactive" : "active";
                        setMemberStatus(m.id, nextStatus);
                        logActivity(`${m.name} teve status alterado para ${nextStatus === "active" ? "ativo" : "inativo"}`);
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

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Convidar membro"
        description="Adicione um novo membro à organização com role inicial."
        size="sm"
      >
        <div className="space-y-4">
          <Input label="E-mail" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="nome@empresa.com" />
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Role inicial</label>
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as OrgMemberRole)} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="member">Membro</option>
              <option value="coordinator">Coordenador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvite}><UserPlus className="w-4 h-4" /> Enviar convite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
