import {
  Building2,
  Briefcase,
  FileEdit,
  Gauge,
  Heart,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  PanelLeft,
  ShieldCheck,
  Route,
  Settings,
  Store,
  Users,
  User,
  Wallet,
  Wrench,
  Zap,
  Sparkles,
} from "lucide-react";
import { normalizeUserRole } from "@/lib/roles";

export type AppRole = "END_USER" | "PROVIDER" | "ORG_MEMBER" | "ORG_COORDINATOR" | "ORG_ADMIN" | "SUPER_ADMIN";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  aliases?: string[];
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
        href: "/aura",
        label: "Aura",
        icon: Sparkles,
        description: "Sua identidade evolutiva e manifesto de competências.",
        aliases: ["/aura", "/aura/achievements", "/aura/quests"],
      },
      {
        href: "/profile",
        label: "Contexto",
        icon: User,
        description: "Atualize sua realidade e acompanhe sua evolução psicológica.",
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
      },
      {
        href: "/readiness",
        label: "Prontidão",
        icon: Gauge,
        description: "Entenda lacunas, riscos e simulações da sua preparação.",
        aliases: ["/readiness"],
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
      },
      {
        href: "/interviews",
        label: "Sessões",
        icon: MessageSquare,
        description: "Pratique respostas, feedback e histórico de evolução.",
        aliases: ["/interviews"],
      },
      {
        href: "/community",
        label: "Rede",
        icon: PanelLeft,
        description: "Referências, conteúdo Olcan e discussões temáticas.",
        aliases: ["/community"],
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
        href: "/marketplace",
        label: "Mercado",
        icon: Store,
        description: "Acesse suporte especializado para sua jornada.",
        aliases: ["/marketplace"],
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

export const PROVIDER_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "provider",
    label: "Gestão Operacional",
    description: "Sua atuação no ecossistema Olcan.",
    items: [
      {
        href: "/provider",
        label: "Resumo",
        icon: ShieldCheck,
        description: "Acompanhe ocupação, desempenho e ações pendentes.",
        aliases: ["/provider"],
      },
      {
        href: "/provider/services",
        label: "Catálogo",
        icon: Wrench,
        description: "Gerencie disponibilidade e status dos serviços.",
        aliases: ["/provider/services"],
      },
    ],
  },
];

export const ORG_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "org",
    label: "Governança Org",
    description: "Coordene membros e políticas da organização.",
    items: [
      {
        href: "/org",
        label: "Executivo",
        icon: Building2,
        description: "Visão consolidada da organização e do pipeline.",
        aliases: ["/org"],
      },
      {
        href: "/org/members",
        label: "Time",
        icon: Users,
        description: "Gestão de papéis e status de participação.",
        aliases: ["/org/members"],
      },
    ],
  },
];

export const ADMIN_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "admin",
    label: "Governança Central",
    description: "Controle da plataforma e observabilidade.",
    items: [
      {
        href: "/admin",
        label: "Admin",
        icon: ShieldCheck,
        description: "Painel executivo de governança global.",
        aliases: ["/admin"],
      },
      {
        href: "/admin/observability",
        label: "Vitals",
        icon: Gauge,
        description: "Monitoramento técnico e incidentes operacionais.",
        aliases: ["/admin/observability"],
      },
    ],
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
    href: "/aura",
    label: "Aura",
    icon: Sparkles,
    aliases: ["/aura"],
  },
  {
    href: "/routes",
    label: "Plano",
    icon: Route,
    aliases: ["/routes"],
  },
  {
    href: "/applications",
    label: "Status",
    icon: Briefcase,
    aliases: ["/applications"],
  },
  {
    href: "/marketplace",
    label: "Mais",
    icon: Store,
    aliases: ["/marketplace", "/profile", "/settings"],
  },
];

export function getNavigationSectionsForRole(role?: string | null): AppNavSection[] {
  switch (normalizeUserRole(role)) {
    case "PROVIDER":
      return [...PROVIDER_NAV_SECTIONS, ...END_USER_NAV_SECTIONS];
    case "ORG_MEMBER":
    case "ORG_COORDINATOR":
    case "ORG_ADMIN":
      return [...ORG_NAV_SECTIONS, ...END_USER_NAV_SECTIONS];
    case "SUPER_ADMIN":
      return [...ADMIN_NAV_SECTIONS, ...END_USER_NAV_SECTIONS];
    case "END_USER":
    default:
      return END_USER_NAV_SECTIONS;
  }
}

export function getBottomItemsForRole(role?: string | null): AppNavItem[] {
  return END_USER_BOTTOM_ITEMS;
}

export function isNavItemActive(pathname: string, item: AppNavItem): boolean {
  const aliases = item.aliases?.length ? item.aliases : [item.href];
  return aliases.some((alias) => pathname === alias || pathname.startsWith(alias + "/"));
}
