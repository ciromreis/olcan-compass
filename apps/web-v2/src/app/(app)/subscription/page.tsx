 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, CreditCard, Sparkles, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore, type UserPlan } from "@/stores/profile";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton, UpgradeModal, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";

const PLANS = [
  { id: "free" as UserPlan, name: "Explorador", price: "Grátis", features: ["Diagnóstico psicológico básico", "1 rota ativa", "Marketplace (visualizar)", "Suporte por e-mail"] },
  { id: "pro" as UserPlan, name: "Navegador", price: "R$ 79/mês", features: ["Diagnóstico completo (8 dimensões)", "3 rotas ativas", "Forge com IA ilimitada", "Simulador de entrevistas", "Marketplace (contratar)", "Suporte prioritário"] },
  { id: "premium" as UserPlan, name: "Comandante", price: "R$ 149/mês", features: ["Tudo do Navegador", "Rotas ilimitadas", "Coach IA dedicado", "Análise de competitividade", "Sprints personalizados", "Acesso antecipado a features", "Suporte 1:1"] },
];

export default function SubscriptionPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    plan: activePlanId,
    subscriptionStatus,
    renewalDate,
    cancellationEffectiveDate,
    invoices,
  } = useProfileStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const currentPlan = useMemo(() => PLANS.find((p) => p.id === activePlanId) ?? PLANS[1], [activePlanId]);
  const latestInvoice = invoices[0];
  const billingSummary =
    activePlanId === "free"
      ? "Sem cobrança recorrente no momento"
      : subscriptionStatus === "cancel_at_period_end" && cancellationEffectiveDate
        ? `Cancelamento agendado para ${formatDate(cancellationEffectiveDate)}`
        : renewalDate
          ? `Renovação em ${formatDate(renewalDate)} · ${latestInvoice ? `R$ ${latestInvoice.amount.toFixed(2).replace(".", ",")}/mês` : currentPlan.price}`
          : currentPlan.price;

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Minha Assinatura"
        subtitle={user?.full_name ? `Plano atual de ${user.full_name}` : "Gerencie seu plano, cobrança e limites"}
        actions={
          <div className="flex gap-2">
            <Link href="/subscription/usage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
              <BarChart3 className="w-4 h-4" /> Uso
            </Link>
            <Link href="/subscription/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
              <CreditCard className="w-4 h-4" /> Gerenciar
            </Link>
          </div>
        }
      />

      <div className="card-surface p-6 flex items-center gap-4 bg-gradient-to-r from-moss-50 to-cream-100">
        <Sparkles className="w-8 h-8 text-moss-500" />
        <div className="flex-1">
          <p className="text-caption text-text-muted">Plano Atual</p>
          <p className="font-heading text-h3 text-text-primary">{currentPlan.name}</p>
          <p className="text-body-sm text-text-secondary">{billingSummary}</p>
        </div>
        <button onClick={() => setUpgradeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-moss-500 text-white text-body-sm font-semibold hover:bg-moss-600 transition-colors">
          <ArrowRight className="w-4 h-4" /> Alterar plano
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`card-surface p-6 ${plan.id === activePlanId ? "ring-2 ring-moss-500" : ""}`}>
            {plan.id === activePlanId && <span className="text-caption px-2 py-0.5 rounded-full bg-moss-50 text-moss-500 font-medium mb-3 inline-block">Atual</span>}
            <h3 className="font-heading text-h3 text-text-primary">{plan.name}</h3>
            <p className="font-heading text-h2 text-moss-500 my-2">{plan.price}</p>
            <ul className="space-y-2 mt-4">
              {plan.features.map((f) => (
                <li key={f} className="text-body-sm text-text-secondary flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-moss-500 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {plan.id !== activePlanId && (
              <button
                onClick={() => {
                  toast({ title: `Plano ${plan.name} selecionado`, description: "Você será levado para a confirmação de upgrade.", variant: "success" });
                  router.push(`/subscription/checkout?plan=${plan.id}`);
                }}

                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-moss-500 text-moss-500 font-heading font-semibold text-body-sm hover:bg-moss-50 transition-colors"
              >
                {plan.price === "Grátis" ? "Downgrade" : "Upgrade"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlanId={currentPlan.id}
        plans={PLANS.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.id === activePlanId ? "Seu plano atual com boa profundidade operacional." : "Compare benefícios e continue quando fizer sentido.",
          highlights: plan.features.slice(0, 4),
        }))}
        onSelect={(planId: string) => {
          setUpgradeOpen(false);
          router.push(`/subscription/checkout?plan=${planId}`);
        }}
      />
    </div>
  );
}
