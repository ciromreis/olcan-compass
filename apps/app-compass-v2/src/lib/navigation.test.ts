import { describe, expect, it } from "vitest";
import { getNavigationSectionsForRole, isNavItemActive } from "./navigation";

function flattenHrefs(role?: string | null): string[] {
  return getNavigationSectionsForRole(role).flatMap((section) => section.items.map((item) => item.href));
}

describe("navigation role mapping", () => {
  it("includes provider operations for provider role", () => {
    const hrefs = flattenHrefs("PROVIDER");
    expect(hrefs).toContain("/provider");
    expect(hrefs).toContain("/provider/services");
    expect(hrefs).toContain("/provider/earnings");
  });

  it("includes organization operations for org roles", () => {
    const hrefs = flattenHrefs("ORG_ADMIN");
    expect(hrefs).toContain("/org");
    expect(hrefs).toContain("/org/members");
    expect(hrefs).toContain("/org/analytics");
  });

  it("includes governance shortcuts for super admin", () => {
    const hrefs = flattenHrefs("SUPER_ADMIN");
    expect(hrefs).toContain("/admin");
    expect(hrefs).toContain("/admin/observability");
    expect(hrefs).toContain("/admin/audit");
  });

  it("matches active aliases for nested paths", () => {
    const dashboardItem = getNavigationSectionsForRole("END_USER")[0]?.items[0];
    expect(dashboardItem).toBeDefined();
    if (!dashboardItem) return;
    expect(isNavItemActive("/dashboard", dashboardItem)).toBe(true);
    expect(isNavItemActive("/dashboard/next-step", dashboardItem)).toBe(true);
    expect(isNavItemActive("/routes", dashboardItem)).toBe(false);
  });
});
