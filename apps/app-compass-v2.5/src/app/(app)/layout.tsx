"use client";

/**
 * APP LAYOUT v2.5 - METAMODERN REALIGNMENT
 * Features: Floating Navigation Deck, Liquid Glass Aesthetics, Performance Optimized Syncing
 */
 
// Keep demo mode OFF in production.
// For this client component we rely on `NEXT_PUBLIC_DEMO_MODE` so Next can inline the value.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { monitor } from "@/lib/monitoring";
import {
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  LayoutDashboard,
  Compass,
  Zap,
  Shield,
  Star,
  Layers,
  FileText,
  Users,
  Briefcase,
  History,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { useApplicationStore } from "@/stores/applications";
import { useMarketplaceStore } from "@/stores/canonicalMarketplaceProviderStore";
import { useRouteStore } from "@/stores/routes";
import { useSprintStore } from "@/stores/sprints";
import { useInterviewStore } from "@/stores/interviews";
import { useForgeStore } from "@/stores/forge";
import { apiClient } from "@/lib/api-client";
import { Avatar, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/enterprise/ErrorBoundary";
import { useHydration } from "@/hooks";
import { buildLoginRedirect } from "@/lib/auth-redirect";
import {
  getNavigationSectionsForRole,
  isNavItemActive,
  MOBILE_PRIMARY_ITEMS,
} from "@/lib/navigation";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Painel",
  profile: "Perfil",
  psych: "Aura",
  results: "Diagnóstico",
  routes: "Caminhos",
  readiness: "Prontidão",
  gaps: "Lacunas",
  forge: "Documentos",
  interviews: "Sessões",
  applications: "Candidaturas",
  marketplace: "Mercado",
  settings: "Ajustes",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuthStore();
  
  const effectiveUser = useMemo(() => (DEMO_MODE ? {
    id: "demo-user",
    full_name: "Operador de Sistema",
    email: "demo@olcan.com",
    role: "user",
    avatar_url: null,
  } : user), [user]);

  // Pull each sync fn individually — stable selector references prevent re-render loops
  const syncApplications = useApplicationStore((state) => state.syncFromApi);
  const syncMarketplace = useMarketplaceStore((state) => state.syncFromApi);
  const syncRoutes = useRouteStore((state) => state.syncFromApi);
  const syncSprint = useSprintStore((state) => state.syncFromApi);
  const syncInterview = useInterviewStore((state) => state.syncFromApi);
  const syncForge = useForgeStore((state) => state.syncFromApi);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const syncStarted = useRef(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth Bootstrap Logic
  useEffect(() => {
    if (!hydrated) return;
    
    const bootstrap = async () => {
      if (DEMO_MODE) {
        setAuthBootstrapDone(true);
        return;
      }

      const hasSession = !!apiClient.getToken();
      
      if (hasSession && !user) {
        try {
          const success = await fetchProfile();
          if (!success) {
            logout();
          }
        } catch (err) {
          console.error("Auth bootstrap failure:", err);
          logout();
        }
      }
      
      setAuthBootstrapDone(true);
    };

    bootstrap();
  }, [hydrated, user, fetchProfile, logout]);

  // Layout UI State
  const navSections = getNavigationSectionsForRole(effectiveUser?.role);

  useEffect(() => {
    if (!hydrated || !authBootstrapDone || syncStarted.current) return;
    syncStarted.current = true;
    
    // Batch sync to prevent waterfall and multiple re-renders
    const performSync = async () => {
      try {
        await Promise.allSettled([
          syncApplications(),
          syncMarketplace(),
          syncRoutes(),
          syncSprint(),
          syncInterview(),
          syncForge(),
        ]);
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    performSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authBootstrapDone, hydrated]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track page navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    monitor.trackUserAction('page_view', { page: pathname });
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = BREADCRUMB_LABELS[seg] || (seg.charAt(0).toUpperCase() + seg.slice(1));
    return { href, label };
  });

  if (!hydrated || !authBootstrapDone) {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="inline-block w-12 h-12 rounded-2xl bg-brand-100 border border-brand-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-ink-100 rounded-full mx-auto animate-pulse" />
            <div className="h-3 w-48 bg-ink-50 rounded-full mx-auto animate-pulse opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg flex text-ink-500 font-sans selection:bg-brand-100">
      {/* Liquid Mesh Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-noise-texture z-0" />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-500/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* FLOATING NAVIGATION DECK (The New Sidebar) */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-80 flex flex-col p-4 lg:p-6
          transition-all duration-500 ease-soft
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex-1 flex flex-col bg-surface-card/70 backdrop-blur-3xl border border-white/60 shadow-glass rounded-[2.5rem] overflow-hidden">
          {/* Deck Header */}
          <div className="px-6 py-8 border-b border-ink-500/5">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-ink-500 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                <Compass className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl tracking-tight text-ink-500">Olcan Compass</span>
                <span className="text-caption uppercase tracking-wide text-ink-300 font-bold opacity-70">Core Engine 2.5</span>
              </div>
            </Link>
          </div>

          {/* Nav Items Scrollable Area */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
            {navSections.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="px-3 mb-4">
                  <p className="text-caption font-bold uppercase tracking-[0.25em] text-ink-300 opacity-60">
                    {section.label}
                  </p>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isNavItemActive(pathname, item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium
                          transition-all duration-300 relative
                          ${
                            active
                              ? "bg-ink-500 text-white shadow-xl"
                              : "text-ink-400 hover:bg-ink-500/5 hover:text-ink-500"
                          }
                        `}
                      >
                        <item.icon
                          className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            active ? "text-white" : "text-ink-300 group-hover:text-ink-500"
                          }`}
                        />
                        <span className="flex-1 truncate tracking-tight">{item.label}</span>
                        {active && (
                          <motion.div 
                            layoutId="active-pill"
                            className="bg-white w-1.5 h-1.5 rounded-full"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Hook (Integrated in Deck) */}
          <div className="mt-auto p-4 border-t border-ink-500/5 bg-ink-500/5">
            <div className="flex items-center gap-3 p-3 rounded-[1.5rem] bg-white/40 border border-white/60">
              <Avatar name={effectiveUser?.full_name} size="sm" className="ring-2 ring-brand-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-500 truncate">{effectiveUser?.full_name}</p>
                <p className="text-caption text-ink-300 font-medium truncate">Assinatura Basic</p>
              </div>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1.5 rounded-xl hover:bg-ink-500/5 text-ink-300"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Floating Header Bar */}
        <header className="sticky top-0 z-30 h-20 px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm text-ink-500 hover:bg-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs — Minimalist */}
            <nav className="hidden lg:flex items-center gap-3 text-sm font-medium">
              <Link href="/dashboard" className="text-ink-300 hover:text-ink-500 transition-colors">Olcan</Link>
              {breadcrumbs.map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-ink-200" />
                  <span className={`${i === breadcrumbs.length - 1 ? "text-ink-500 font-bold" : "text-ink-300 opacity-60"}`}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-ink-400 hover:text-ink-500 transition-all hover:shadow-sm">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-ink-400 hover:text-ink-500 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-white" />
            </button>
            <button 
              onClick={handleLogout}
              className="lg:flex hidden items-center justify-center p-2.5 rounded-2xl bg-white/60 border border-white/80 text-ink-400 hover:text-error transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Page Content Container */}
        <main className="flex-1 px-6 pb-32 lg:px-12 pt-4 max-w-[1600px] mx-auto w-full">
          <ErrorBoundary>
            <div className="animate-reveal">
              {children}
            </div>
          </ErrorBoundary>
        </main>

        {/* Mobile Navigation Dock (Bottom Glass) */}
        <nav className="fixed inset-x-6 bottom-6 z-40 lg:hidden">
          <div className="bg-ink-500/90 backdrop-blur-2xl px-6 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex justify-between items-center">
            {MOBILE_PRIMARY_ITEMS.map((item) => {
              const active = isNavItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center p-2 transition-transform duration-300 ${active ? "scale-110" : "opacity-60"}`}
                >
                  <item.icon className={`h-6 w-6 ${active ? "text-white" : "text-white"}`} />
                  {active && (
                    <motion.div 
                      layoutId="mobile-active"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
