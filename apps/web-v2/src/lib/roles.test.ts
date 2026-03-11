import { describe, expect, it } from "vitest";
import { isOrgAreaRole, isProviderAreaRole, isSuperAdminRole } from "./roles";

describe("role helpers", () => {
  it("identifies super admin role", () => {
    expect(isSuperAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isSuperAdminRole("USER")).toBe(false);
  });

  it("grants provider area access only to provider/admin roles", () => {
    expect(isProviderAreaRole("PROVIDER")).toBe(true);
    expect(isProviderAreaRole("SUPER_ADMIN")).toBe(true);
    expect(isProviderAreaRole("ORG_ADMIN")).toBe(false);
  });

  it("grants org area access to org family roles", () => {
    expect(isOrgAreaRole("ORG_MEMBER")).toBe(true);
    expect(isOrgAreaRole("ORG_COORDINATOR")).toBe(true);
    expect(isOrgAreaRole("ORG_ADMIN")).toBe(true);
    expect(isOrgAreaRole("SUPER_ADMIN")).toBe(true);
    expect(isOrgAreaRole("PROVIDER")).toBe(false);
  });
});
