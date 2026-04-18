import { describe, expect, it } from "vitest";
import { buildLoginRedirect } from "./auth-redirect";

describe("buildLoginRedirect", () => {
  it("builds encoded redirect URL for app routes", () => {
    expect(buildLoginRedirect("/applications/abc-123")).toBe(
      "/login?redirect=%2Fapplications%2Fabc-123"
    );
  });

  it("normalizes missing leading slash", () => {
    expect(buildLoginRedirect("dashboard")).toBe("/login?redirect=%2Fdashboard");
  });
});
