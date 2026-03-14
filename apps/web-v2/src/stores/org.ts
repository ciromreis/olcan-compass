import { create } from "zustand";
import { persist } from "zustand/middleware";
import { orgApi } from "@/lib/api";

export type OrgMemberRole = "owner" | "admin" | "coordinator" | "member";
export type OrgMemberStatus = "active" | "invited" | "inactive";

export interface OrganizationProfile {
  id?: string;
  name: string;
  type: string;
  slug: string;
  country: string;
  city?: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  contactEmail?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}

export interface OrgMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: OrgMemberRole;
  score: number | null;
  route: string | null;
  status: string;
  joinedAt: string;
}

export interface OrgActivity {
  id: string;
  event: string;
  time: string;
}

export interface OrgStats {
  total_members: number;
  active_members: number;
  pending_invites: number;
  total_applications: number;
  total_routes: number;
  average_score: number;
}

interface RemoteMember {
  id: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  role: string;
  status: string;
  joined_at: string;
}

interface OrgState {
  organization: OrganizationProfile | null;
  members: OrgMember[];
  activity: OrgActivity[];
  stats: OrgStats | null;
  permissions: Record<string, boolean>;
  allowedDomains: string[];
  isLoading: boolean;
  error: string | null;

  fetchOrg: () => Promise<void>;
  updateOrganization: (updates: Partial<OrganizationProfile> & { contactEmail?: string }) => Promise<void>;
  togglePermission: (key: string, value: boolean) => void;
  setAllowedDomains: (domains: string[]) => void;
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: OrgMemberRole) => Promise<void>;
  updateMemberRole: (id: string, role: OrgMemberRole) => Promise<void>;
  setMemberStatus: (id: string, status: OrgMemberStatus) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  logActivity: (event: string, time?: string) => void;
  reset: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      organization: null,
      members: [],
      activity: [],
      stats: null,
      permissions: {
        coordinatorsCanInvite: true,
        membersCanViewScores: false,
        exportAggregates: true,
        marketplaceEnabled: true,
      },
      allowedDomains: [],
      isLoading: false,
      error: null,

      fetchOrg: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await orgApi.getMe();
          set({ organization: data, isLoading: false });
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to fetch organization", isLoading: false });
        }
      },

      updateOrganization: async (updates) => {
        try {
          const { data } = await orgApi.updateMe(updates as Record<string, unknown>);
          set({ organization: data });
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to update organization" });
          throw err;
        }
      },

      togglePermission: (key, value) => {
        set((state) => ({
          permissions: { ...state.permissions, [key]: value },
        }));
      },

      setAllowedDomains: (allowedDomains) => set({ allowedDomains }),

      fetchMembers: async () => {
        set({ isLoading: true });
        try {
          const { data } = await orgApi.getMembers();
          const mappedMembers: OrgMember[] = (data as RemoteMember[]).map((m) => ({
            id: m.id,
            user_id: m.user_id,
            name: m.user_name || "Desconhecido",
            email: m.user_email || "",
            role: m.role as OrgMemberRole,
            score: null, 
            route: null,
            status: m.status,
            joinedAt: m.joined_at,
          }));
          set({ members: mappedMembers, isLoading: false });
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to fetch members", isLoading: false });
        }
      },

      inviteMember: async (email, role) => {
        try {
          await orgApi.inviteMember({ email, role });
          await get().fetchMembers();
          get().logActivity(`Convite enviado para ${email}`);
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to invite member" });
          throw err;
        }
      },

      updateMemberRole: async (id, role) => {
        try {
          await orgApi.updateMember(id, { role });
          set((state) => ({
            members: state.members.map((m) => (m.id === id ? { ...m, role } : m)),
          }));
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to update member role" });
        }
      },

      setMemberStatus: async (id, status) => {
        try {
          await orgApi.updateMember(id, { status });
          set((state) => ({
            members: state.members.map((m) => (m.id === id ? { ...m, status } : m)),
          }));
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to update member status" });
        }
      },

      removeMember: async (id) => {
        try {
          await orgApi.removeMember(id);
          set((state) => ({
            members: state.members.filter((m) => m.id !== id),
          }));
          get().logActivity(`Membro removido`);
        } catch (err: unknown) {
          set({ error: (err as Error).message || "Failed to remove member" });
          throw err;
        }
      },

      fetchStats: async () => {
        try {
          const { data } = await orgApi.getStats();
          set({ stats: data });
        } catch (err) {
          console.error("Failed to fetch stats", err);
        }
      },

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
          organization: null,
          members: [],
          activity: [],
          stats: null,
          error: null,
        }),
    }),
    { name: "olcan-org-v2" }
  )
);
