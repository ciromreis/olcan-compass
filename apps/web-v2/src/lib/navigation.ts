import {
  Building2,
  Briefcase,
  FileEdit,
  Gauge,
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
        label: "Início",
        icon: LayoutDashboard,
        description: "Veja seu momento atual e o próximo passo recomendado.",
        aliases: ["/dashboard"],
      },
      {
        href: "/profile",
        label: "Perfil",
        icon: User,
        description: "Atualize seu contexto e acompanhe sua evolução psicológica.",
        aliases: ["/profile"],
      },
    ],
  },
  {
    id: "plan",
    label: "Plano",
    description: "Estruture sua rota e execute a prontidão com clareza.",
    items: [
      {
        href: "/routes",
        label: "Rotas",
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
    label: "Preparação",
    description: "Fortaleça sua narrativa e sua performance antes da candidatura.",
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
        label: "Entrevistas",
        icon: MessageSquare,
        description: "Pratique respostas, feedback e histórico de evolução.",
        aliases: ["/interviews"],
      },
      {
        href: "/community",
        label: "Conteúdo",
        icon: PanelLeft,
        description: "Salve referências, acompanhe conteúdo Olcan e participe de discussões temáticas.",
        aliases: ["/community"],
      },
    ],
  },
  {
    id: "execution",
    label: "Execução",
    description: "Gerencie candidaturas, oportunidades e apoio contextual.",
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
        label: "Marketplace",
        icon: Store,
        description: "Acesse suporte especializado quando o contexto pedir.",
        aliases: ["/marketplace"],
      },
    ],
  },
];

export const END_USER_BOTTOM_ITEMS: AppNavItem[] = [
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
    aliases: ["/settings", "/subscription"],
  },
];

export const PROVIDER_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "provider",
    label: "Provider Ops",
    description: "Gestão operacional da sua atuação no marketplace.",
    items: [
      {
        href: "/provider",
        label: "Resumo Provider",
        icon: ShieldCheck,
        description: "Acompanhe ocupação, desempenho e ações pendentes.",
        aliases: ["/provider"],
      },
      {
        href: "/provider/services",
        label: "Serviços",
        icon: Wrench,
        description: "Gerencie catálogo, status e disponibilidade dos serviços.",
        aliases: ["/provider/services"],
      },
      {
        href: "/provider/bookings",
        label: "Contratações",
        icon: Briefcase,
        description: "Execute entregas e acompanhe sessões contratadas.",
        aliases: ["/provider/bookings"],
      },
      {
        href: "/provider/earnings",
        label: "Ganhos",
        icon: Wallet,
        description: "Monitore receita, solicitações de saque e histórico.",
        aliases: ["/provider/earnings"],
      },
    ],
  },
];

export const ORG_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "org",
    label: "Operação Org",
    description: "Coordene membros, métricas e políticas da organização.",
    items: [
      {
        href: "/org",
        label: "Resumo Org",
        icon: Building2,
        description: "Visão executiva da organização e do pipeline.",
        aliases: ["/org"],
      },
      {
        href: "/org/members",
        label: "Membros",
        icon: Users,
        description: "Convites, papéis e status de participação.",
        aliases: ["/org/members"],
      },
      {
        href: "/org/analytics",
        label: "Analytics Org",
        icon: Gauge,
        description: "Indicadores de prontidão e progresso por grupo.",
        aliases: ["/org/analytics"],
      },
    ],
  },
];

export const ADMIN_NAV_SECTIONS: AppNavSection[] = [
  {
    id: "admin",
    label: "Governança",
    description: "Controle da plataforma, auditoria e observabilidade.",
    items: [
      {
        href: "/admin",
        label: "Admin",
        icon: ShieldCheck,
        description: "Painel executivo de governança da plataforma.",
        aliases: ["/admin"],
      },
      {
        href: "/admin/observability",
        label: "Observabilidade",
        icon: Gauge,
        description: "Erros frontend, vitals e incidentes operacionais.",
        aliases: ["/admin/observability"],
      },
      {
        href: "/admin/audit",
        label: "Auditoria",
        icon: FileEdit,
        description: "Trilha de ações administrativas e compliance.",
        aliases: ["/admin/audit"],
      },
    ],
  },
];

export const MOBILE_PRIMARY_ITEMS: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Início",
    icon: LayoutDashboard,
    aliases: ["/dashboard"],
  },
  {
    href: "/routes",
    label: "Plano",
    icon: Route,
    aliases: ["/routes", "/readiness", "/sprints"],
  },
  {
    href: "/interviews",
    label: "Preparação",
    icon: MessageSquare,
    aliases: ["/forge", "/interviews", "/community"],
  },
  {
    href: "/applications",
    label: "Candidaturas",
    icon: Briefcase,
    aliases: ["/applications"],
  },
  {
    href: "/marketplace",
    label: "Mais",
    icon: Store,
    aliases: ["/marketplace", "/profile", "/settings", "/subscription"],
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
  switch (normalizeUserRole(role)) {
    case "PROVIDER":
    case "ORG_MEMBER":
    case "ORG_COORDINATOR":
    case "ORG_ADMIN":
    case "SUPER_ADMIN":
      return END_USER_BOTTOM_ITEMS;
    case "END_USER":
    default:
      return END_USER_BOTTOM_ITEMS;
  }
}

export function isNavItemActive(pathname: string, item: AppNavItem): boolean {
  const aliases = item.aliases?.length ? item.aliases : [item.href];
  return aliases.some((alias) => pathname === alias || pathname.startsWith(alias + "/"));
}
