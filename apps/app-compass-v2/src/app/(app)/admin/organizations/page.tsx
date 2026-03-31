"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Building2, MoreHorizontal } from "lucide-react";
import { useHydration } from "@/hooks";
import { applicationsApi } from "@/lib/api";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

interface OpportunityItem {
  id: string;
  title: string;
  opportunity_type: string;
  organization_name?: string | null;
  organization_country?: string | null;
  created_at: string;
}

interface OrganizationRow {
  id: string;
  name: string;
  type: string;
  members: number;
  status: "active";
  joined: string;
  country?: string;
  opportunities: number;
}

function guessOrganizationType(opportunityTypes: string[]): string {
  if (opportunityTypes.includes("job") || opportunityTypes.includes("internship")) {
    return "CORPORATE";
  }
  if (opportunityTypes.includes("exchange_program") || opportunityTypes.includes("research_position")) {
    return "UNIVERSITY";
  }
  if (opportunityTypes.includes("scholarship") || opportunityTypes.includes("grant")) {
    return "FOUNDATION";
  }
  return "PARTNER";
}

export default function AdminOrganizationsPage() {
  const hydrated = useHydration();
  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    async function loadOrganizations() {
      setLoading(true);
      try {
        const response = await applicationsApi.getOpportunities();
        const items: OpportunityItem[] = response.data?.items || [];

        const grouped = new Map<string, OrganizationRow & { rawTypes: Set<string> }>();

        for (const item of items) {
          const name = item.organization_name?.trim();
          if (!name) continue;

          const existing = grouped.get(name);
          if (existing) {
            existing.opportunities += 1;
            existing.rawTypes.add(item.opportunity_type);
            existing.joined =
              new Date(item.created_at).getTime() < new Date(existing.joined).getTime()
                ? item.created_at
                : existing.joined;
            if (!existing.country && item.organization_country) {
              existing.country = item.organization_country;
            }
            continue;
          }

          grouped.set(name, {
            id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name,
            type: "PARTNER",
            members: 0,
            status: "active",
            joined: item.created_at,
            country: item.organization_country || undefined,
            opportunities: 1,
            rawTypes: new Set([item.opportunity_type]),
          });
        }

        const nextOrganizations = Array.from(grouped.values())
          .map(({ rawTypes, ...organization }) => ({
            ...organization,
            type: guessOrganizationType(Array.from(rawTypes)),
          }))
          .sort((left, right) => left.name.localeCompare(right.name));

        setOrganizations(nextOrganizations);
      } catch {
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    }

    void loadOrganizations();
  }, [hydrated]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((organization) =>
      organization.name.toLowerCase().includes(query)
    );
  }, [organizations, search]);

  if (!hydrated || loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        backHref="/admin"
        title="Organizações"
        subtitle={`${organizations.length} organizações derivadas das oportunidades reais da plataforma`}
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar organização por nome..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma organização encontrada"
          description="Ainda não há organizações inferidas a partir das oportunidades publicadas."
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Tipo</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Oportunidades</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">País</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Primeiro registro</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((organization) => (
                <tr
                  key={organization.id}
                  className="border-b border-cream-200 hover:bg-cream-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-500" />
                      {organization.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{organization.type}</td>
                  <td className="py-3 px-4 text-center text-text-secondary">
                    {organization.opportunities}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {organization.country || "—"}
                  </td>
                  <td className="py-3 px-4 text-text-muted">{formatDate(organization.joined)}</td>
                  <td className="py-3 px-4">
                    <span className="text-caption font-medium text-brand-500">Ativa</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 rounded hover:bg-cream-200">
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
