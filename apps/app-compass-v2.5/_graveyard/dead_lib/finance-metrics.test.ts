import { describe, expect, it } from "vitest";
import { calculateAvailableToWithdraw, summarizePayoutRequests } from "./finance-metrics";

describe("summarizePayoutRequests", () => {
  it("aggregates payout totals by status", () => {
    const summary = summarizePayoutRequests([
      { status: "pending", amount: 100 },
      { status: "pending", amount: 50 },
      { status: "approved", amount: 80 },
      { status: "paid", amount: 120 },
      { status: "rejected", amount: 999 },
    ]);

    expect(summary.pendingAmount).toBe(150);
    expect(summary.pendingCount).toBe(2);
    expect(summary.approvedAmount).toBe(80);
    expect(summary.paidAmount).toBe(120);
  });

  it("returns zeroes when there are no payout requests", () => {
    const summary = summarizePayoutRequests([]);
    expect(summary).toEqual({
      paidAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      pendingCount: 0,
    });
  });

  it("calculates withdrawable balance ignoring rejected requests", () => {
    const available = calculateAvailableToWithdraw(1000, [
      { status: "pending", amount: 100 },
      { status: "approved", amount: 150 },
      { status: "paid", amount: 250 },
      { status: "rejected", amount: 400 },
    ]);

    expect(available).toBe(500);
  });

  it("never returns negative withdrawable balance", () => {
    const available = calculateAvailableToWithdraw(200, [
      { status: "pending", amount: 100 },
      { status: "approved", amount: 150 },
      { status: "paid", amount: 250 },
    ]);

    expect(available).toBe(0);
  });
});
