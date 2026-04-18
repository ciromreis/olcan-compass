/**
 * Entitlement Rules — Olcan Compass v2.5
 *
 * Central source of truth for which plan unlocks which feature.
 * Import `canAccess` or `useEntitlement` — never hard-code plan checks inline.
 */

import type { UserPlan } from '@/stores/profile'

// ─── Feature catalogue ────────────────────────────────────────────────────────

export type FeatureKey =
  // Forge
  | 'forge_create'          // Create any document                (free: 3 docs, pro+: unlimited)
  | 'forge_ai_polish'       // AI polish / analysis endpoint      (pro+)
  | 'forge_ats_optimizer'   // ATS keyword optimizer              (pro+)
  | 'forge_coach'           // AI coach chat inside document      (pro+)
  | 'forge_compare'         // Side-by-side version compare       (pro+)
  | 'forge_cv_builder'      // Guided CV builder                  (pro+)
  // Interviews
  | 'interviews_basic'      // Text-mode interview sessions       (free: 3/month, pro+: unlimited)
  | 'interviews_voice'      // Mic + live transcription           (pro+)
  | 'interviews_feedback'   // AI per-answer feedback             (pro+)
  // Routes
  | 'routes_one'            // One active route                   (free)
  | 'routes_three'          // Up to 3 active routes              (pro)
  | 'routes_unlimited'      // Unlimited routes                   (premium)
  | 'routes_economics'      // Financial scenario overlays        (pro+)
  // Psych
  | 'psych_basic'           // First 3 dimensions                 (free)
  | 'psych_full'            // All 8 dimensions                   (pro+)
  // Marketplace
  | 'marketplace_browse'    // Browse providers                   (free)
  | 'marketplace_book'      // Book a session / hire              (pro+)
  // Companion / Aura
  | 'aura_basic'            // Companion creation + care          (free)
  | 'aura_evolution'        // Companion evolution stages 2–5     (pro+)
  | 'aura_abilities'        // Ability unlocks                    (premium)
  // Community
  | 'guilds_join'           // Join a guild                       (free)
  | 'guilds_create'         // Create a guild                     (pro+)
  // Admin / Org
  | 'admin_access'          // Admin dashboard                    (admin role only — handled separately)

// ─── Plan hierarchy  ─────────────────────────────────────────────────────────

const PLAN_RANK: Record<UserPlan, number> = { free: 0, pro: 1, premium: 2 }

/** Returns true when `userPlan` meets or exceeds `required` */
function meetsOrExceeds(userPlan: UserPlan, required: UserPlan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[required]
}

// ─── Entitlement rules ────────────────────────────────────────────────────────

/**
 * Maps each feature to the *minimum* plan required and an optional usage
 * limit on the free tier (null = unlimited).
 */
export interface FeatureRule {
  minPlan: UserPlan
  /** Friendly name used in upgrade prompts */
  label: string
  /** Short description for the gate UI */
  description: string
  /** Free-tier monthly limit (null = feature is fully blocked on free) */
  freeLimit: number | null
}

export const FEATURE_RULES: Record<FeatureKey, FeatureRule> = {
  // Forge ────────────────────────────────
  forge_create: {
    minPlan: 'free',
    label: 'Criar documentos no Forge',
    description: 'Crie cartas de motivação, CVs e personal statements.',
    freeLimit: 3,
  },
  forge_ai_polish: {
    minPlan: 'pro',
    label: 'Polimento por IA',
    description: 'Analise e melhore seus documentos com inteligência artificial.',
    freeLimit: null,
  },
  forge_ats_optimizer: {
    minPlan: 'pro',
    label: 'Otimizador ATS',
    description: 'Adapte keywords para sistemas de triagem automática.',
    freeLimit: null,
  },
  forge_coach: {
    minPlan: 'pro',
    label: 'Coach de Documentos IA',
    description: 'Converse com o coach para refinar sua narrativa em tempo real.',
    freeLimit: null,
  },
  forge_compare: {
    minPlan: 'pro',
    label: 'Comparação de Versões',
    description: 'Compare versões lado a lado e recupere histórico.',
    freeLimit: null,
  },
  forge_cv_builder: {
    minPlan: 'pro',
    label: 'CV Builder Guiado',
    description: 'Templates profissionais com orientação passo a passo.',
    freeLimit: null,
  },
  // Interviews ──────────────────────────
  interviews_basic: {
    minPlan: 'free',
    label: 'Simulador de Entrevistas',
    description: 'Treine respostas em modo texto.',
    freeLimit: 3,
  },
  interviews_voice: {
    minPlan: 'pro',
    label: 'Modo Voz na Entrevista',
    description: 'Grave e transcreva suas respostas em tempo real.',
    freeLimit: null,
  },
  interviews_feedback: {
    minPlan: 'pro',
    label: 'Feedback por IA',
    description: 'Receba análise detalhada de cada resposta com score.',
    freeLimit: null,
  },
  // Routes ──────────────────────────────
  routes_one: {
    minPlan: 'free',
    label: '1 Rota Ativa',
    description: 'Planeje e acompanhe uma rota de mobilidade.',
    freeLimit: 1,
  },
  routes_three: {
    minPlan: 'pro',
    label: 'Até 3 Rotas Ativas',
    description: 'Compare e gerencie múltiplos destinos em paralelo.',
    freeLimit: null,
  },
  routes_unlimited: {
    minPlan: 'premium',
    label: 'Rotas Ilimitadas',
    description: 'Sem limite de rotas ativas simultâneas.',
    freeLimit: null,
  },
  routes_economics: {
    minPlan: 'pro',
    label: 'Cenários Financeiros',
    description: 'Overlays de custo de vida, salário e projeção por destino.',
    freeLimit: null,
  },
  // Psych ───────────────────────────────
  psych_basic: {
    minPlan: 'free',
    label: 'Diagnóstico Básico',
    description: 'Complete as 3 primeiras dimensões do seu perfil.',
    freeLimit: 3,
  },
  psych_full: {
    minPlan: 'pro',
    label: 'Diagnóstico Completo',
    description: 'Todas as 8 dimensões do perfil psicológico para mobilidade.',
    freeLimit: null,
  },
  // Marketplace ─────────────────────────
  marketplace_browse: {
    minPlan: 'free',
    label: 'Explorar Profissionais',
    description: 'Veja mentores, advogados e tradutores disponíveis.',
    freeLimit: null,
  },
  marketplace_book: {
    minPlan: 'pro',
    label: 'Contratar Serviços',
    description: 'Agende sessões e contrate serviços verificados.',
    freeLimit: null,
  },
  // Aura ────────────────────────────────
  aura_basic: {
    minPlan: 'free',
    label: 'Companheiro Aura',
    description: 'Crie e cuide do seu companheiro digital.',
    freeLimit: null,
  },
  aura_evolution: {
    minPlan: 'pro',
    label: 'Evolução da Aura',
    description: 'Desbloqueie estágios 2 a 5 de evolução.',
    freeLimit: null,
  },
  aura_abilities: {
    minPlan: 'premium',
    label: 'Habilidades da Aura',
    description: 'Desbloqueie habilidades exclusivas de alto nível.',
    freeLimit: null,
  },
  // Community ───────────────────────────
  guilds_join: {
    minPlan: 'free',
    label: 'Entrar em Guildas',
    description: 'Participe de comunidades organizadas por destino.',
    freeLimit: null,
  },
  guilds_create: {
    minPlan: 'pro',
    label: 'Criar Guilda',
    description: 'Crie e lidere uma guilda para seu destino ou nicho.',
    freeLimit: null,
  },
  admin_access: {
    minPlan: 'free', // role-based, not plan-based
    label: 'Painel de Administração',
    description: 'Acesso restrito a administradores da plataforma.',
    freeLimit: null,
  },
}

// ─── Core check ───────────────────────────────────────────────────────────────

export interface EntitlementResult {
  /** True when the user's plan allows this feature */
  allowed: boolean
  /** The plan required to unlock (undefined when already allowed) */
  requiredPlan?: UserPlan
  /** Rule metadata */
  rule: FeatureRule
}

/**
 * Pure function — can be used outside React (e.g. middleware, API route handlers).
 */
export function canAccess(feature: FeatureKey, userPlan: UserPlan): EntitlementResult {
  const rule = FEATURE_RULES[feature]
  const allowed = meetsOrExceeds(userPlan, rule.minPlan)
  return {
    allowed,
    requiredPlan: allowed ? undefined : rule.minPlan,
    rule,
  }
}

// ─── Plan labels ──────────────────────────────────────────────────────────────

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: 'Explorador',
  pro: 'Navegador',
  premium: 'Comandante',
}

export const PLAN_PRICES: Record<UserPlan, string> = {
  free: 'Grátis',
  pro: 'R$ 79/mês',
  premium: 'R$ 149/mês',
}

/** Returns the next plan up (undefined if already premium) */
export function nextPlan(current: UserPlan): UserPlan | undefined {
  if (current === 'free') return 'pro'
  if (current === 'pro') return 'premium'
  return undefined
}
