import { describe, expect, it } from "vitest";
import {
  getBottomItemsForRole,
  getNavigationSectionsForRole,
  isNavItemActive,
} from "./navigation";

function flattenHrefs(role?: string | null): string[] {
  const sectionHrefs = getNavigationSectionsForRole(role).flatMap((section) =>
    section.items.map((item) => item.href)
  );
  const bottomHrefs = getBottomItemsForRole(role).map((item) => item.href);
  return [...sectionHrefs, ...bottomHrefs];
}

describe("navigation role mapping", () => {
  it("keeps the same launch surface for provider role", () => {
    const hrefs = flattenHrefs("PROVIDER");
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/routes");
    expect(hrefs).toContain("/applications");
    expect(hrefs).not.toContain("/provider");
  });

  it("keeps the same launch surface for org roles", () => {
    const hrefs = flattenHrefs("ORG_ADMIN");
    expect(hrefs).toContain("/marketplace");
    expect(hrefs).toContain("/aura");
    expect(hrefs).not.toContain("/org");
  });

  it("keeps governance shortcuts out of the primary launch nav", () => {
    const hrefs = flattenHrefs("SUPER_ADMIN");
    expect(hrefs).toContain("/profile");
    expect(hrefs).toContain("/settings");
    expect(hrefs).not.toContain("/admin");
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
