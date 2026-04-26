/**
 * Olcan Ecosystem — Centralized Service URL Registry
 *
 * RULE (Padrões de Código §5): This is the single source of truth for ALL
 * service URLs in the app-compass app. No other file may read NEXT_PUBLIC_*_URL
 * env vars directly or hardcode subdomain hostnames.
 *
 * Architecture reference:
 *   wiki/02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan.md
 * Coding standard:
 *   wiki/00_Onboarding_Inicio/Padroes_de_Codigo.md (Rule 5)
 */

// ---------------------------------------------------------------------------
// Runtime guard — warn in development when critical vars are absent.
// In production, missing vars fall back to canonical production URLs.
// ---------------------------------------------------------------------------
if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
  const expected = [
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_CMS_URL",
    "NEXT_PUBLIC_ZENITH_API_URL",
    "NEXT_PUBLIC_MARKETPLACE_API_URL",
  ] as const;
  for (const key of expected) {
    if (!process.env[key]) {
      console.warn(
        `[api-endpoints] ⚠ ${key} is not set — using canonical production fallback. ` +
          `Copy .env.example to .env.local and fill in values for local dev.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Pre-compute base strings so they're not duplicated across sub-properties.
// Each variable holds the raw origin (no trailing slash, no path suffix).
// ---------------------------------------------------------------------------
const _apiBase =
  process.env.NEXT_PUBLIC_API_URL || "https://api.olcan.com.br";

// ---------------------------------------------------------------------------
// API_ENDPOINTS — canonical service bases for the Olcan ecosystem
//
// Topology (Nexus Bridge rules apply — no direct app-to-app calls):
//
//   api         → The Orchestrator  api.olcan.com.br   (FastAPI core, auth, DB)
//   app         → The Core OS       compass.olcan.com.br (this app)
//   cms         → The Vitrine       www.olcan.com.br   (Payload CMS on mktg site)
//   marketplace → The Services      marketplace.olcan.com.br (MedusaJS engine)
//   zenith      → Discovery Layer   zenith.olcan.com.br (Zenith microservice)
//   mautic      → CRM Engine        mautic.olcan.com.br (marketing automation)
// ---------------------------------------------------------------------------
export const API_ENDPOINTS = {
  /**
   * The Orchestrator (Nexus Bridge) — FastAPI Core.
   * All auth and data operations route through here.
   *
   * base — raw origin, no path suffix
   * rest — origin + /api   (for direct fetch() callers; axios uses resolveApiBaseUrl() in api.ts)
   * v1   — origin + /api/v1
   */
  api: {
    base: _apiBase,
    rest: `${_apiBase}/api`,
    v1: `${_apiBase}/api/v1`,
  },

  /**
   * The Core OS — this application (compass.olcan.com.br).
   * Use for generating absolute self-links (PDF exports, email templates, etc.).
   */
  app: {
    base:
      process.env.NEXT_PUBLIC_APP_URL || "https://compass.olcan.com.br",
  },

  /**
   * The Vitrine / CMS — Payload CMS served from the marketing site.
   * Correct fallback: www.olcan.com.br (NOT api.olcan.com.br).
   */
  cms: {
    base: process.env.NEXT_PUBLIC_CMS_URL || "https://www.olcan.com.br",
  },

  /**
   * The Services Layer — MedusaJS marketplace engine.
   * Correct fallback: marketplace.olcan.com.br (NOT api.olcan.com.br).
   */
  marketplace: {
    base:
      process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
      "https://marketplace.olcan.com.br",
  },

  /**
   * Discovery Layer — Zenith microservice.
   * The env var (NEXT_PUBLIC_ZENITH_API_URL) is expected to include the /api
   * path (e.g. https://zenith.olcan.com.br/api). The fallback preserves this.
   * Correct fallback: zenith.olcan.com.br/api (NOT api.olcan.com.br).
   */
  zenith: {
    base:
      process.env.NEXT_PUBLIC_ZENITH_API_URL ||
      "https://zenith.olcan.com.br/api",
  },

  /**
   * CRM Engine — Mautic marketing automation.
   * Used for tracking pixel base URL and webhook targets.
   */
  mautic: {
    base:
      process.env.NEXT_PUBLIC_MAUTIC_URL || "https://mautic.olcan.com.br",
  },
} as const;

// ---------------------------------------------------------------------------
// API_ROUTES — typed REST path builders for the API Core (api.olcan.com.br).
//
// These use API_ENDPOINTS.api.rest (origin/api) or .v1 (origin/api/v1).
// Do NOT read process.env directly here — use the constants above.
// ---------------------------------------------------------------------------
export const API_ROUTES = {
  auth: {
    register: `${API_ENDPOINTS.api.rest}/auth/register`,
    login: `${API_ENDPOINTS.api.rest}/auth/login`,
    me: `${API_ENDPOINTS.api.rest}/auth/me`,
    refresh: `${API_ENDPOINTS.api.rest}/auth/refresh`,
  },
  documents: {
    list: `${API_ENDPOINTS.api.v1}/documents`,
    create: `${API_ENDPOINTS.api.v1}/documents`,
    polish: (id: string) =>
      `${API_ENDPOINTS.api.v1}/documents/${id}/polish`,
    analyze: (id: string) =>
      `${API_ENDPOINTS.api.v1}/documents/${id}/analyze`,
  },
  dossiers: {
    list: `${API_ENDPOINTS.api.v1}/dossiers`,
    create: `${API_ENDPOINTS.api.v1}/dossiers`,
    get: (id: string) => `${API_ENDPOINTS.api.v1}/dossiers/${id}`,
    evaluate: (id: string) =>
      `${API_ENDPOINTS.api.v1}/dossiers/${id}/evaluate`,
  },
  routes: {
    list: `${API_ENDPOINTS.api.rest}/routes`,
    create: `${API_ENDPOINTS.api.rest}/routes`,
  },
  tasks: {
    list: `${API_ENDPOINTS.api.rest}/tasks`,
    create: `${API_ENDPOINTS.api.rest}/tasks`,
    complete: (id: string) =>
      `${API_ENDPOINTS.api.rest}/tasks/${id}/complete`,
  },
  profiles: {
    base: `${API_ENDPOINTS.api.v1}/users`,
    byId: (userId: string) => `${API_ENDPOINTS.api.v1}/users/${userId}`,
  },
  commerce: {
    /** Used by /api/checkout route.ts — POST to initiate checkout intent */
    checkoutIntents: `${API_ENDPOINTS.api.rest}/commerce/me/checkout-intents`,
    /** Public product catalog proxy */
    products: `${API_ENDPOINTS.api.rest}/commerce/public/products`,
  },
} as const;

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
