/**
 * Server-side product analytics (`POST /api/analytics/events`).
 * Complements local `monitor` (gtag/Sentry hooks) with durable rows for DS.
 */

import { analyticsApi, type AnalyticsEventInput } from "@/lib/api";
import { readAccessToken } from "@/lib/api";

const SESSION_KEY = "olcan_analytics_session";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/** One `page_view` row per navigation when the user has a JWT. Fails silently. */
export async function trackProductPageView(pathname: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return;
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "false") return;
  if (!readAccessToken()) return;

  const payload: AnalyticsEventInput = {
    event_name: "page_view",
    properties: { path: pathname },
    session_id: getAnalyticsSessionId(),
    client_source: "web",
  };
  const ver = process.env.NEXT_PUBLIC_APP_VERSION;
  if (ver) payload.app_release = ver;

  try {
    await analyticsApi.ingestEvents([payload]);
  } catch {
    // Network / 401 / schema mismatch — do not affect UX
  }
}
