"use client";

import { ComingSoonPanel } from "@/components/product/ComingSoonPanel";
import { productSurface } from "@/lib/product-flags";
import { Brain, Flame, RefreshCcw, ShieldAlert, Sparkles, Target } from "lucide-react";
import { Button, Card } from "@/components/ui";
import {
  ARCHETYPES_DB,
  FEAR_CLUSTER_DB,
  type FearCluster,
  type AuraArchetype,
  useNudgeStore,
} from "@/stores/nudge";

const ARCHETYPE_OPTIONS = Object.values(ARCHETYPES_DB);
const FEAR_OPTIONS = Object.entries(FEAR_CLUSTER_DB) as Array<[FearCluster, string]>;

function NudgeEngineInner() {
  const {
    archetype,
    fearCluster,
    evolutionStage,
    kineticEnergy,
    momentum,
    setGamificationState,
    updateActivity,
    getArchetypeData,
    getFearClusterName,
    reset,
  } = useNudgeStore();

  const archetypeData = getArchetypeData();
  const fearClusterName = getFearClusterName();

  const handleArchetypeSelect = (value: AuraArchetype) => {
    setGamificationState({ archetype: value });
  };

  const handleFearClusterSelect = (value: FearCluster) => {
    setGamificationState({ fearCluster: value });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950 p-8 text-white shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            <Brain className="h-4 w-4" />
            Behavioral Engine
          </div>
          <div>
            <h1 className="font-heading text-3xl">Motor de comportamento</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Este modulo esta consolidado como um painel de estado para arquétipo, energia e
              momentum. Ele precisa servir a rotinas de produto reais, nao a uma camada paralela de
              placeholders desconectados do store.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => updateActivity()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Registrar atividade
          </Button>
          <Button variant="ghost" onClick={() => reset()}>
            Resetar
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-text-secondary">
            <Target className="h-4 w-4" />
            Arquétipo
          </div>
          <div className="font-heading text-h4 text-text-primary">
            {archetypeData?.name ?? "Nao definido"}
          </div>
          <p className="mt-2 text-body-sm text-text-secondary">
            {archetypeData?.description ?? "Selecione um arquétipo operacional para personalizacao."}
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-text-secondary">
            <ShieldAlert className="h-4 w-4" />
            Fear Cluster
          </div>
          <div className="font-heading text-h4 text-text-primary">
            {fearClusterName ?? "Nao definido"}
          </div>
          <p className="mt-2 text-body-sm text-text-secondary">
            O cluster dominante orienta mensagens de suporte e intervencoes de rotina.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-text-secondary">
            <Sparkles className="h-4 w-4" />
            Energia cinetica
          </div>
          <div className="font-heading text-h4 text-text-primary">{kineticEnergy}/100</div>
          <p className="mt-2 text-body-sm text-text-secondary">
            Ajuste incremental alinhado ao estagio atual de evolucao.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-text-secondary">
            <Flame className="h-4 w-4" />
            Momentum
          </div>
          <div className="font-heading text-h4 text-text-primary">{momentum.currentStreak} dias</div>
          <p className="mt-2 text-body-sm text-text-secondary">
            Melhor sequencia: {momentum.longestStreak} dias. Inatividade atual: {momentum.inactiveDays} dias.
          </p>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Card className="p-8">
          <h2 className="font-heading text-h3 text-text-primary">Selecionar arquétipo</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Escolha uma configuracao que exista de fato no store atual.
          </p>

          <div className="mt-6 grid gap-4">
            {ARCHETYPE_OPTIONS.map((option) => {
              const isActive = archetype === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleArchetypeSelect(option.id)}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    isActive
                      ? "border-brand-500 bg-brand-50"
                      : "border-cream-300 bg-white hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${option.color.replace("text-", "bg-")}`} />
                    <h3 className="font-heading text-h4 text-text-primary">{option.name}</h3>
                  </div>
                  <p className="mt-2 text-body-sm text-text-secondary">{option.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.motivators.map((motivator) => (
                      <span
                        key={motivator}
                        className="rounded-full bg-cream-100 px-2 py-1 text-xs text-text-secondary"
                      >
                        {motivator}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="font-heading text-h3 text-text-primary">Configurar friccao principal</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            O store atual suporta quatro clusters de medo. O painel abaixo trabalha apenas com essas
            opcoes validas.
          </p>

          <div className="mt-6 grid gap-3">
            {FEAR_OPTIONS.map(([key, label]) => {
              const isActive = fearCluster === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFearClusterSelect(key)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                    isActive
                      ? "border-clay-500 bg-clay-50"
                      : "border-cream-300 bg-white hover:border-clay-300"
                  }`}
                >
                  <div className="font-semibold text-text-primary">{label}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-text-secondary">{key}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 p-5">
            <h3 className="font-heading text-h4 text-text-primary">Estado operacional</h3>
            <dl className="mt-4 grid gap-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between">
                <dt>Estagio de evolucao</dt>
                <dd className="font-semibold text-text-primary">{evolutionStage}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Ultima atividade</dt>
                <dd className="font-semibold text-text-primary">
                  {new Date(momentum.lastActivity).toLocaleString("pt-BR")}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default function NudgeEnginePage() {
  if (!productSurface.nudgeEngine) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <ComingSoonPanel
          title="Motor de comportamento (interno)"
          description="Esta área é um laboratório de UX para o time de produto. Ative com NEXT_PUBLIC_FEATURE_NUDGE_ENGINE=true apenas em ambientes de experimentação."
          backHref="/dashboard"
        />
      </div>
    );
  }

  return <NudgeEngineInner />;
}
