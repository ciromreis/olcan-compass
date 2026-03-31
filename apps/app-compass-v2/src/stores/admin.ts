import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildAuditRecord,
  DEFAULT_AUDIT_LIMIT,
  type BaseAuditPayload,
} from "@/lib/admin-audit";

export type AdminUserRole = "USER" | "PROVIDER" | "ORG_ADMIN" | "SUPER_ADMIN";
export type AdminUserStatus = "active" | "inactive" | "blocked";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  plan: string;
  joined: string;
  status: AdminUserStatus;
}

export type ModerationStatus = "open" | "investigating" | "resolved" | "dismissed";
export type ModerationSeverity = "high" | "medium" | "low";

export interface ModerationCase {
  id: string;
  type: string;
  subject: string;
  reporter: string;
  reported: string;
  status: ModerationStatus;
  date: string;
  severity: ModerationSeverity;
}

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
}

export interface PlatformLimits {
  freeRoutes: number;
  proRoutes: number;
  freeAICallsDay: number;
  proAICallsDay: number;
}

export interface PromptRegistryItem {
  name: string;
  model: string;
  calls: number;
  costBRL: number;
  active: boolean;
}

export type AdminAuditModule =
  | "users"
  | "providers"
  | "moderation"
  | "settings"
  | "ai"
  | "finance"
  | "content"
  | "observability";

export interface AdminAuditLog {
  id: string;
  at: string;
  actor: string;
  module: AdminAuditModule;
  action: string;
  target: string;
  summary: string;
}

interface AdminState {
  users: AdminUser[];
  moderationCases: ModerationCase[];
  featureFlags: FeatureFlag[];
  platformLimits: PlatformLimits;
  prompts: PromptRegistryItem[];
  auditLogs: AdminAuditLog[];
  updateUserRole: (id: string, role: AdminUserRole, actor?: string) => void;
  updateUserStatus: (id: string, status: AdminUserStatus, actor?: string) => void;
  setModerationStatus: (id: string, status: ModerationStatus, actor?: string) => void;
  toggleFeatureFlag: (key: string, actor?: string) => void;
  updatePlatformLimits: (updates: Partial<PlatformLimits>, actor?: string) => void;
  togglePromptActive: (name: string, actor?: string) => void;
  registerPromptUsage: (name: string, calls: number, costBRL: number, actor?: string) => void;
  logAdminAction: (payload: BaseAuditPayload<AdminAuditModule>) => void;
  clearAuditLogs: () => void;
  reset: () => void;
}

const SEED_USERS: AdminUser[] = [
  { id: "u1", name: "João da Silva", email: "joao@email.com", role: "USER", plan: "Navegador", joined: "2025-01-15", status: "active" },
  { id: "u2", name: "Maria Santos", email: "maria@email.com", role: "USER", plan: "Comandante", joined: "2025-02-01", status: "active" },
  { id: "u3", name: "Ana Luísa Ferreira", email: "ana@provider.com", role: "PROVIDER", plan: "—", joined: "2024-11-20", status: "active" },
  { id: "u4", name: "Carlos Eduardo", email: "carlos@email.com", role: "USER", plan: "Explorador", joined: "2025-03-01", status: "inactive" },
  { id: "u5", name: "Admin Olcan", email: "admin@olcan.com", role: "SUPER_ADMIN", plan: "—", joined: "2024-06-01", status: "active" },
];

const SEED_CASES: ModerationCase[] = [
  { id: "mc1", type: "Disputa de escrow", subject: "Booking #B-4521 — Cliente alega serviço não entregue", reporter: "João da Silva", reported: "Ana Luísa Ferreira", status: "open", date: "2025-03-02", severity: "high" },
  { id: "mc2", type: "Review inapropriada", subject: "Review contém linguagem ofensiva", reporter: "Sistema", reported: "Usuário anônimo", status: "open", date: "2025-03-04", severity: "medium" },
  { id: "mc3", type: "Perfil falso", subject: "Provedor com credenciais não verificáveis", reporter: "Moderação interna", reported: "Provider #P-892", status: "investigating", date: "2025-03-01", severity: "high" },
  { id: "mc4", type: "Spam", subject: "Mensagens repetidas no marketplace", reporter: "Maria Santos", reported: "Provider #P-445", status: "resolved", date: "2025-02-28", severity: "low" },
];

const SEED_FLAGS: FeatureFlag[] = [
  { key: "interview_voice_analysis", label: "Análise de Voz — Entrevistas", enabled: false },
  { key: "forge_competitiveness", label: "Score de Competitividade — Forge", enabled: true },
  { key: "marketplace_escrow_v2", label: "Escrow V2 (Stripe Connect)", enabled: true },
  { key: "ai_coach_mode", label: "Coach IA Dedicado (Comandante)", enabled: true },
  { key: "sprint_auto_generate", label: "Sprints Gerados por IA", enabled: false },
  { key: "org_b2b_portal", label: "Portal B2B / Organizacional", enabled: true },
  { key: "economics_engine_v2", label: "Economics Engine V2 (COI completo)", enabled: true },
  { key: "dark_mode", label: "Modo Escuro", enabled: false },
];

const SEED_LIMITS: PlatformLimits = {
  freeRoutes: 1,
  proRoutes: 3,
  freeAICallsDay: 5,
  proAICallsDay: 50,
};

const SEED_PROMPTS: PromptRegistryItem[] = [
  { name: "forge_analysis", model: "gemini-1.5-pro", calls: 4521, costBRL: 342, active: true },
  { name: "forge_coach", model: "gemini-1.5-pro", calls: 2847, costBRL: 218, active: true },
  { name: "interview_feedback", model: "gemini-1.5-flash", calls: 1923, costBRL: 89, active: true },
  { name: "interview_voice", model: "gemini-1.5-pro", calls: 856, costBRL: 124, active: false },
  { name: "route_probability", model: "gemini-1.5-flash", calls: 3421, costBRL: 156, active: true },
];

const SEED_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "audit_1",
    at: "2025-03-10T08:00:00.000Z",
    actor: "admin@olcan.com",
    module: "settings",
    action: "update_platform_limits",
    target: "platform_limits",
    summary: "Limites globais revisados para rotas e chamadas de IA.",
  },
  {
    id: "audit_2",
    at: "2025-03-10T09:15:00.000Z",
    actor: "admin@olcan.com",
    module: "providers",
    action: "approve_provider",
    target: "prov3",
    summary: "Provedor Carlos Eduardo Silva aprovado no marketplace.",
  },
  {
    id: "audit_3",
    at: "2025-03-10T10:40:00.000Z",
    actor: "admin@olcan.com",
    module: "moderation",
    action: "set_case_status",
    target: "mc1",
    summary: "Caso mc1 atualizado para investigating.",
  },
];

const initialState = {
  users: SEED_USERS,
  moderationCases: SEED_CASES,
  featureFlags: SEED_FLAGS,
  platformLimits: SEED_LIMITS,
  prompts: SEED_PROMPTS,
  auditLogs: SEED_AUDIT_LOGS,
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      ...initialState,
      updateUserRole: (id, role, actor) =>
        set((state) => {
          const target = state.users.find((user) => user.id === id);
          if (!target || target.role === role) return state;
          return {
            users: state.users.map((user) => (user.id === id ? { ...user, role } : user)),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "users",
                action: "update_user_role",
                target: id,
                summary: `Role de ${target.name} alterada de ${target.role} para ${role}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      updateUserStatus: (id, status, actor) =>
        set((state) => {
          const target = state.users.find((user) => user.id === id);
          if (!target || target.status === status) return state;
          return {
            users: state.users.map((user) => (user.id === id ? { ...user, status } : user)),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "users",
                action: "update_user_status",
                target: id,
                summary: `Status de ${target.name} alterado de ${target.status} para ${status}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      setModerationStatus: (id, status, actor) =>
        set((state) => {
          const target = state.moderationCases.find((entry) => entry.id === id);
          if (!target || target.status === status) return state;
          return {
            moderationCases: state.moderationCases.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "moderation",
                action: "set_case_status",
                target: id,
                summary: `Caso ${id} alterado de ${target.status} para ${status}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      toggleFeatureFlag: (key, actor) =>
        set((state) => {
          const target = state.featureFlags.find((flag) => flag.key === key);
          if (!target) return state;
          const next = !target.enabled;
          return {
            featureFlags: state.featureFlags.map((flag) =>
              flag.key === key ? { ...flag, enabled: next } : flag
            ),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "settings",
                action: "toggle_feature_flag",
                target: key,
                summary: `Feature flag ${key} ${next ? "ativada" : "desativada"}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      updatePlatformLimits: (updates, actor) =>
        set((state) => {
          const nextLimits = { ...state.platformLimits, ...updates };
          const hasChanges =
            nextLimits.freeRoutes !== state.platformLimits.freeRoutes ||
            nextLimits.proRoutes !== state.platformLimits.proRoutes ||
            nextLimits.freeAICallsDay !== state.platformLimits.freeAICallsDay ||
            nextLimits.proAICallsDay !== state.platformLimits.proAICallsDay;
          if (!hasChanges) return state;
          return {
            platformLimits: nextLimits,
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "settings",
                action: "update_platform_limits",
                target: "platform_limits",
                summary: "Limites globais de produto foram atualizados.",
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      togglePromptActive: (name, actor) =>
        set((state) => {
          const target = state.prompts.find((prompt) => prompt.name === name);
          if (!target) return state;
          const next = !target.active;
          return {
            prompts: state.prompts.map((prompt) =>
              prompt.name === name ? { ...prompt, active: next } : prompt
            ),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "ai",
                action: "toggle_prompt",
                target: name,
                summary: `Prompt ${name} ${next ? "ativado" : "desativado"}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      registerPromptUsage: (name, calls, costBRL, actor) =>
        set((state) => {
          const hasTarget = state.prompts.some((prompt) => prompt.name === name);
          if (!hasTarget) return state;
          return {
            prompts: state.prompts.map((prompt) =>
              prompt.name === name
                ? { ...prompt, calls: prompt.calls + calls, costBRL: Math.round((prompt.costBRL + costBRL) * 100) / 100 }
                : prompt
            ),
            auditLogs: [
              buildAuditRecord({
                actor: actor || "admin@olcan.com",
                module: "ai",
                action: "register_prompt_usage",
                target: name,
                summary: `Uso registrado para ${name}: +${calls} chamadas e +R$ ${Math.round(costBRL * 100) / 100}.`,
              }),
              ...state.auditLogs,
            ].slice(0, DEFAULT_AUDIT_LIMIT),
          };
        }),
      logAdminAction: (payload) =>
        set((state) => ({
          auditLogs: [
            buildAuditRecord(payload),
            ...state.auditLogs,
          ].slice(0, DEFAULT_AUDIT_LIMIT),
        })),
      clearAuditLogs: () => set({ auditLogs: [] }),
      reset: () => set(initialState),
    }),
    { name: "olcan-admin" }
  )
);
