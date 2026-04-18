"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, ArrowRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuraStore } from "@/stores/auraStore";
import { getBehavioralTraits } from "@/lib/aura-behavioral-traits";
import { ArchetypeId } from "@/lib/archetypes";

interface QuickAction {
  label: string;
  href: string;
}

// Context-aware quick actions per route prefix, ordered by relevance
const PAGE_ACTIONS: Record<string, QuickAction[]> = {
  "/dashboard": [
    { label: "Verificar diagnóstico", href: "/wiki" },
    { label: "Ver sprints ativos", href: "/sprints" },
    { label: "Explorar caminhos", href: "/routes" },
  ],
  "/forge": [
    { label: "Novo documento", href: "/forge/new" },
    { label: "Sessão de entrevista", href: "/interviews/new" },
    { label: "Ver candidaturas", href: "/applications" },
  ],
  "/routes": [
    { label: "Simular cenários", href: "/readiness/simulation" },
    { label: "Ver sprints ativos", href: "/sprints" },
    { label: "Adicionar candidatura", href: "/applications/new" },
  ],
  "/sprints": [
    { label: "Novo sprint", href: "/sprints/new" },
    { label: "Ver candidaturas", href: "/applications" },
    { label: "Diagnóstico de prontidão", href: "/readiness" },
  ],
  "/applications": [
    { label: "Nova candidatura", href: "/applications/new" },
    { label: "Preparar entrevista", href: "/interviews/new" },
    { label: "Atualizar documentos", href: "/forge" },
  ],
  "/interviews": [
    { label: "Nova sessão", href: "/interviews/new" },
    { label: "Ver documentos", href: "/forge" },
    { label: "Ver candidaturas", href: "/applications" },
  ],
  "/readiness": [
    { label: "Simular cenários", href: "/readiness/simulation" },
    { label: "Diagnóstico completo", href: "/wiki" },
    { label: "Explorar caminhos", href: "/routes" },
  ],
  "/wiki": [
    { label: "Criar plano de ação", href: "/sprints/new" },
    { label: "Explorar caminhos", href: "/routes" },
    { label: "Ver prontidão", href: "/readiness" },
  ],
  "/atlas": [
    { label: "Ver diagnóstico", href: "/wiki" },
    { label: "Explorar caminhos", href: "/routes" },
    { label: "Simular cenários", href: "/readiness/simulation" },
  ],
  "/community": [
    { label: "Ver meu perfil", href: "/profile" },
    { label: "Explorar caminhos", href: "/routes" },
    { label: "Ver documentos", href: "/forge" },
  ],
};

function getActionsForPath(pathname: string): QuickAction[] {
  const keys = Object.keys(PAGE_ACTIONS);
  const match = keys.find((key) => pathname.startsWith(key));
  return match ? PAGE_ACTIONS[match] : PAGE_ACTIONS["/dashboard"];
}

export function AuraFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { aura } = useAuraStore();

  // Already on the Aura companion page — no floating button needed
  if (pathname.startsWith("/aura")) return null;

  const traits = aura ? getBehavioralTraits(aura.archetype as ArchetypeId) : null;
  const actions = getActionsForPath(pathname);
  const companionName = aura?.name || "Aura";
  const stageHint = traits?.strategicFocus
    ? traits.strategicFocus.charAt(0).toUpperCase() + traits.strategicFocus.slice(1)
    : "Seu guia de jornada";

  return (
    <>
      {/* Floating Button - Mobile Only */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#001338] text-white shadow-2xl hover:shadow-brand-500/20 lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Fechar ações rápidas" : "Ações rápidas da Aura"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Quick Action Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-40 right-6 z-40 w-[90vw] max-w-xs rounded-2xl border border-cream-200 bg-white shadow-2xl lg:hidden"
          >
            {/* Companion header */}
            <div className="flex items-center gap-3 border-b border-cream-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001338]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-text-primary truncate">{companionName}</p>
                <p className="text-xs text-text-muted truncate">{stageHint}</p>
              </div>
            </div>

            {/* Contextual quick actions */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Ações sugeridas
              </p>
            </div>
            <div className="px-4 pb-4 space-y-1">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-cream-100 hover:text-text-primary"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Primary CTA — opens the full companion experience */}
            <div className="border-t border-cream-200 p-4">
              <Link
                href="/aura"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-heading font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                Conversar com {companionName}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
