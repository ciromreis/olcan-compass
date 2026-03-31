import { describe, expect, it } from "vitest";
import { mapGateAttemptsToHistory } from "./readiness-history";

describe("mapGateAttemptsToHistory", () => {
  it("maps gate attempts into normalized history entries", () => {
    const entries = mapGateAttemptsToHistory([
      {
        id: "gate_1",
        createdAt: "2026-03-10T10:00:00.000Z",
        canSubmit: true,
        totalScore: 74,
        metCount: 6,
        criteriaCount: 6,
        missingCriteria: [],
        appId: "a1",
        appLabel: "MSc Computer Science",
      },
      {
        id: "gate_2",
        createdAt: "2026-03-10T11:00:00.000Z",
        canSubmit: false,
        totalScore: 52,
        metCount: 4,
        criteriaCount: 6,
        missingCriteria: ["Dimensão Linguística ≥ 70"],
      },
    ]);

    expect(entries).toHaveLength(2);
    expect(entries[0].status).toBe("approved");
    expect(entries[1].status).toBe("blocked");
    expect(entries[1].missingCriteria).toContain("Dimensão Linguística ≥ 70");
  });
});

