"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, CreditCard, Lock, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore, type UserPlan } from "@/stores/profile";
import { useHydration } from "@/hooks";
import { Button, Input, PageHeader, Skeleton, useToast } from "@/components/ui";

const PLAN_MAP = {
  free: {
    id: "free",
    name: "Explorador",
    price: "Grátis",
    amount: 0,
    summary: "Acesso inicial para explorar a plataforma e validar seu momento.",
  },
  pro: {
    id: "pro",
    name: "Navegador",
    price: "R$ 79/mês",
    amount: 79,
    summary: "Mais profundidade operacional para transformar intenção em execução.",
  },
  premium: {
    id: "premium",
    name: "Comandante",
    price: "R$ 149/mês",
    amount: 149,
    summary: "Camada máxima de acompanhamento, inteligência e prioridade.",
  },
} as const;

function parseExpiryYear(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.length === 4) return Number(trimmed);
  return Number(`20${trimmed.slice(-2)}`);
}

function SubscriptionCheckoutContent() {
  const hydrated = useHydration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { plan: currentPlan, changePlan } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(user?.full_name || "");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/27");
  const [cvc, setCvc] = useState("123");

  const planId = (searchParams.get("plan") || "pro") as keyof typeof PLAN_MAP;
  const plan = useMemo(() => PLAN_MAP[planId] ?? PLAN_MAP.pro, [planId]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (plan.id !== "free") {
      const digits = cardNumber.replace(/\D/g, "");
      const [monthRaw, yearRaw] = expiry.split("/");
      const month = Number(monthRaw);
      const year = parseExpiryYear(yearRaw || "");
      const cvcDigits = cvc.replace(/\D/g, "");

      if (!name.trim() || digits.length < 4 || month < 1 || month > 12 || cvcDigits.length < 3) {
        toast({
          title: "Dados incompletos",
          description: "Revise os dados de cobrança antes de confirmar.",
          variant: "warning",
        });
        return;
      }

      if (!year || year < new Date().getFullYear()) {
        toast({
          title: "Validade inválida",
          description: "Informe uma validade futura para concluir a assinatura.",
          variant: "warning",
        });
        return;
      }
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    changePlan({
      plan: planId as UserPlan,
      paymentMethod: plan.id === "free"
        ? undefined
        : {
            holderName: name.trim(),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            expMonth: Number(expiry.split("/")[0]),
            expYear: parseExpiryYear(expiry.split("/")[1] || ""),
          },
    });
    toast({
      title: `Plano ${plan.name} confirmado`,
      description: currentPlan === planId ? "Sua assinatura foi renovada com os dados atualizados." : "Seu plano foi atualizado com sucesso.",
      variant: "success",
    });
    setIsSubmitting(false);
    router.push("/subscription/manage");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref="/subscription"
        title="Checkout"
        subtitle={`Confirme sua assinatura para o plano ${plan.name}`}
      />

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="card-surface p-6 space-y-5">
          <div>
            <h2 className="font-heading text-h3 text-text-primary">Dados de cobrança</h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {plan.id === "free"
                ? "Você pode mover sua conta para o plano gratuito sem cobrança."
                : "Este fluxo continua local nesta etapa, mas agora persiste o plano e o método de cobrança na área de assinatura."}
            </p>
          </div>

          {plan.id === "free" ? (
            <div className="rounded-xl bg-cream-50 border border-cream-300 p-4 text-body-sm text-text-secondary">
              O downgrade remove a renovação recorrente e mantém o histórico local de faturamento para consulta futura.
            </div>
          ) : (
            <>
              <Input label="Nome no cartão" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Validade" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                <Input label="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} />
              </div>
            </>
          )}

          <div className="rounded-xl bg-cream-50 border border-cream-300 p-4 space-y-3">
            <div className="flex items-start gap-3 text-body-sm text-text-secondary">
              <Shield className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>{plan.id === "free" ? "Seu acesso será ajustado imediatamente após a confirmação." : "Dados protegidos por um fluxo seguro de checkout."}</span>
            </div>
            <div className="flex items-start gap-3 text-body-sm text-text-secondary">
              <Lock className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>Você pode ajustar ou cancelar sua assinatura depois em gerenciamento.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/subscription" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <Button onClick={handleConfirm} loading={isSubmitting} className="flex-1">
              <CreditCard className="w-4 h-4" /> Confirmar assinatura
            </Button>
          </div>
        </div>

        <div className="card-surface p-6 space-y-4 h-fit">
          <h3 className="font-heading text-h4 text-text-primary">Resumo do pedido</h3>
          <div className="rounded-xl bg-brand-50 p-4 border border-brand-100">
            <p className="text-caption text-text-muted">Plano selecionado</p>
            <p className="font-heading text-h3 text-text-primary mt-1">{plan.name}</p>
            <p className="font-heading text-h2 text-brand-500 mt-2">{plan.price}</p>
            <p className="text-body-sm text-text-secondary mt-2">{plan.summary}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 text-body-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>{plan.id === "free" ? "Sem renovação recorrente no plano Explorador." : "Renovação mensal com gestão posterior em um clique."}</span>
            </div>
            <div className="flex items-start gap-2 text-body-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>{plan.id === "free" ? "Seu downgrade é registrado imediatamente no perfil." : "Upgrade imediato do acesso após confirmação."}</span>
            </div>
            <div className="flex items-start gap-2 text-body-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>Histórico e cobrança visíveis na área de gerenciamento.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <Skeleton className="h-[420px]" />
            <Skeleton className="h-[320px]" />
          </div>
        </div>
      }
    >
      <SubscriptionCheckoutContent />
    </Suspense>
  );
}
