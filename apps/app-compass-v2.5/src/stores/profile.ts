import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserPlan = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "cancel_at_period_end" | "inactive";

export interface PaymentMethod {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "void";
  plan: UserPlan;
  description: string;
}

interface PlanChangeInput {
  plan: UserPlan;
  paymentMethod?: Partial<PaymentMethod>;
}

interface ProfilePrefsState {
  origin: string;
  destination: string;
  plan: UserPlan;
  subscriptionStatus: SubscriptionStatus;
  renewalDate: string | null;
  cancellationEffectiveDate: string | null;
  paymentMethod: PaymentMethod;
  invoices: BillingInvoice[];
  updatePrefs: (prefs: Partial<Pick<ProfilePrefsState, "origin" | "destination" | "plan">>) => void;
  changePlan: (input: PlanChangeInput) => void;
  scheduleCancellation: () => void;
  reactivateSubscription: () => void;
  updatePaymentMethod: (paymentMethod: Partial<PaymentMethod>) => void;
}

const PLAN_PRICE: Record<UserPlan, number> = {
  free: 0,
  pro: 79,
  premium: 149,
};

function addDays(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function createInvoice(plan: UserPlan, date: string): BillingInvoice {
  const amount = PLAN_PRICE[plan];
  const compactDate = date.replace(/[-:.TZ]/g, "").slice(0, 14);

  return {
    id: `inv-${compactDate}-${plan}`,
    date,
    amount,
    status: amount > 0 ? "paid" : "void",
    plan,
    description: amount > 0 ? `Assinatura ${plan}` : "Mudança para plano gratuito",
  };
}

export const useProfileStore = create<ProfilePrefsState>()(
  persist(
    (set) => ({
      origin: "",
      destination: "",
      plan: "free",
      subscriptionStatus: "inactive",
      renewalDate: null,
      cancellationEffectiveDate: null,
      paymentMethod: {
        brand: "Visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2027,
        holderName: "Usuário do Compass",
      },
      invoices: [],
      updatePrefs: (prefs) => set((state) => ({ ...state, ...prefs })),
      changePlan: ({ plan, paymentMethod }) =>
        set((state) => {
          const now = new Date().toISOString();
          const nextStatus: SubscriptionStatus = plan === "free" ? "inactive" : "active";
          const normalizedPaymentMethod = paymentMethod
            ? { ...state.paymentMethod, ...paymentMethod }
            : state.paymentMethod;

          return {
            ...state,
            plan,
            subscriptionStatus: nextStatus,
            renewalDate: plan === "free" ? null : addDays(30),
            cancellationEffectiveDate: null,
            paymentMethod: normalizedPaymentMethod,
            invoices: [createInvoice(plan, now), ...state.invoices].slice(0, 12),
          };
        }),
      scheduleCancellation: () =>
        set((state) => ({
          ...state,
          subscriptionStatus: state.plan === "free" ? "inactive" : "cancel_at_period_end",
          cancellationEffectiveDate: state.renewalDate,
        })),
      reactivateSubscription: () =>
        set((state) => ({
          ...state,
          subscriptionStatus: state.plan === "free" ? "inactive" : "active",
          cancellationEffectiveDate: null,
          renewalDate: state.plan === "free" ? null : state.renewalDate ?? addDays(30),
        })),
      updatePaymentMethod: (paymentMethod) =>
        set((state) => ({
          ...state,
          paymentMethod: { ...state.paymentMethod, ...paymentMethod },
        })),
    }),
    { name: "olcan-profile-prefs" }
  )
);
