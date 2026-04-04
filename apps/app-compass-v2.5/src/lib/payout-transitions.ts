export type PayoutRequestStatus = "pending" | "approved" | "rejected" | "paid";

const PAYOUT_ALLOWED_TRANSITIONS: Record<PayoutRequestStatus, readonly PayoutRequestStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["paid"],
  rejected: [],
  paid: [],
};

export function getAllowedPayoutTransitions(status: PayoutRequestStatus): readonly PayoutRequestStatus[] {
  return PAYOUT_ALLOWED_TRANSITIONS[status];
}

export function canTransitionPayoutStatus(
  from: PayoutRequestStatus,
  to: PayoutRequestStatus
): boolean {
  return PAYOUT_ALLOWED_TRANSITIONS[from].includes(to);
}

