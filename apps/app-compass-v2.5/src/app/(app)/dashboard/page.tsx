"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  BookOpenText,
  Compass,
  FileText,
  Mic,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { JourneyProgressChecklist } from "@/components/journey/JourneyProgressChecklist";
import { OperationalTelemetryHUD } from "@/components/dashboard/OperationalTelemetryHUD";
import { RoutePresencePanel } from "@/components/presence/RoutePresencePanel";
import { Skeleton } from "@/components/ui";
import { useJourneySnapshot } from "@/hooks/useJourneySnapshot";
import { useHydration } from "@/hooks/use-hydration";
import { useAuthStore } from "@/stores/auth";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function priorityTone(priority: "critical" | "high" | "medium" | "low") {
  switch (priority) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "high":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "medium":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

const WELCOME_DISMISS_KEY = "olcan_welcome_banner_dismissed";

function DashboardWelcomeStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(WELCOME_DISMISS_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  const showWelcome = searchParams.get("welcome") === "1" && !dismissed;

  if (!showWelcome) return null;

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(WELCOME_DISMISS_KEY, "1");
    }
    router.replace("/dashboard");
  };

  return (
    <div className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-5 text-slate-900 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Primeiros passos</p>
        <p className="text-sm font-semibold text-slate-950">Bem-vindo ao Compass — sua base para internacionalização profissional</p>
        <p className="text-sm leading-relaxed text-slate-600">
          Comece pelo diagnóstico de mobilidade. Ele alinha rota, documentos e leituras de prontidão ao seu perfil. Se recebeu e-mail de
          confirmação, abra o link quando puder — sua conta já está ativa para explorar.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link
          href="/onboarding/quiz"
          className="inline-flex items-center gap-2 rounded-[1.2rem] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Iniciar diagnóstico
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex items-center gap-1 rounded-[1.2rem] border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Entendi
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const ready = useHydration();
  const { user } = useAuthStore();
  const { snapshot, routeSignals } = useJourneySnapshot();
  const firstName = user?.full_name?.split(" ")[0] || "viajante";

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-[2rem]" />
        <div className="grid gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <Skeleton className="h-[26rem] rounded-[2rem]" />
          <Skeleton className="h-[26rem] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <DashboardWelcomeStrip />
      </Suspense>

      <JourneyProgressChecklist />

      <OperationalTelemetryHUD snapshot={snapshot} />

      <section className="overflow-hidden rounded-[2rem] border border-slate-700 bg-[linear-gradient(135deg,rgba(10,10,11,0.98),rgba(30,41,59,0.95),rgba(71,85,105,0.92))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Central de Comando
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 lg:text-base">
              O Compass agora prioriza uma única leitura operacional da sua jornada:
              rota, execução, contexto editorial e apoio comercial dentro do mesmo fluxo.
            </p>
          </div>

          {snapshot.nextBestAction ? (
            <div className="max-w-md rounded-[1.6rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Próxima melhor ação
              </p>
              <p className="mt-3 text-xl font-semibold">{snapshot.nextBestAction.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {snapshot.nextBestAction.description}
              </p>
              <Link
                href={snapshot.nextBestAction.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                {snapshot.nextBestAction.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Prontidão da rota"
          value={`${snapshot.metrics.routeReadiness}%`}
          detail={snapshot.lifecycle.label}
        />
        <MetricCard
          label="Pendências ativas"
          value={String(snapshot.metrics.pendingTasks)}
          detail="tarefas em sprints"
        />
        <MetricCard
          label="Qualidade documental"
          value={`${snapshot.metrics.docProgress}%`}
          detail="materiais e application docs"
        />
        <MetricCard
          label="Entrevistas"
          value={`${snapshot.metrics.interviewProgress}%`}
          detail={snapshot.metrics.routeRiskLabel}
        />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/82 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Compass className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Sistema operacional da oportunidade</p>
        </div>
        <div className="mt-3 max-w-3xl">
          <h2 className="text-xl font-semibold text-slate-950">Da aspiracao ao dossier executavel</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            O Compass organiza a mesma oportunidade sob perspectivas diferentes, sem sobreposicao:
            descoberta e priorizacao, candidatura, dossier e materiais, execucao de tarefas,
            prontidao e pratica de performance.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OperatingSystemCard
            href="/applications/opportunities"
            icon={Compass}
            eyebrow="Entrada"
            title="Aspiracao e alvo"
            description="Transforme uma bolsa, vaga, edital ou sonho em oportunidade concreta e acompanhavel."
            cta="Explorar oportunidades"
          />
          <OperatingSystemCard
            href="/applications"
            icon={Briefcase}
            eyebrow="Pipeline"
            title="Candidaturas"
            description="Cada oportunidade vira um centro operacional com deadline, status, match e contexto."
            cta="Ver pipeline"
          />
          <OperatingSystemCard
            href="/forge"
            icon={FileText}
            eyebrow="Centro"
            title="Forge e dossier"
            description="Documentos exportaveis, respostas estruturadas, variantes por rota e biblioteca reutilizavel."
            cta="Abrir Forge"
          />
          <OperatingSystemCard
            href="/interviews"
            icon={Mic}
            eyebrow="Performance"
            title="Execucao e preparo"
            description="Coordene tarefas, entrevistas, networking e readiness como visoes da mesma jornada."
            cta="Preparar performance"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white/82 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">Ações Prioritárias</p>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.actionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${priorityTone(item.priority)}`}>
                      {item.priority}
                    </div>
                    {item.meta ? (
                      <p className="text-xs font-medium text-slate-500">{item.meta}</p>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{item.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {snapshot.focusCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[1.7rem] border border-slate-200 bg-white/82 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {card.tone === "clay" ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : (
                    <Compass className="h-3.5 w-3.5" />
                  )}
                  {card.meta}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {card.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <RoutePresencePanel signals={routeSignals} title="Minha Rota" />

          {snapshot.commerceRecommendation ? (
            <Link
              href={`/marketplace/products/${snapshot.commerceRecommendation.slug}`}
              className="block rounded-[2rem] border border-slate-200 bg-white/82 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                <ShoppingBag className="h-3.5 w-3.5" />
                Oferta recomendada
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {snapshot.commerceRecommendation.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {snapshot.commerceRecommendation.short_description || snapshot.commerceRecommendation.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                Ver oferta
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ) : null}

          {snapshot.contentRecommendation ? (
            <Link
              href={snapshot.contentRecommendation.href}
              className="block rounded-[2rem] border border-slate-200 bg-white/82 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                <BookOpenText className="h-3.5 w-3.5" />
                Leitura recomendada
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {snapshot.contentRecommendation.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {snapshot.contentRecommendation.excerpt}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                Abrir contexto
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white/82 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function OperatingSystemCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
  cta,
}: {
  href: string;
  icon: typeof Compass;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
