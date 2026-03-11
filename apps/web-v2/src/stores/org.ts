import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrgMemberRole = "Membro" | "Coordenador" | "Admin";
export type OrgMemberStatus = "active" | "invited" | "inactive";

export interface OrganizationProfile {
  name: string;
  type: string;
  country: string;
  contactEmail: string;
}

export interface OrgPermissions {
  coordinatorsCanInvite: boolean;
  membersCanViewScores: boolean;
  exportAggregates: boolean;
  marketplaceEnabled: boolean;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: OrgMemberRole;
  score: number | null;
  route: string | null;
  status: OrgMemberStatus;
  joinedAt: string;
}

export interface OrgActivity {
  id: string;
  event: string;
  time: string;
}

interface OrgState {
  organization: OrganizationProfile;
  permissions: OrgPermissions;
  allowedDomains: string[];
  members: OrgMember[];
  activity: OrgActivity[];
  updateOrganization: (updates: Partial<OrganizationProfile>) => void;
  togglePermission: (key: keyof OrgPermissions, value: boolean) => void;
  setAllowedDomains: (domains: string[]) => void;
  inviteMember: (email: string, role?: OrgMemberRole) => "invited" | "exists" | "invalid";
  updateMemberRole: (id: string, role: OrgMemberRole) => void;
  setMemberStatus: (id: string, status: OrgMemberStatus) => void;
  removeMember: (id: string) => void;
  logActivity: (event: string, time?: string) => void;
  reset: () => void;
}

const SEED_ORG: OrganizationProfile = {
  name: "Universidade Federal XYZ",
  type: "Universidade",
  country: "Brasil",
  contactEmail: "international@uni.edu.br",
};

const SEED_PERMISSIONS: OrgPermissions = {
  coordinatorsCanInvite: true,
  membersCanViewScores: true,
  exportAggregates: true,
  marketplaceEnabled: true,
};

const SEED_MEMBERS: OrgMember[] = [
  { id: "m1", name: "Maria Santos", email: "maria@uni.edu.br", role: "Membro", score: 78, route: "MSc Toronto", status: "active", joinedAt: "2025-01-10" },
  { id: "m2", name: "Pedro Oliveira", email: "pedro@uni.edu.br", role: "Membro", score: 65, route: "MSc Berlim", status: "active", joinedAt: "2025-01-18" },
  { id: "m3", name: "Ana Costa", email: "ana@uni.edu.br", role: "Membro", score: 82, route: "PhD Dublin", status: "active", joinedAt: "2025-02-04" },
  { id: "m4", name: "Lucas Ferreira", email: "lucas@uni.edu.br", role: "Coordenador", score: null, route: null, status: "active", joinedAt: "2024-11-20" },
  { id: "m5", name: "Juliana Ribeiro", email: "juliana@uni.edu.br", role: "Membro", score: 45, route: null, status: "invited", joinedAt: "2025-03-01" },
];

const SEED_ACTIVITY: OrgActivity[] = [
  { id: "oa1", event: "Maria Santos completou Sprint Documental", time: "2025-03-09T14:30:00.000Z" },
  { id: "oa2", event: "Pedro Oliveira criou nova rota: MSc Berlim", time: "2025-03-09T10:00:00.000Z" },
  { id: "oa3", event: "Ana Costa recebeu aceite: University of Toronto", time: "2025-03-08T17:20:00.000Z" },
  { id: "oa4", event: "15 novos diagnósticos completos esta semana", time: "2025-03-07T09:00:00.000Z" },
];

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      organization: SEED_ORG,
      permissions: SEED_PERMISSIONS,
      allowedDomains: ["uni.edu.br"],
      members: SEED_MEMBERS,
      activity: SEED_ACTIVITY,

      updateOrganization: (updates) =>
        set((state) => ({ organization: { ...state.organization, ...updates } })),

      togglePermission: (key, value) =>
        set((state) => ({
          permissions: { ...state.permissions, [key]: value },
        })),

      setAllowedDomains: (domains) =>
        set({
          allowedDomains: Array.from(new Set(domains.map((item) => item.trim().toLowerCase()).filter(Boolean))),
        }),

      inviteMember: (email, role = "Membro") => {
        const normalized = email.trim().toLowerCase();
        if (!normalized || !normalized.includes("@")) return "invalid";

        const existing = get().members.find((member) => member.email.toLowerCase() === normalized);
        if (existing) return "exists";

        const inferredName = normalized.split("@")[0]
          .split(/[._-]/)
          .filter(Boolean)
          .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
          .join(" ");

        const newMember: OrgMember = {
          id: `m_${Date.now()}`,
          name: inferredName || "Novo membro",
          email: normalized,
          role,
          score: null,
          route: null,
          status: "invited",
          joinedAt: new Date().toISOString(),
        };

        set((state) => ({
          members: [newMember, ...state.members],
          activity: [
            {
              id: `oa_${Date.now()}`,
              event: `Convite enviado para ${normalized}`,
              time: new Date().toISOString(),
            },
            ...state.activity,
          ].slice(0, 100),
        }));
        return "invited";
      },

      updateMemberRole: (id, role) =>
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, role } : member
          ),
        })),

      setMemberStatus: (id, status) =>
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, status } : member
          ),
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        })),

      logActivity: (event, time) =>
        set((state) => ({
          activity: [
            {
              id: `oa_${Date.now()}`,
              event,
              time: time || new Date().toISOString(),
            },
            ...state.activity,
          ].slice(0, 100),
        })),

      reset: () =>
        set({
          organization: SEED_ORG,
          permissions: SEED_PERMISSIONS,
          allowedDomains: ["uni.edu.br"],
          members: SEED_MEMBERS,
          activity: SEED_ACTIVITY,
        }),
    }),
    { name: "olcan-org" }
  )
);
