import { describe, expect, it } from "vitest";
import { canTransitionPayoutStatus, getAllowedPayoutTransitions } from "./payout-transitions";

describe("payout transitions", () => {
  it("allows pending to approved and rejected only", () => {
    expect(getAllowedPayoutTransitions("pending")).toEqual(["approved", "rejected"]);
    expect(canTransitionPayoutStatus("pending", "approved")).toBe(true);
    expect(canTransitionPayoutStatus("pending", "rejected")).toBe(true);
    expect(canTransitionPayoutStatus("pending", "paid")).toBe(false);
  });

  it("allows approved to paid only", () => {
    expect(getAllowedPayoutTransitions("approved")).toEqual(["paid"]);
    expect(canTransitionPayoutStatus("approved", "paid")).toBe(true);
    expect(canTransitionPayoutStatus("approved", "rejected")).toBe(false);
  });

  it("treats paid and rejected as terminal states", () => {
    expect(getAllowedPayoutTransitions("paid")).toEqual([]);
    expect(getAllowedPayoutTransitions("rejected")).toEqual([]);
    expect(canTransitionPayoutStatus("paid", "approved")).toBe(false);
    expect(canTransitionPayoutStatus("rejected", "approved")).toBe(false);
  });
});

