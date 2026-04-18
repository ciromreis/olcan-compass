import {
  Briefcase,
  CheckSquare,
  FileEdit,
  Gauge,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Route,
  ScanFace,
  Settings,
  Sparkles,
  Store,
  User,
  Zap,
} from "lucide-react";

export interface AppNavChild {
  href: string;
  label: string;
}

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  aliases?: string[];
  /** Sub-navigation items shown when this section is active */
  children?: AppNavChild[];
}

export interface AppNavSection {
  id: string;
  label: string;
  description?: string;
  items: AppNavItem[];
}

export const END_USER_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "start",
    label: "Base",
    description: "Orientação geral e identidade da jornada.",
    items: [
      {
        href: "/dashboard",
        label: "Painel",
        icon: LayoutDashboard,
        description: "Veja seu momento atual e o próximo passo recomendado.",
        aliases: ["/dashboard"],
      },
      {
        href: "/profile",
        label: "Perfil",
        icon: User,
        description: "Atualize sua realidade e acompanhe sua evolução.",
        aliases: ["/profile"],
      },
    ],
  },
  {
    id: "plan",
    label: "Arquitetura",
    description: "Estruture sua rota e execute a prontidão com clareza.",
    items: [
      {
        href: "/routes",
        label: "Caminhos",
        icon: Route,
        description: "Modele caminhos de mobilidade e acompanhe milestones.",
        aliases: ["/routes"],
        children: [
          { href: "/routes", label: "Meus Caminhos" },
          { href: "/routes/new", label: "Novo Caminho" },
        ],
      },
      {
        href: "/readiness/gate",
        label: "Prontidão",
        icon: Gauge,
        description: "Verifique se está pronto para submeter sua candidatura.",
        aliases: ["/readiness", "/readiness/gate"],
      },
      {
        href: "/sprints",
        label: "Sprints",
        icon: Zap,
        description: "Transforme gaps em ações focadas com prazo e cadência.",
        aliases: ["/sprints"],
      },
    ],
  },
  {
    id: "preparation",
    label: "Narrativa",
    description: "Fortaleça sua performance antes da candidatura.",
    items: [
      {
        href: "/forge",
        label: "Documentos",
        icon: FileEdit,
        description: "Evolua narrativa, versões e qualidade dos materiais.",
        aliases: ["/forge"],
        children: [
          { href: "/forge", label: "Meus Documentos" },
          { href: "/forge/new", label: "Novo Documento" },
        ],
      },
      {
        href: "/interviews",
        label: "Sessões",
        icon: MessageSquare,
        description: "Pratique respostas, feedback e histórico de evolução.",
        aliases: ["/interviews"],
        children: [
          { href: "/interviews", label: "Minhas Sessões" },
          { href: "/interviews/new", label: "Nova Sessão" },
          { href: "/interviews/question-bank", label: "Banco de Perguntas" },
          { href: "/interviews/history", label: "Histórico" },
        ],
      },
      {
        href: "/wiki",
        label: "Perfil OIOS",
        icon: ScanFace,
        description: "Seu arquétipo de mobilidade e orientação psicológica.",
        aliases: ["/wiki"],
      },
    ],
  },
  {
    id: "execution",
    label: "Operacional",
    description: "Gerencie candidaturas e apoio especializado.",
    items: [
      {
        href: "/applications",
        label: "Candidaturas",
        icon: Briefcase,
        description: "Acompanhe prazos, status, documentos e watchlist.",
        aliases: ["/applications"],
      },
      {
        href: "/tasks",
        label: "Tarefas",
        icon: CheckSquare,
        description: "Organize os passos da sua jornada de mobilidade.",
        aliases: ["/tasks"],
      },
      {
        href: "/marketplace",
        label: "Mercado",
        icon: Store,
        description: "Acesse suporte especializado para sua jornada.",
        aliases: ["/marketplace"],
        children: [
          { href: "/marketplace", label: "Explorar" },
          { href: "/marketplace/search", label: "Buscar Especialistas" },
          { href: "/marketplace/bookings", label: "Minhas Reservas" },
          { href: "/marketplace/messages", label: "Mensagens" },
        ],
      },
    ],
  },
];

export const END_USER_BOTTOM_ITEMS: AppNavItem[] = [
  {
    href: "/settings",
    label: "Ajustes",
    icon: Settings,
    aliases: ["/settings", "/subscription"],
  },
];

export const MOBILE_PRIMARY_ITEMS: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Painel",
    icon: LayoutDashboard,
    aliases: ["/dashboard"],
  },
  {
    href: "/routes",
    label: "Rotas",
    icon: Route,
    aliases: ["/routes"],
  },
  {
    href: "/applications",
    label: "Apps",
    icon: Briefcase,
    aliases: ["/applications"],
  },
  {
    href: "/forge",
    label: "Docs",
    icon: FileEdit,
    aliases: ["/forge"],
  },
  {
    href: "/marketplace",
    label: "Mais",
    icon: Store,
    aliases: ["/marketplace", "/profile", "/settings", "/aura"],
  },
];

export function getNavigationSectionsForRole(_role?: string | null): AppNavSection[] {
  return END_USER_NAV_SECTIONS;
}

export function getBottomItemsForRole(_role?: string | null): AppNavItem[] {
  return END_USER_BOTTOM_ITEMS;
}

export function isNavItemActive(pathname: string, item: AppNavItem): boolean {
  const aliases = item.aliases?.length ? item.aliases : [item.href];
  return aliases.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`));
}

export interface CommandPaletteEntry {
  href: string;
  label: string;
  group: string;
}

const COMMAND_PALETTE_EXTRAS: CommandPaletteEntry[] = [
  { href: "/sprints", label: "Sprints", group: "Arquitetura" },
  { href: "/onboarding/quiz", label: "Quiz de integração", group: "Integração" },
  { href: "/subscription", label: "Assinatura", group: "Conta" },
  { href: "/settings/billing", label: "Faturamento", group: "Conta" },
];

/** Flat list for quick navigation (⌘K / busca). Deduped by `href`. */
export function getCommandPaletteEntries(): CommandPaletteEntry[] {
  const out: CommandPaletteEntry[] = [];
  for (const section of END_USER_NAV_SECTIONS) {
    for (const item of section.items) {
      out.push({ href: item.href, label: item.label, group: section.label });
    }
  }
  for (const item of END_USER_BOTTOM_ITEMS) {
    out.push({ href: item.href, label: item.label, group: "Conta" });
  }
  out.push(...COMMAND_PALETTE_EXTRAS);

  const seen = new Set<string>();
  return out.filter((e) => {
    if (seen.has(e.href)) return false;
    seen.add(e.href);
    return true;
  });
}
