"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { Avatar, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useHydration } from "@/hooks";
import { buildLoginRedirect } from "@/lib/auth-redirect";
import {
  getBottomItemsForRole,
  getNavigationSectionsForRole,
  isNavItemActive,
  MOBILE_PRIMARY_ITEMS,
} from "@/lib/navigation";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Painel",
  profile: "Perfil",
  psych: "Diagnóstico",
  results: "Resultados",
  routes: "Rotas",
  readiness: "Prontidão",
  gaps: "Lacunas",
  risk: "Risco",
  simulation: "Simulação",
  forge: "Documentos",
  interviews: "Entrevistas",
  community: "Conteúdo",
  applications: "Candidaturas",
  watchlist: "Watchlist",
  sprints: "Sprints",
  marketplace: "Marketplace",
  bookings: "Contratações",
  messages: "Mensagens",
  escrow: "Escrow",
  settings: "Configurações",
  admin: "Admin",
  shop: "Loja",
  subscription: "Assinatura",
  new: "Novo",
  history: "Histórico",
  feedback: "Feedback",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuthStore();
  const navSections = getNavigationSectionsForRole(user?.role);
  const bottomItems = getBottomItemsForRole(user?.role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const authBootstrapStarted = useRef(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!hydrated || authBootstrapStarted.current) return;
    authBootstrapStarted.current = true;

    async function bootstrapAuth() {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.replace(buildLoginRedirect(pathname));
        return;
      }

      const isValidSession = await fetchProfile();
      if (!isValidSession) {
        router.replace(buildLoginRedirect(pathname));
        return;
      }
      setAuthBootstrapDone(true);
    }

    void bootstrapAuth();
  }, [fetchProfile, hydrated, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = BREADCRUMB_LABELS[seg] || (seg.startsWith("[") ? seg : seg.charAt(0).toUpperCase() + seg.slice(1));
    return { href, label };
  });

  if (!hydrated || !authBootstrapDone) {
    return (
      <div className="min-h-screen bg-surface-bg p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-cream-300" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-xl bg-cream-200" />
            <div className="h-28 animate-pulse rounded-xl bg-cream-200" />
            <div className="h-28 animate-pulse rounded-xl bg-cream-200" />
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-cream-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-overlay z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
          bg-surface-card border-r border-cream-300/50 shadow-sm
          transition-transform duration-slow
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-cream-300/50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-moss flex items-center justify-center">
              <span className="text-white font-heading font-bold text-body-sm">OC</span>
            </div>
            <span className="font-heading text-h4 font-bold text-brand-500">Compass</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-cream-200 text-text-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <div className="px-3 pb-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">{section.label}</p>
                {section.description && <p className="mt-1 text-caption text-text-muted">{section.description}</p>}
              </div>
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium
                      transition-all duration-fast group
                      ${
                        active
                          ? "bg-brand-50 text-brand-600 font-semibold shadow-sm"
                          : "text-text-secondary hover:bg-cream-100 hover:text-text-primary"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                        active ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{item.label}</p>
                      {item.description && <p className="text-caption text-text-muted truncate">{item.description}</p>}
                    </div>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-cream-300/50 space-y-1">
          {bottomItems.map((item) => {
            const active = isNavItemActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium
                  transition-colors duration-fast
                  ${
                    active
                      ? "bg-brand-50 text-brand-600 font-semibold"
                      : "text-text-secondary hover:bg-cream-100 hover:text-text-primary"
                  }
                `}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0 text-text-muted" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-text-secondary hover:bg-red-50 hover:text-error transition-colors duration-fast w-full"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop & Mobile header */}
        <header className="sticky top-0 z-30 h-14 bg-surface-card/80 backdrop-blur-md border-b border-cream-300/50 px-4 lg:px-8 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-cream-200 text-text-muted"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs — desktop only */}
          <nav className="hidden lg:flex items-center gap-1 text-caption text-text-muted flex-1 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-text-primary truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-brand-500 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Mobile logo */}
          <span className="lg:hidden font-heading text-body font-bold text-brand-500 flex-1">
            Compass
          </span>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-cream-200 text-text-muted transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg hover:bg-cream-200 text-text-muted transition-colors relative"
              aria-label="Notificações"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-clay-500" />
            </button>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cream-200 transition-colors"
              >
                <Avatar name={user?.full_name} size="sm" />
                <span className="hidden md:block text-body-sm font-medium text-text-primary max-w-[120px] truncate">
                  {user?.full_name || "Minha Conta"}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-cream-300/50 py-1 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-cream-200">
                    <p className="text-body-sm font-heading font-semibold text-text-primary truncate">
                      {user?.full_name || "Usuário"}
                    </p>
                    <p className="text-caption text-text-muted truncate">
                      {user?.email || "email@exemplo.com"}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-body-sm text-text-secondary hover:bg-cream-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-body-sm text-text-secondary hover:bg-cream-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                  <div className="border-t border-cream-200 mt-1 pt-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-2 px-4 py-2 text-body-sm text-error hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search bar (collapsible) */}
        {searchOpen && (
          <div className="px-4 lg:px-8 py-3 bg-surface-card border-b border-cream-300/50 animate-slide-up">
            <Input
              placeholder="Buscar rotas, documentos, oportunidades..."
              icon={<Search className="w-4 h-4" />}
              className="max-w-xl"
              autoFocus
            />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 pb-24 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300/50 bg-surface-card/95 backdrop-blur-md px-2 py-2 lg:hidden">
          <div className="grid grid-cols-5 gap-1">
            {MOBILE_PRIMARY_ITEMS.map((item) => {
              const active = isNavItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${active ? "bg-brand-50 text-brand-600" : "text-text-muted hover:bg-cream-100 hover:text-text-primary"}`}
                >
                  <item.icon className={`h-[18px] w-[18px] ${active ? "text-brand-500" : "text-text-muted"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
