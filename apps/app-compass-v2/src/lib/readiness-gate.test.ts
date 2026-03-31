import { describe, expect, it } from "vitest";
import { computeSprintDimensionScore, evaluateSubmissionGate } from "./readiness-gate";
import type { Sprint } from "../stores/sprints";

const baseSprint: Sprint = {
  id: "s1",
  name: "Sprint base",
  status: "active",
  createdAt: "2026-03-10",
  targetDate: "2026-04-10",
  dimension: "Financeira",
  tasks: [
    { id: "t1", name: "Task 1", done: true, dueDate: "2026-03-11" },
    { id: "t2", name: "Task 2", done: false, dueDate: "2026-03-12" },
  ],
};

describe("readiness gate", () => {
  it("computes sprint dimension score by task completion", () => {
    const score = computeSprintDimensionScore([baseSprint], "financ");
    expect(score).toBe(50);
  });

  it("matches dimensions accent-insensitively", () => {
    const scoreWithNoAccent = computeSprintDimensionScore(
      [{ ...baseSprint, dimension: "Linguistica" }],
      "linguíst"
    );
    const scoreWithAccent = computeSprintDimensionScore(
      [{ ...baseSprint, dimension: "Linguística" }],
      "linguist"
    );

    expect(scoreWithNoAccent).toBe(50);
    expect(scoreWithAccent).toBe(50);
  });

  it("returns canSubmit=true when all criteria are met", () => {
    const evaluation = evaluateSubmissionGate({
      sprints: [
        {
          ...baseSprint,
          dimension: "Financeira",
          tasks: [
            { id: "f1", name: "Finance 1", done: true, dueDate: "2026-03-12" },
            { id: "f2", name: "Finance 2", done: true, dueDate: "2026-03-13" },
          ],
        },
        {
          ...baseSprint,
          id: "s2",
          dimension: "Documental",
          tasks: [
            { id: "d1", name: "Doc 1", done: true, dueDate: "2026-03-12" },
            { id: "d2", name: "Doc 2", done: true, dueDate: "2026-03-13" },
            { id: "d3", name: "Doc 3", done: true, dueDate: "2026-03-14" },
          ],
        },
        {
          ...baseSprint,
          id: "s3",
          dimension: "Linguística",
          tasks: [
            { id: "l1", name: "Lang 1", done: true, dueDate: "2026-03-12" },
            { id: "l2", name: "Lang 2", done: true, dueDate: "2026-03-13" },
            { id: "l3", name: "Lang 3", done: true, dueDate: "2026-03-14" },
          ],
        },
      ],
      psychComplete: true,
      psychScore: 80,
      avgRouteProgress: 85,
      forgeDocumentsCount: 2,
    });

    expect(evaluation.canSubmit).toBe(true);
    expect(evaluation.metCount).toBe(evaluation.criteria.length);
    expect(evaluation.totalScore).toBeGreaterThanOrEqual(60);
  });

  it("blocks submission when a required criterion is missing", () => {
    const evaluation = evaluateSubmissionGate({
      sprints: [
        {
          ...baseSprint,
          dimension: "Documental",
          tasks: [
            { id: "d1", name: "Doc 1", done: true, dueDate: "2026-03-12" },
            { id: "d2", name: "Doc 2", done: false, dueDate: "2026-03-13" },
          ],
        },
      ],
      psychComplete: false,
      psychScore: 0,
      avgRouteProgress: 40,
      forgeDocumentsCount: 0,
    });

    expect(evaluation.canSubmit).toBe(false);
    expect(evaluation.metCount).toBeLessThan(evaluation.criteria.length);
  });
});
