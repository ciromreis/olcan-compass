"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, ExternalLink, Lock, Shield } from "lucide-react";
import { useProfileStore } from "@/stores/profile";
import { useHydration } from "@/hooks";
import { Button, PageHeader, Skeleton, useToast } from "@/components/ui";
import { apiClient } from "@/lib/api-client";

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

function SubscriptionCheckoutContent() {
  const hydrated = useHydration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { changePlan } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planId = (searchParams.get("plan") || "pro") as keyof typeof PLAN_MAP;
  const plan = useMemo(() => PLAN_MAP[planId] ?? PLAN_MAP.pro, [planId]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[260px]" />
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    // Free plan: just update locally
    if (plan.id === "free") {
      changePlan({ plan: "free" });
      toast({ title: "Plano Explorador ativado", description: "Seu plano foi rebaixado para o nível gratuito.", variant: "success" });
      router.push("/subscription/manage");
      return;
    }

    // Paid plans: redirect to Stripe Checkout
    setIsSubmitting(true);
    try {
      const result = await apiClient.createSubscriptionCheckout(planId as "pro" | "premium");
      window.location.href = result.checkout_url;
    } catch (err: unknown) {
      const detail = (err as { message?: string })?.message || "";
      if (detail.includes("not configured")) {
        toast({
          title: "Checkout via Stripe em breve",
          description: "A integração de pagamento está em configuração. Tente novamente em breve.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Erro ao redirecionar para o pagamento",
          description: "Tente novamente em alguns instantes.",
          variant: "warning",
        });
      }
      setIsSubmitting(false);
    }
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
            <h2 className="font-heading text-h3 text-text-primary">
              {plan.id === "free" ? "Cancelar assinatura" : "Prosseguir para pagamento seguro"}
            </h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {plan.id === "free"
                ? "Você pode mover sua conta para o plano gratuito sem cobrança adicional."
                : "Você será redirecionado para o checkout seguro da Stripe para inserir seus dados de pagamento."}
            </p>
          </div>

          {plan.id !== "free" && (
            <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-body-sm font-semibold text-brand-700">
                <ExternalLink className="w-4 h-4" />
                Redirecionamento seguro via Stripe
              </div>
              <p className="text-caption text-text-muted">
                Seus dados de cartão são processados diretamente pela Stripe — o Olcan nunca armazena informações de pagamento.
              </p>
            </div>
          )}

          <div className="rounded-xl bg-cream-50 border border-cream-300 p-4 space-y-3">
            <div className="flex items-start gap-3 text-body-sm text-text-secondary">
              <Shield className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>{plan.id === "free" ? "Seu acesso será ajustado ao final do ciclo de cobrança." : "Pagamento protegido por criptografia SSL via Stripe."}</span>
            </div>
            <div className="flex items-start gap-3 text-body-sm text-text-secondary">
              <Lock className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>Você pode cancelar sua assinatura a qualquer momento na área de gerenciamento.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/subscription" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-500 text-text-secondary text-body-sm font-medium hover:bg-cream-200 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <Button onClick={handleConfirm} loading={isSubmitting} className="flex-1">
              {plan.id === "free"
                ? <><CheckCircle className="w-4 h-4" /> Confirmar downgrade</>
                : <><CreditCard className="w-4 h-4" /> Ir para pagamento <ArrowRight className="w-4 h-4" /></>
              }
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
              <span>{plan.id === "free" ? "Sem cobrança adicional no downgrade." : "Acesso imediato após confirmação do pagamento."}</span>
            </div>
            <div className="flex items-start gap-2 text-body-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 mt-0.5 text-brand-500" />
              <span>Renovação mensal automática, cancelável a qualquer momento.</span>
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
