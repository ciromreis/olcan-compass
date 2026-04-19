"use client";

import Link from "next/link";
import { CreditCard, ArrowRight, Zap, Shield, Rocket } from "lucide-react";
import { useHydration } from "@/hooks";
import { PageHeader, Skeleton } from "@/components/ui";
import { useEffectivePlan } from "@/hooks/use-effective-plan";
import { cn } from "@/lib/utils";

const PLAN_INFO = {
  free: {
    label: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Acesso básico ao Forge e Routes.",
    color: "text-slate-700",
    bg: "from-white to-cream-50",
    badge: "bg-slate-100 text-slate-700",
    icon: Shield,
  },
  pro: {
    label: "Pro",
    price: "R$ 49,99",
    period: "/mês",
    description: "Documentos ilimitados, IA avançada e suporte prioritário.",
    color: "text-brand-700",
    bg: "from-white to-brand-50",
    badge: "bg-brand-100 text-brand-700",
    icon: Zap,
  },
  premium: {
    label: "Premium",
    price: "R$ 89,99",
    period: "/mês",
    description: "Todos os recursos Pro + marketplace, mentoria e acesso antecipado.",
    color: "text-emerald-700",
    bg: "from-white to-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    icon: Rocket,
  },
} as const;

export default function SettingsBillingPage() {
  const hydrated = useHydration();
  const plan = useEffectivePlan();

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const planKey = (plan === "pro" || plan === "premium") ? plan : "free";
  const info = PLAN_INFO[planKey];
  const Icon = info.icon;
  const isPaid = planKey !== "free";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader backHref="/settings" title="Assinatura e Pagamentos" />

      {/* Current plan */}
      <div
        className={cn(
          "rounded-2xl border border-cream-200 bg-gradient-to-br p-6",
          info.bg
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon className={cn("h-5 w-5", info.color)} />
            </div>
            <div>
              <h3 className={cn("font-heading text-lg font-bold", info.color)}>
                Plano {info.label}
              </h3>
              <p className="text-sm text-text-secondary">{info.description}</p>
            </div>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", info.badge)}>
            Ativo
          </span>
        </div>

        <p className={cn("font-heading text-3xl font-bold mb-1", info.color)}>
          {info.price}
          <span className="text-base font-normal text-text-muted">{info.period}</span>
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            {isPaid ? "Alterar Plano" : "Ver Planos"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {isPaid && (
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 rounded-xl border border-cream-300 px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-cream-50 transition-colors"
            >
              Cancelar Assinatura
            </Link>
          )}
        </div>
      </div>

      {/* Payment method — only shown when on paid plan */}
      {isPaid && (
        <div className="rounded-2xl border border-cream-200 bg-white p-6">
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-text-muted" />
            Método de Pagamento
          </h3>
          <p className="text-sm text-text-muted">
            Gerencie seu método de pagamento diretamente pelo portal do Stripe.
          </p>
          <Link
            href="/subscription"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Abrir portal de pagamento
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Upgrade prompt for free plan */}
      {!isPaid && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h3 className="font-heading text-base font-semibold text-brand-900 mb-1">
            Desbloqueie o plano Pro
          </h3>
          <p className="text-sm text-brand-700 mb-4">
            Documentos ilimitados no Forge, análise ATS, polimento com IA e muito mais.
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Ver Planos
          </Link>
        </div>
      )}
    </div>
  );
}
