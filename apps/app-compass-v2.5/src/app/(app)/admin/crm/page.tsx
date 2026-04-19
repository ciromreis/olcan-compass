"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  ExternalLink,
  RefreshCw,
  Settings,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, Button, useToast } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";
import { apiClient } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CrmLink {
  system: "twenty" | "mautic" | string;
  external_id: string | null;
  external_url: string | null;
  synced_at: string | null;
  status: string | null;
}

interface CrmLinksResponse {
  user_id: string;
  links: CrmLink[];
}

interface BulkSyncResult {
  synced: number;
  errors: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

function authHeaders(): HeadersInit {
  const token = apiClient.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function findLink(links: CrmLink[], system: string): CrmLink | undefined {
  return links.find((l) => l.system === system);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SystemStatusCardProps {
  name: string;
  icon: React.ReactNode;
}

function SystemStatusCard({ name, icon }: SystemStatusCardProps) {
  return (
    <div className="card-surface p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center shrink-0 text-text-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-h4 text-text-primary">{name}</span>
          <span className="inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Settings className="w-3 h-3" />
            Aguardando config.
          </span>
        </div>
        <p className="text-caption text-text-muted">
          Verifique as variáveis de ambiente no servidor
        </p>
      </div>
    </div>
  );
}

interface CrmLinkCardProps {
  title: string;
  icon: React.ReactNode;
  link: CrmLink | undefined;
  loading: boolean;
}

function CrmLinkCard({ title, icon, link, loading }: CrmLinkCardProps) {
  if (loading) {
    return (
      <div className="card-surface p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
    );
  }

  const hasLink = !!link?.external_id;

  return (
    <div className="card-surface p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-text-muted">{icon}</span>
        <span className="font-heading text-h4 text-text-primary">{title}</span>
        {hasLink ? (
          <span className="ml-auto inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Configurado
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-cream-100 text-text-muted border border-cream-200">
            <AlertCircle className="w-3 h-3" />
            Não sincronizado
          </span>
        )}
      </div>

      {hasLink ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-caption text-text-muted w-20 shrink-0">ID externo</span>
            <code className="text-caption font-mono text-text-primary bg-cream-50 px-2 py-0.5 rounded truncate max-w-[200px]">
              {link.external_id}
            </code>
          </div>
          {link.external_url && (
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-muted w-20 shrink-0">Link</span>
              <a
                href={link.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption text-brand-500 hover:text-brand-600 flex items-center gap-1 truncate max-w-[200px] transition-colors"
              >
                Abrir no CRM
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
          {link.synced_at && (
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-muted w-20 shrink-0">Última sync</span>
              <span className="text-caption text-text-secondary">{formatDate(link.synced_at)}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-caption text-text-muted">
          Nenhum vínculo encontrado. Clique em Sincronizar para criar.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CrmAdminPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [crmLinks, setCrmLinks] = useState<CrmLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [bulkLimit, setBulkLimit] = useState(50);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkSyncResult | null>(null);

  const isAdmin = user?.role === "admin";
  const apiBase = getApiBase();

  // -------------------------------------------------------------------------
  // Fetch CRM links for the current user
  // -------------------------------------------------------------------------
  const fetchCrmLinks = useCallback(async () => {
    if (!user?.id) return;
    setLinksLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/crm/users/${user.id}/crm-links`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data: CrmLinksResponse = await res.json();
      setCrmLinks(data.links ?? []);
    } catch (err) {
      toast({
        title: "Não foi possível carregar os vínculos CRM",
        description: (err as Error)?.message ?? "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setLinksLoading(false);
    }
  }, [user?.id, apiBase, toast]);

  useEffect(() => {
    if (hydrated && user?.id) {
      void fetchCrmLinks();
    }
  }, [hydrated, user?.id, fetchCrmLinks]);

  // -------------------------------------------------------------------------
  // Trigger registration sync for current user
  // -------------------------------------------------------------------------
  const handleSyncCurrentUser = async () => {
    if (!user?.id) return;
    setSyncLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/admin/crm/lifecycle/registration/${user.id}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      toast({
        title: "Sincronização concluída",
        description: "Seus dados foram enviados ao CRM com sucesso.",
        variant: "success",
      });
      await fetchCrmLinks();
    } catch (err) {
      toast({
        title: "Erro ao sincronizar",
        description: (err as Error)?.message ?? "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Admin: bulk historical backfill
  // -------------------------------------------------------------------------
  const handleBulkSync = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await fetch(
        `${apiBase}/admin/crm/bulk-sync/historical-users?limit=${bulkLimit}&offset=0`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data: BulkSyncResult = await res.json();
      setBulkResult(data);
      toast({
        title: "Backfill concluído",
        description: `${data.synced ?? 0} usuários sincronizados, ${data.errors ?? 0} erros.`,
        variant: data.errors > 0 ? "error" : "success",
      });
    } catch (err) {
      toast({
        title: "Erro no backfill",
        description: (err as Error)?.message ?? "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Skeleton while hydrating
  // -------------------------------------------------------------------------
  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const twentyLink = findLink(crmLinks, "twenty");
  const mauticLink = findLink(crmLinks, "mautic");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="CRM & Integrações"
      />

      {/* ----------------------------------------------------------------- */}
      {/* System Status                                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="font-heading text-h3 text-text-primary">Status dos Sistemas</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <SystemStatusCard
            name="Twenty CRM"
            icon={<Database className="w-5 h-5" />}
          />
          <SystemStatusCard
            name="Mautic"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* My CRM Links                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-heading text-h3 text-text-primary">Meus Vínculos CRM</h2>
          <Button
            onClick={() => void handleSyncCurrentUser()}
            disabled={syncLoading || linksLoading}
            className="bg-brand-500 text-white hover:bg-brand-600 flex items-center gap-2"
          >
            {syncLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {syncLoading ? "Sincronizando…" : "Sincronizar"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <CrmLinkCard
            title="Twenty CRM"
            icon={<Database className="w-4 h-4" />}
            link={twentyLink}
            loading={linksLoading}
          />
          <CrmLinkCard
            title="Mautic"
            icon={<Zap className="w-4 h-4" />}
            link={mauticLink}
            loading={linksLoading}
          />
        </div>

        {!linksLoading && crmLinks.length === 0 && (
          <p className="text-body-sm text-text-muted text-center py-2">
            Nenhum vínculo encontrado. Clique em Sincronizar para registrar sua conta no CRM.
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Admin Section                                                       */}
      {/* ----------------------------------------------------------------- */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-h3 text-text-primary">Operações de Admin</h2>
            <span className="text-caption font-medium px-2 py-0.5 rounded-full bg-[#001338]/10 text-[#001338] border border-[#001338]/20">
              Admin
            </span>
          </div>

          <div className="card-surface p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-text-muted" />
              </div>
              <div>
                <h3 className="font-heading text-h4 text-text-primary mb-1">
                  Backfill Histórico
                </h3>
                <p className="text-body-sm text-text-muted">
                  Sincroniza usuários existentes que ainda não possuem vínculo no CRM. Use com cautela em produção.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-cream-200">
              <div className="space-y-1.5">
                <label
                  htmlFor="bulk-limit"
                  className="block text-body-sm font-medium text-text-primary"
                >
                  Limite de usuários
                </label>
                <input
                  id="bulk-limit"
                  type="number"
                  min={1}
                  max={500}
                  value={bulkLimit}
                  onChange={(e) => setBulkLimit(Math.max(1, Math.min(500, Number(e.target.value))))}
                  className="w-28 px-3 py-2 rounded-lg border border-cream-500 bg-white text-text-primary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <Button
                onClick={() => void handleBulkSync()}
                disabled={bulkLoading}
                className="bg-[#001338] text-white hover:bg-[#001338]/90 flex items-center gap-2"
              >
                {bulkLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {bulkLoading ? "Processando…" : "Executar Backfill"}
              </Button>
            </div>

            {bulkResult && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  bulkResult.errors > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                {bulkResult.errors > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-body-sm font-medium text-text-primary">
                    Backfill concluído
                  </p>
                  <p className="text-caption text-text-secondary mt-0.5">
                    <span className="text-emerald-700 font-medium">{bulkResult.synced ?? 0} usuários sincronizados</span>
                    {bulkResult.errors > 0 && (
                      <>
                        {" · "}
                        <span className="text-red-600 font-medium">{bulkResult.errors} erros</span>
                      </>
                    )}
                    {bulkResult.message && ` · ${bulkResult.message}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
