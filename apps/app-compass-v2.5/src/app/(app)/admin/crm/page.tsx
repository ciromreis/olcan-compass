"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  ExternalLink,
  RefreshCw,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  XCircle,
  Crown,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useHydration } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
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
  status?: string | null;
}

interface CrmLinksResponse {
  user_id: string;
  links: CrmLink[];
}

interface SystemHealth {
  ok: boolean;
  configured: boolean;
  latency_ms?: number;
  error?: string;
}

interface HealthResponse {
  twenty: SystemHealth;
  mautic: SystemHealth;
}

interface UserCrmRow {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  subscription_plan: string;
  is_premium: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  crm: {
    twenty: { synced: boolean; external_id: string | null; external_url: string | null; synced_at: string | null };
    mautic: { synced: boolean; external_id: string | null; external_url: string | null; synced_at: string | null };
  };
}

interface UserListResponse {
  total: number;
  limit: number;
  offset: number;
  users: UserCrmRow[];
}

interface BulkSyncResult {
  synced: number;
  errors: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const apiBase = API_ENDPOINTS.api.rest;

function authHeaders(): HeadersInit {
  const token = apiClient.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatDate(iso: string | null, style: "short" | "long" = "short"): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: style === "long" ? "medium" : "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function planBadge(plan: string, isPremium: boolean) {
  const label = isPremium ? plan.toUpperCase() : plan;
  const cls = isPremium
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-cream-100 text-text-muted border-cream-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls}`}>
      {isPremium && <Crown className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HealthBadge({ health }: { health: SystemHealth | undefined }) {
  if (!health) {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-cream-100 text-text-muted border border-cream-200">
        <Loader2 className="w-3 h-3 animate-spin" />
        Verificando…
      </span>
    );
  }
  if (!health.configured) {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3 h-3" />
        Sem config.
      </span>
    );
  }
  if (health.ok) {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Online · {health.latency_ms}ms
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-3 h-3" />
      Erro de conexão
    </span>
  );
}

function SystemStatusCard({
  name,
  icon,
  health,
}: {
  name: string;
  icon: React.ReactNode;
  health: SystemHealth | undefined;
}) {
  return (
    <div className="card-surface p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center shrink-0 text-text-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-h4 text-text-primary">{name}</span>
          <HealthBadge health={health} />
        </div>
        {health?.error && (
          <p className="text-caption text-red-600 truncate" title={health.error}>
            {health.error}
          </p>
        )}
        {!health?.error && (
          <p className="text-caption text-text-muted">
            {health?.configured ? "Credenciais configuradas" : "Defina TWENTY_BASE_URL / MAUTIC_BASE_URL no servidor"}
          </p>
        )}
      </div>
    </div>
  );
}

function SyncDot({ synced }: { synced: boolean }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${synced ? "bg-emerald-500" : "bg-cream-300"}`}
      title={synced ? "Sincronizado" : "Não sincronizado"}
    />
  );
}

function UserRow({
  row,
  onSync,
  syncing,
}: {
  row: UserCrmRow;
  onSync: (userId: string) => void;
  syncing: boolean;
}) {
  return (
    <tr className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
      <td className="px-3 py-2.5 min-w-[180px]">
        <p className="text-body-sm font-medium text-text-primary truncate max-w-[200px]">{row.email}</p>
        {row.full_name && (
          <p className="text-caption text-text-muted truncate max-w-[200px]">{row.full_name}</p>
        )}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          {planBadge(row.subscription_plan, row.is_premium)}
          {row.is_verified ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
              <ShieldCheck className="w-2.5 h-2.5" /> verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-text-muted">
              <AlertCircle className="w-2.5 h-2.5" /> não verificado
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <SyncDot synced={row.crm.twenty.synced} />
          {row.crm.twenty.synced && row.crm.twenty.external_url ? (
            <a
              href={row.crm.twenty.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
            >
              Ver <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-caption text-text-muted">—</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <SyncDot synced={row.crm.mautic.synced} />
          {row.crm.mautic.synced && row.crm.mautic.external_url ? (
            <a
              href={row.crm.mautic.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
            >
              Ver <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-caption text-text-muted">—</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        {row.last_login_at ? (
          <span className="text-caption text-text-secondary flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            {formatDate(row.last_login_at)}
          </span>
        ) : (
          <span className="text-caption text-text-muted">Nunca</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <button
          onClick={() => onSync(row.user_id)}
          disabled={syncing}
          className="inline-flex items-center gap-1 text-caption font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40 transition-colors"
        >
          {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Sync
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PAGE_SIZE = 50;

export default function CrmAdminPage() {
  const hydrated = useHydration();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // -- Own CRM links --
  const [crmLinks, setCrmLinks] = useState<CrmLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // -- Health --
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // -- User roster (admin) --
  const [userSearch, setUserSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userRows, setUserRows] = useState<UserCrmRow[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userOffset, setUserOffset] = useState(0);
  const [userLoading, setUserLoading] = useState(false);
  const [syncingUser, setSyncingUser] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Bulk sync --
  const [bulkLimit, setBulkLimit] = useState(50);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkSyncResult | null>(null);

  // -------------------------------------------------------------------------
  // Health check
  // -------------------------------------------------------------------------
  const fetchHealth = useCallback(async () => {
    if (!isAdmin) return;
    setHealthLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/crm/health`, { headers: authHeaders() });
      if (res.ok) setHealth(await res.json());
    } catch {
      // silently fail — badges just stay in loading state
    } finally {
      setHealthLoading(false);
    }
  }, [isAdmin]);

  // -------------------------------------------------------------------------
  // Own CRM links
  // -------------------------------------------------------------------------
  const fetchCrmLinks = useCallback(async () => {
    if (!user?.id) return;
    setLinksLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/crm/users/${user.id}/crm-links`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `HTTP ${res.status}`);
      const data: CrmLinksResponse = await res.json();
      setCrmLinks(data.links ?? []);
    } catch (err) {
      toast({ title: "Erro ao carregar vínculos", description: (err as Error).message, variant: "error" });
    } finally {
      setLinksLoading(false);
    }
  }, [user?.id, toast]);

  // -------------------------------------------------------------------------
  // User roster
  // -------------------------------------------------------------------------
  const fetchUsers = useCallback(
    async (search: string, offset: number) => {
      if (!isAdmin) return;
      setUserLoading(true);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
          ...(search ? { search } : {}),
        });
        const res = await fetch(`${apiBase}/admin/crm/users?${params}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: UserListResponse = await res.json();
        setUserRows(data.users);
        setUserTotal(data.total);
      } catch (err) {
        toast({ title: "Erro ao carregar usuários", description: (err as Error).message, variant: "error" });
      } finally {
        setUserLoading(false);
      }
    },
    [isAdmin, toast],
  );

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    void fetchCrmLinks();
    if (isAdmin) {
      void fetchHealth();
      void fetchUsers("", 0);
    }
  }, [hydrated, isAdmin, fetchCrmLinks, fetchHealth, fetchUsers]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(userSearch);
      setUserOffset(0);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [userSearch]);

  useEffect(() => {
    if (isAdmin) void fetchUsers(debouncedSearch, userOffset);
  }, [debouncedSearch, userOffset, isAdmin, fetchUsers]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const handleSyncCurrentUser = async () => {
    if (!user?.id) return;
    setSyncLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/crm/lifecycle/registration/${user.id}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `HTTP ${res.status}`);
      toast({ title: "Sincronização concluída", description: "Seus dados foram enviados ao CRM.", variant: "success" });
      void fetchCrmLinks();
    } catch (err) {
      toast({ title: "Erro ao sincronizar", description: (err as Error).message, variant: "error" });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSyncUser = async (userId: string) => {
    setSyncingUser(userId);
    try {
      const res = await fetch(`${apiBase}/admin/crm/lifecycle/registration/${userId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `HTTP ${res.status}`);
      toast({ title: "Usuário sincronizado", variant: "success" });
      void fetchUsers(debouncedSearch, userOffset);
    } catch (err) {
      toast({ title: "Erro ao sincronizar usuário", description: (err as Error).message, variant: "error" });
    } finally {
      setSyncingUser(null);
    }
  };

  const handleBulkSync = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await fetch(
        `${apiBase}/admin/crm/bulk-sync/historical-users?limit=${bulkLimit}&offset=0`,
        { method: "POST", headers: authHeaders() },
      );
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `HTTP ${res.status}`);
      const data: BulkSyncResult = await res.json();
      setBulkResult(data);
      toast({
        title: "Backfill concluído",
        description: `${data.synced ?? 0} sincronizados · ${data.errors ?? 0} erros`,
        variant: data.errors > 0 ? "error" : "success",
      });
      void fetchUsers(debouncedSearch, userOffset);
    } catch (err) {
      toast({ title: "Erro no backfill", description: (err as Error).message, variant: "error" });
    } finally {
      setBulkLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const twentyLink = crmLinks.find((l) => l.system === "twenty");
  const mauticLink = crmLinks.find((l) => l.system === "mautic");
  const totalPages = Math.ceil(userTotal / PAGE_SIZE);
  const currentPage = Math.floor(userOffset / PAGE_SIZE) + 1;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader title="CRM & Integrações" />

      {/* ----------------------------------------------------------------- */}
      {/* System Status — live health check                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-h3 text-text-primary">Status dos Sistemas</h2>
          {isAdmin && (
            <button
              onClick={() => void fetchHealth()}
              disabled={healthLoading}
              className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${healthLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <SystemStatusCard
            name="Twenty CRM"
            icon={<Database className="w-5 h-5" />}
            health={isAdmin ? (healthLoading ? undefined : health?.twenty) : undefined}
          />
          <SystemStatusCard
            name="Mautic"
            icon={<Zap className="w-5 h-5" />}
            health={isAdmin ? (healthLoading ? undefined : health?.mautic) : undefined}
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CEO: User Roster                                                    */}
      {/* ----------------------------------------------------------------- */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-h3 text-text-primary">Usuários</h2>
              <span className="text-caption font-medium px-2 py-0.5 rounded-full bg-[#001338]/10 text-[#001338] border border-[#001338]/20">
                {userTotal} total
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar por email ou nome…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-cream-500 bg-white text-text-primary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-text-muted"
            />
          </div>

          {/* Table */}
          <div className="card-surface overflow-x-auto">
            {userLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : userRows.length === 0 ? (
              <div className="p-8 text-center text-body-sm text-text-muted">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50">
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Usuário</th>
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Plano</th>
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Twenty</th>
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Mautic</th>
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Último login</th>
                    <th className="px-3 py-2 text-caption font-semibold text-text-muted">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((row) => (
                    <UserRow
                      key={row.user_id}
                      row={row}
                      onSync={handleSyncUser}
                      syncing={syncingUser === row.user_id}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 text-caption text-text-muted">
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setUserOffset(Math.max(0, userOffset - PAGE_SIZE))}
                  disabled={userOffset === 0 || userLoading}
                  className="text-caption px-3 py-1 h-auto bg-white border border-cream-400 text-text-primary hover:bg-cream-50"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setUserOffset(userOffset + PAGE_SIZE)}
                  disabled={userOffset + PAGE_SIZE >= userTotal || userLoading}
                  className="text-caption px-3 py-1 h-auto bg-white border border-cream-400 text-text-primary hover:bg-cream-50"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

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
            {syncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncLoading ? "Sincronizando…" : "Sincronizar"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {(["twenty", "mautic"] as const).map((system) => {
            const link = system === "twenty" ? twentyLink : mauticLink;
            return (
              <div key={system} className="card-surface p-5 space-y-3">
                <div className="flex items-center gap-2">
                  {system === "twenty" ? (
                    <Database className="w-4 h-4 text-text-muted" />
                  ) : (
                    <Zap className="w-4 h-4 text-text-muted" />
                  )}
                  <span className="font-heading text-h4 text-text-primary">
                    {system === "twenty" ? "Twenty CRM" : "Mautic"}
                  </span>
                  {linksLoading ? (
                    <span className="ml-auto"><Loader2 className="w-3 h-3 animate-spin text-text-muted" /></span>
                  ) : link?.external_id ? (
                    <span className="ml-auto inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Configurado
                    </span>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full bg-cream-100 text-text-muted border border-cream-200">
                      <AlertCircle className="w-3 h-3" /> Não sincronizado
                    </span>
                  )}
                </div>
                {link?.external_id ? (
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
                          Abrir no CRM <ExternalLink className="w-3 h-3 shrink-0" />
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
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Admin: Bulk Backfill                                                */}
      {/* ----------------------------------------------------------------- */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-h3 text-text-primary">Backfill Histórico</h2>
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
                <h3 className="font-heading text-h4 text-text-primary mb-1">Sincronizar usuários sem vínculo</h3>
                <p className="text-body-sm text-text-muted">
                  Cria contatos em Twenty e Mautic para usuários que não possuem vínculo CRM. Use com cautela em produção.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-cream-200">
              <div className="space-y-1.5">
                <label htmlFor="bulk-limit" className="block text-body-sm font-medium text-text-primary">
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
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {bulkLoading ? "Processando…" : "Executar Backfill"}
              </Button>
            </div>
            {bulkResult && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  bulkResult.errors > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                }`}
              >
                {bulkResult.errors > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-body-sm font-medium text-text-primary">Backfill concluído</p>
                  <p className="text-caption text-text-secondary mt-0.5">
                    <span className="text-emerald-700 font-medium">{bulkResult.synced ?? 0} usuários sincronizados</span>
                    {bulkResult.errors > 0 && (
                      <> · <span className="text-red-600 font-medium">{bulkResult.errors} erros</span></>
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
