import { describe, expect, it } from "vitest";
import { deriveObservabilityIncidents } from "./observability-incidents";
import type { FrontendErrorEvent, WebVitalEvent } from "./observability";

const now = new Date("2026-03-10T12:00:00.000Z").getTime();

function makeError(index: number, route: string, name: string): FrontendErrorEvent {
  return {
    id: `err_${index}`,
    createdAt: new Date(now - 1_000 * index).toISOString(),
    name,
    message: "falha",
    route,
  };
}

function makePoorVital(index: number, route: string, metric: string): WebVitalEvent {
  return {
    id: `vital_${index}`,
    name: metric,
    value: 320,
    rating: "poor",
    delta: 320,
    createdAt: new Date(now - 2_000 * index).toISOString(),
    route,
  };
}

describe("deriveObservabilityIncidents", () => {
  it("creates incidents for error spikes and poor vital regressions", () => {
    const errors = [
      makeError(1, "/dashboard", "TypeError"),
      makeError(2, "/dashboard", "TypeError"),
      makeError(3, "/dashboard", "TypeError"),
    ];
    const vitals = [
      makePoorVital(1, "/dashboard", "INP"),
      makePoorVital(2, "/dashboard", "INP"),
      makePoorVital(3, "/dashboard", "INP"),
      makePoorVital(4, "/dashboard", "INP"),
    ];

    const incidents = deriveObservabilityIncidents(errors, vitals, {}, now);
    expect(incidents).toHaveLength(2);
    expect(incidents.some((item) => item.type === "error_spike")).toBe(true);
    expect(incidents.some((item) => item.type === "vital_regression")).toBe(true);
  });

  it("respects persisted incident status map", () => {
    const errors = [
      makeError(1, "/applications", "ReferenceError"),
      makeError(2, "/applications", "ReferenceError"),
      makeError(3, "/applications", "ReferenceError"),
    ];

    const incidents = deriveObservabilityIncidents(
      errors,
      [],
      {
        "error_spike:/applications:ReferenceError": {
          status: "acknowledged",
          updatedAt: "2026-03-10T11:00:00.000Z",
        },
      },
      now
    );

    expect(incidents).toHaveLength(1);
    expect(incidents[0]?.status).toBe("acknowledged");
  });
});
