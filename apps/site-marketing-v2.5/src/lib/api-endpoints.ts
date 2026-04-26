/**
 * Olcan Ecosystem — Centralized Service URL Registry (Marketing Site)
 *
 * RULE (Padrões de Código §5): This is the single source of truth for ALL
 * service URLs in the site-marketing app. No other file may read NEXT_PUBLIC_*_URL
 * env vars directly or hardcode subdomain hostnames.
 *
 * Architecture reference:
 *   wiki/02_Arquitetura_Compass/Arquitetura_Sistemas_Olcan.md
 * Coding standard:
 *   wiki/00_Onboarding_Inicio/Padroes_de_Codigo.md (Rule 5)
 */

// ---------------------------------------------------------------------------
// Runtime guard — warn in development when critical vars are absent.
// ---------------------------------------------------------------------------
if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
  const expected = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_APP_URL",
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
// API_ENDPOINTS — canonical service bases for the marketing site context
//
// Topology (all data flows through the Nexus Bridge):
//
//   site        → The Vitrine (this app)   www.olcan.com.br
//   api         → The Orchestrator         api.olcan.com.br   (never called directly from browser)
//   app         → The Core OS              compass.olcan.com.br (CTA destination)
//   marketplace → The Services Layer       marketplace.olcan.com.br
//   mautic      → CRM Engine               mautic.olcan.com.br (lead capture forms)
//   n8n         → Automation Brain         n8n.olcan.com.br (webhook receiver)
// ---------------------------------------------------------------------------
export const API_ENDPOINTS = {
  /**
   * The Vitrine — this site (www.olcan.com.br).
   * Use for canonical URL generation (sitemap, og:url, structured data).
   */
  site: {
    base:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_CMS_URL ||
      "https://www.olcan.com.br",
  },

  /**
   * The Orchestrator (Nexus Bridge) — FastAPI Core.
   * Marketing site typically calls this server-side only (never from browser
   * directly — all client interactions go through the Compass app or n8n).
   */
  api: {
    base: process.env.NEXT_PUBLIC_API_URL || "https://api.olcan.com.br",
  },

  /**
   * The Core OS — Compass app (compass.olcan.com.br).
   * Use for CTA links (Register, Login, Diagnostico CTAs).
   */
  app: {
    base:
      process.env.NEXT_PUBLIC_APP_URL || "https://compass.olcan.com.br",
  },

  /**
   * The Services Layer — MedusaJS marketplace engine.
   * Correct value: marketplace.olcan.com.br (not compass.olcan.com.br).
   */
  marketplace: {
    base:
      process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
      "https://marketplace.olcan.com.br",
  },

  /**
   * CRM Engine — Mautic marketing automation.
   * Used for lead capture form submissions and tracking pixel injection.
   */
  mautic: {
    base:
      process.env.NEXT_PUBLIC_MAUTIC_URL || "https://mautic.olcan.com.br",
    /** n8n webhook that routes inbound leads from the marketing site */
    n8nWebhook:
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
      "https://n8n.olcan.com.br/webhook/site-lead",
  },
} as const;

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
