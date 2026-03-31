import { describe, expect, it } from "vitest";
import {
  normalizeFrontendError,
  normalizeWebVital,
  prependWithLimit,
  summarizeFrontendHealth,
} from "./observability";

describe("observability helpers", () => {
  it("normalizes frontend errors with stack preview", () => {
    const event = normalizeFrontendError({
      message: "Explodiu",
      stack: "line 1\nline 2\nline 3\nline 4\nline 5",
      route: "/dashboard",
    });

    expect(event.id.startsWith("fe_")).toBe(true);
    expect(event.name).toBe("Error");
    expect(event.stackPreview?.split("\n")).toHaveLength(4);
    expect(event.route).toBe("/dashboard");
  });

  it("caps arrays using prependWithLimit", () => {
    const list = prependWithLimit(["b", "c"], "a", 2);
    expect(list).toEqual(["a", "b"]);
  });

  it("summarizes frontend health by 24h window", () => {
    const now = new Date("2026-03-10T12:00:00.000Z").getTime();
    const old = "2026-03-09T09:00:00.000Z";
    const recent = "2026-03-10T11:00:00.000Z";

    const summary = summarizeFrontendHealth(
      [{ createdAt: old }, { createdAt: recent }],
      [
        normalizeWebVital(
          {
            id: "v1",
            name: "LCP",
            value: 1700,
            rating: "good",
            delta: 1700,
          },
          "/dashboard"
        ),
        {
          id: "v2",
          name: "INP",
          value: 450,
          rating: "poor",
          delta: 450,
          createdAt: recent,
          route: "/dashboard",
        },
      ],
      now
    );

    expect(summary.totalErrors).toBe(2);
    expect(summary.errorsLast24h).toBe(1);
    expect(summary.vitalsLast24h).toBe(2);
    expect(summary.poorVitalsCount).toBe(1);
  });
});
