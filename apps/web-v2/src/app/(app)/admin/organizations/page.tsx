"use client";

import { useState, useMemo } from "react";
import { Search, Building2, MoreHorizontal } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default function AdminOrganizationsPage() {
  const hydrated = useHydration();
  // We'll mock organizations here since adminStore might not have them natively yet, or we assume it exists.
  const [organizations] = useState([
    { id: "org-1", name: "University of Toronto", type: "UNIVERSITY", members: 120, status: "active", joined: "2024-03-01T10:00:00Z" },
    { id: "org-2", name: "TechNova Inc.", type: "CORPORATE", members: 45, status: "active", joined: "2024-05-15T09:30:00Z" },
    { id: "org-3", name: "Global Nomads Agency", type: "AGENCY", members: 12, status: "suspended", joined: "2024-01-20T14:20:00Z" }
  ]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = organizations;
    if (search) { 
      const q = search.toLowerCase(); 
      list = list.filter((o) => o.name.toLowerCase().includes(q)); 
    }
    return list;
  }, [organizations, search]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader backHref="/admin" title="Organizações" subtitle={`${organizations.length} organizações B2B cadastradas`} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar organização por nome..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhuma organização encontrada" description="Ajuste a busca." />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Tipo</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Membros</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Cadastro</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-500" />
                    {o.name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{o.type}</td>
                  <td className="py-3 px-4 text-center text-text-secondary">{o.members}</td>
                  <td className="py-3 px-4 text-text-muted">{formatDate(o.joined)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-caption font-medium ${o.status === "active" ? "text-brand-500" : "text-clay-500"}`}>
                      {o.status === "active" ? "Ativa" : "Suspensa"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 rounded hover:bg-cream-200"><MoreHorizontal className="w-4 h-4 text-text-muted" /></button>
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
