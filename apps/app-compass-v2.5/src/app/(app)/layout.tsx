"use client";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Compass, LogOut, Menu, PanelLeft, PanelRight, PanelRightClose, Search, Settings } from "lucide-react";
import type { AppNavItem } from "@/lib/navigation";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui";
import AuraRail from "@/components/aura/AuraRail";
import { AuraFloatingChat } from "@/components/aura/AuraFloatingChat";
import { MarketplaceXPListener } from "@/components/aura/MarketplaceXPListener";
import { AuraNotificationSystem } from "@/components/aura/AuraNotificationSystem";
import { GamificationIntegration, CelebrationToastContainer } from "@/components/gamification";
import { CompanionSidebar } from "@/components/companion/CompanionSidebar";
import { ErrorBoundary } from "@/components/enterprise/ErrorBoundary";
import { AppCommandPalette } from "@/components/layout/AppCommandPalette";
import { useHydration } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  getBottomItemsForRole,
  getNavigationSectionsForRole,
  isNavItemActive,
  MOBILE_PRIMARY_ITEMS,
} from "@/lib/navigation";
import { monitor } from "@/lib/monitoring";
import { trackProductPageView } from "@/lib/product-analytics";
import { initGamificationBridge, initCompanionEvolutionBridge } from "@/lib/event-bus";
import { useApplicationStore } from "@/stores/applications";
import { useAuthStore } from "@/stores/auth";
import { useForgeStore } from "@/stores/forge";
import { useInterviewStore } from "@/stores/interviews";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { usePsychStore } from "@/stores/psych";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Painel",
  routes: "Caminhos",
  readiness: "Prontidão",
  sprints: "Sprints",
  applications: "Candidaturas",
  tasks: "Tarefas",
  forge: "Documentos",
  interviews: "Sessões",
  atlas: "Atlas",
  wiki: "Diagnóstico",
  aura: "Aura",
  profile: "Perfil",
  settings: "Ajustes",
  community: "Rede",
  onboarding: "Integração",
  tools: "Ferramentas",
  documents: "Documentos",
  subscription: "Assinatura",
  admin: "Admin",
  provider: "Profissional",
  org: "Organização",
  guilds: "Guildas",
  "forge-lab": "Forge Lab",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuthStore();
  const syncApplications = useApplicationStore((state) => state.syncFromApi);
  const syncMarketplace = useMarketplaceStore((state) => state.syncFromApi);
  const syncRoutes = useRouteStore((state) => state.syncFromApi);
  const syncSprint = useSprintStore((state) => state.syncFromApi);
  const syncInterview = useInterviewStore((state) => state.syncFromApi);
  const syncForge = useForgeStore((state) => state.syncFromApi);
  const syncPsych = usePsychStore((state) => state.syncFromApi);
  const syncStarted = useRef(false);
  const productPageViewSentForPath = useRef<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [auraRailOpen, setAuraRailOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [submenu, setSubmenu] = useState<{ item: AppNavItem; top: number; left: number } | null>(null);
  const submenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubmenu = useCallback((item: AppNavItem, e: React.MouseEvent) => {
    if (!item.children?.length) return;
    if (submenuTimer.current) clearTimeout(submenuTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSubmenu({ item, top: rect.top, left: rect.right + 8 });
  }, []);

  const closeSubmenu = useCallback(() => {
    submenuTimer.current = setTimeout(() => setSubmenu(null), 120);
  }, []);

  const keepSubmenu = useCallback(() => {
    if (submenuTimer.current) clearTimeout(submenuTimer.current);
  }, []);

  const effectiveUser = useMemo(
    () =>
      DEMO_MODE
        ? {
            id: "demo-user",
            full_name: "Operador de Sistema",
            email: "demo@olcan.com",
            role: "user",
            avatar_url: null,
          }
        : user,
    [user]
  );

  const navSections = getNavigationSectionsForRole(effectiveUser?.role);
  const bottomNavItems = getBottomItemsForRole(effectiveUser?.role);

  useEffect(() => {
    const unsubGamification = initGamificationBridge();
    const unsubCompanion = initCompanionEvolutionBridge();
    return () => {
      unsubGamification();
      unsubCompanion();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const bootstrap = async () => {
      if (DEMO_MODE) {
        setAuthBootstrapDone(true);
        return;
      }

      const hasSession = Boolean(apiClient.getToken());
      if (hasSession && !user) {
        try {
          const success = await fetchProfile();
          if (!success) logout();
        } catch {
          logout();
        }
      }

      setAuthBootstrapDone(true);
    };

    void bootstrap();
  }, [hydrated, user, fetchProfile, logout]);

  useEffect(() => {
    if (!hydrated || !authBootstrapDone || syncStarted.current) return;
    syncStarted.current = true;
    void Promise.allSettled([
      syncApplications(),
      syncMarketplace(),
      syncRoutes(),
      syncSprint(),
      syncInterview(),
      syncForge(),
      syncPsych(),
    ]);
  }, [
    authBootstrapDone,
    hydrated,
    syncApplications,
    syncMarketplace,
    syncRoutes,
    syncSprint,
    syncInterview,
    syncForge,
    syncPsych,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    monitor.trackUserAction("page_view", { page: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!hydrated || !authBootstrapDone || DEMO_MODE) return;
    if (!user) return;
    const dedupeKey = `${user.id}:${pathname}`;
    if (productPageViewSentForPath.current === dedupeKey) return;
    productPageViewSentForPath.current = dedupeKey;
    void trackProductPageView(pathname);
  }, [hydrated, authBootstrapDone, user, pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, all) => ({
      href: `/${all.slice(0, index + 1).join("/")}`,
      label: BREADCRUMB_LABELS[segment] || segment,
    }));

  if (!hydrated || !authBootstrapDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-bg p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Background decoration neutralized for High-End look */}

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/10 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      ) : null}

      <div className={`mx-auto flex min-h-screen max-w-[1700px] gap-4 px-3 py-3 lg:px-5 lg:py-5 transition-all duration-300`}>
        <aside
          className={`fixed inset-y-3 left-3 z-50 rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-5 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
          } ${sidebarCollapsed ? "lg:w-[4.5rem]" : "w-[17rem]"}`}
        >
          <div className="flex h-full flex-col">
            {/* Logo + collapse toggle */}
            <div className={`border-b border-slate-100 pb-4 ${sidebarCollapsed ? "px-0 flex justify-center" : "px-2"}`}>
              {sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg hover:bg-slate-800 transition-colors"
                  title="Expandir menu"
                >
                  <Compass className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-tight text-slate-950">Olcan Compass</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        v2.5
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Recolher menu"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <nav className={`flex-1 overflow-y-auto py-4 ${sidebarCollapsed ? "space-y-1 px-0" : "space-y-6 px-1"}`}>
              {sidebarCollapsed ? (
                // Icon-only mode
                <>
                  {navSections.flatMap((section) =>
                    section.items.map((item) => {
                      const active = isNavItemActive(pathname, item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          title={item.label}
                          className={`flex h-10 w-10 mx-auto items-center justify-center rounded-[1rem] transition-all ${
                            active ? "bg-slate-950 text-white shadow-md" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                        >
                          <item.icon className="h-4.5 w-4.5" />
                        </Link>
                      );
                    })
                  )}
                </>
              ) : (
                // Full mode — sub-items shown in hover popover, not inline
                navSections.map((section) => (
                  <div key={section.id} className="space-y-0.5">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-1">
                      {section.label}
                    </p>
                    {section.items.map((item) => {
                      const active = isNavItemActive(pathname, item);
                      const hasChildren = Boolean(item.children?.length);
                      const childActive = hasChildren && item.children!.some((c) => pathname.startsWith(c.href) && c.href !== "/");
                      return (
                        <div
                          key={item.href}
                          onMouseEnter={(e) => openSubmenu(item, e)}
                          onMouseLeave={closeSubmenu}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center gap-3 rounded-[1.2rem] px-3 py-2.5 text-sm transition-all ${
                              active
                                ? "bg-slate-950 text-white shadow-lg"
                                : childActive
                                ? "bg-slate-100 text-slate-800"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                              }`}
                            />
                            <span className="font-semibold truncate flex-1">{item.label}</span>
                            {hasChildren && (
                              <ChevronRight
                                className={`h-3 w-3 shrink-0 transition-colors ${
                                  active ? "text-white/60" : "text-slate-300 group-hover:text-slate-500"
                                }`}
                              />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </nav>

            {!sidebarCollapsed && bottomNavItems.length > 0 ? (
              <div className="space-y-1 border-t border-slate-100 px-1 pt-3">
                {bottomNavItems.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 rounded-[1.2rem] px-3 py-2.5 text-sm transition-all ${
                        active
                          ? "bg-slate-950 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`}
                      />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            <div className={`border-t border-slate-100 pt-3 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
              {sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-[1rem] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title={effectiveUser?.full_name ?? "Conta"}
                >
                  <Avatar name={effectiveUser?.full_name} size="sm" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((current) => !current)}
                    className="flex w-full items-center gap-3 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-3 py-3 text-left hover:bg-slate-100 transition-colors"
                  >
                    <Avatar name={effectiveUser?.full_name} size="sm" className="ring-2 ring-white" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {effectiveUser?.full_name || "Conta Olcan"}
                      </p>
                      <p className="truncate text-xs text-slate-500">{effectiveUser?.email}</p>
                    </div>
                    <Settings className="h-4 w-4 text-slate-400" />
                  </button>

                  {userMenuOpen ? (
                    <div className="mt-2 space-y-1 rounded-[1.2rem] border border-slate-200 bg-white p-2 text-sm shadow-sm">
                      <Link href="/profile" className="block rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50">
                        Perfil
                      </Link>
                      <Link href="/settings" className="block rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50">
                        Ajustes
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          router.push("/login");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className={`grid gap-4 ${auraRailOpen ? "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]" : ""}`}>
            <div className="min-w-0 space-y-4">
              <header className="sticky top-3 z-30 rounded-[1.8rem] border border-white/70 bg-white/72 px-4 py-3 shadow-sm backdrop-blur-2xl lg:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
                      >
                        <Menu className="h-5 w-5" />
                      </button>
                      <nav className="hidden flex-wrap items-center gap-2 text-sm lg:flex">
                        <Link href="/dashboard" className="text-slate-400 transition-colors hover:text-slate-950">
                          Olcan
                        </Link>
                        {breadcrumbs.map((crumb, index) => (
                          <div key={crumb.href} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                            {index === breadcrumbs.length - 1 ? (
                              <span className="font-semibold text-slate-950">{crumb.label}</span>
                            ) : (
                              <Link href={crumb.href} className="text-slate-400 transition-colors hover:text-slate-950">
                                {crumb.label}
                              </Link>
                            )}
                          </div>
                        ))}
                      </nav>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      {breadcrumbs[breadcrumbs.length - 1]?.label || "Today"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-950"
                      title="Busca e navegação rápida (⌘K)"
                      aria-label="Abrir busca e navegação rápida"
                      onClick={() => setCommandPaletteOpen(true)}
                    >
                      <Search className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-950"
                      title="Central de alertas (em breve)"
                      aria-label="Alertas, recurso em breve"
                      disabled
                    >
                      <Bell className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuraRailOpen((v) => !v)}
                      className="hidden lg:flex rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-950"
                      title={auraRailOpen ? "Esconder painel Aura" : "Mostrar painel Aura"}
                    >
                      {auraRailOpen ? <PanelRightClose className="h-4.5 w-4.5" /> : <PanelRight className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              </header>

              <main className="min-w-0 pb-28">
                <ErrorBoundary>
                  <div className="animate-reveal rounded-[2rem] border border-white/70 bg-white/58 p-4 shadow-sm backdrop-blur-xl lg:p-6">
                    {children}
                  </div>
                </ErrorBoundary>
              </main>
            </div>

            {auraRailOpen && <AuraRail />}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/92 px-5 py-4 shadow-2xl backdrop-blur-2xl">
          {MOBILE_PRIMARY_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1">
                <item.icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-400"}`} />
                <span className={`text-[10px] uppercase tracking-[0.18em] ${active ? "text-white" : "text-slate-500"}`}>
                  {item.label}
                </span>
                {active ? (
                  <motion.div layoutId="mobile-nav-active" className="absolute -bottom-1 h-1 w-6 rounded-full bg-white" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating submenu popover — rendered outside sidebar to avoid overflow clipping */}
      {submenu && !sidebarCollapsed && (
        <div
          className="fixed z-[300] w-52 rounded-[1.4rem] border border-white/80 bg-white/95 p-2 shadow-[0_8px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
          style={{ top: submenu.top, left: submenu.left }}
          onMouseEnter={keepSubmenu}
          onMouseLeave={closeSubmenu}
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {submenu.item.label}
          </p>
          {submenu.item.children!.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => { setSidebarOpen(false); setSubmenu(null); }}
                className={`flex items-center gap-2.5 rounded-[1rem] px-3 py-2 text-sm font-medium transition-colors ${
                  childActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${childActive ? "bg-white" : "bg-slate-300"}`} />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}

      <GamificationIntegration />
      <CelebrationToastContainer />
      <CompanionSidebar />
      <AuraFloatingChat />
      <MarketplaceXPListener />
      <AuraNotificationSystem />
      <AppCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
