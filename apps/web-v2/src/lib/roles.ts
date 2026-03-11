export type UserRole =
  | "USER"
  | "PROVIDER"
  | "ORG_MEMBER"
  | "ORG_COORDINATOR"
  | "ORG_ADMIN"
  | "SUPER_ADMIN"
  | string
  | null
  | undefined;

const ORG_ROLES = new Set<UserRole>(["ORG_MEMBER", "ORG_COORDINATOR", "ORG_ADMIN", "SUPER_ADMIN"]);
const PROVIDER_ROLES = new Set<UserRole>(["PROVIDER", "SUPER_ADMIN"]);

export function isSuperAdminRole(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function isProviderAreaRole(role: UserRole): boolean {
  return PROVIDER_ROLES.has(role);
}

export function isOrgAreaRole(role: UserRole): boolean {
  return ORG_ROLES.has(role);
}
