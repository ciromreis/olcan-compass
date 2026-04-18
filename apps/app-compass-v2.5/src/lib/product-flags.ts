/**
 * Product surface flags — env-driven toggles for unfinished or experimental areas.
 * Use `NEXT_PUBLIC_*` so values are available in client components.
 *
 * Defaults favor honesty: stub experiences stay off until explicitly enabled.
 */
export function parsePublicBooleanEnv(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === "") return defaultValue;
  return raw === "1" || raw.toLowerCase() === "true";
}

function flagFromEnv(key: string, defaultValue: boolean): boolean {
  return parsePublicBooleanEnv(process.env[key], defaultValue);
}

export const productSurface = {
  /** Guild list/create — keep dark until the social loop is launch-ready. */
  guilds: flagFromEnv("NEXT_PUBLIC_FEATURE_GUILDS", false),
  /** Aura quests / achievements full hubs — keep dark until persistence is release-ready. */
  gamificationHub: flagFromEnv("NEXT_PUBLIC_FEATURE_GAMIFICATION_HUB", false),
  /** Internal behavioral demo (`/nudge-engine`). */
  nudgeEngine: flagFromEnv("NEXT_PUBLIC_FEATURE_NUDGE_ENGINE", false),
  /** Experimental writing lab UI (`/forge-lab/[id]`) — separate from main Forge. */
  forgeLab: flagFromEnv("NEXT_PUBLIC_FEATURE_FORGE_LAB", false),
} as const;

export type ProductSurfaceKey = keyof typeof productSurface;
