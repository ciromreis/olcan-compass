export type CanonicalUserRole =
  | "USER"
  | "PROVIDER"
  | "ORG_MEMBER"
  | "ORG_COORDINATOR"
  | "ORG_ADMIN"
  | "SUPER_ADMIN";

export type UserRole =
  | CanonicalUserRole
  | string
  | null
  | undefined;

const ROLE_ALIASES: Record<string, CanonicalUserRole> = {
  user: "USER",
  provider: "PROVIDER",
  org_member: "ORG_MEMBER",
  org_coordinator: "ORG_COORDINATOR",
  org_admin: "ORG_ADMIN",
  super_admin: "SUPER_ADMIN",
};

const ORG_ROLES = new Set<UserRole>(["ORG_MEMBER", "ORG_COORDINATOR", "ORG_ADMIN", "SUPER_ADMIN"]);
const PROVIDER_ROLES = new Set<UserRole>(["PROVIDER", "SUPER_ADMIN"]);

export function normalizeUserRole(role: UserRole): UserRole {
  if (!role) return role;

  const normalized = String(role).trim();
  if (!normalized) return null;

  return ROLE_ALIASES[normalized.toLowerCase()] || normalized.toUpperCase().replace(/-/g, "_");
}

export function isSuperAdminRole(role: UserRole): boolean {
  return normalizeUserRole(role) === "SUPER_ADMIN";
}

export function isProviderAreaRole(role: UserRole): boolean {
  return PROVIDER_ROLES.has(normalizeUserRole(role));
}

export function isOrgAreaRole(role: UserRole): boolean {
  return ORG_ROLES.has(normalizeUserRole(role));
}
