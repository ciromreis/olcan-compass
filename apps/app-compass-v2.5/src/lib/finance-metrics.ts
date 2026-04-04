import type { PayoutRequestStatus } from "@/lib/payout-transitions";

export interface PayoutLike {
  amount: number;
  status: PayoutRequestStatus;
}

export interface PayoutSummary {
  paidAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  pendingCount: number;
}

export function summarizePayoutRequests(requests: PayoutLike[]): PayoutSummary {
  return requests.reduce<PayoutSummary>(
    (summary, request) => {
      if (request.status === "paid") {
        summary.paidAmount += request.amount;
      }
      if (request.status === "pending") {
        summary.pendingAmount += request.amount;
        summary.pendingCount += 1;
      }
      if (request.status === "approved") {
        summary.approvedAmount += request.amount;
      }
      return summary;
    },
    {
      paidAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      pendingCount: 0,
    }
  );
}

export function calculateAvailableToWithdraw(
  completedRevenue: number,
  requests: PayoutLike[]
): number {
  const summary = summarizePayoutRequests(requests);
  const committedAmount = summary.pendingAmount + summary.approvedAmount + summary.paidAmount;
  return Math.max(0, completedRevenue - committedAmount);
}
