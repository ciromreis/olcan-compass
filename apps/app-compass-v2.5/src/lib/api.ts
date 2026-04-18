import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const AUTH_ACCESS_TOKEN_KEY = "olcan_access_token";
export const AUTH_REFRESH_TOKEN_KEY = "olcan_refresh_token";
export const LEGACY_ACCESS_TOKEN_KEYS = [AUTH_ACCESS_TOKEN_KEY, "access_token"] as const;
export const LEGACY_REFRESH_TOKEN_KEYS = [AUTH_REFRESH_TOKEN_KEY, "refresh_token"] as const;

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function stripApiSuffix(value: string) {
  return value.endsWith("/api") ? value.slice(0, -4) : value;
}

export function resolveApiOrigin() {
  const configured = process.env.NEXT_PUBLIC_API_URL || "https://olcan-compass-api.onrender.com";
  return stripApiSuffix(stripTrailingSlash(configured));
}

export function resolveApiBaseUrl() {
  return `${resolveApiOrigin()}/api`;
}

/**
 * Base URL for legacy fetch() callers that expect `/api/v1/...` paths.
 * Handles both `NEXT_PUBLIC_API_URL=https://host` and `https://host/api/v1`.
 */
export function resolveApiV1BaseUrl(): string {
  const raw = stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL || "https://olcan-compass-api.onrender.com"
  );
  if (/\/api\/v1(\/|$)/.test(raw)) {
    return raw;
  }
  const origin = stripApiSuffix(raw);
  return `${stripTrailingSlash(origin)}/api/v1`;
}

/** WebSocket base (no trailing slash); connect appends `/${userId}` etc. */
export function resolveWebSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const v1 = resolveApiV1BaseUrl();
  try {
    const u = new URL(v1);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = `${u.pathname.replace(/\/$/, "")}/ws`;
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return "ws://127.0.0.1:8001/api/v1/ws";
  }
}

export function readStoredToken(keys: readonly string[]) {
  if (typeof window === "undefined") return null;
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function readAccessToken() {
  return readStoredToken(LEGACY_ACCESS_TOKEN_KEYS);
}

export function readRefreshToken() {
  return readStoredToken(LEGACY_REFRESH_TOKEN_KEYS);
}

export function persistAuthTokens(accessToken: string, refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem("access_token", accessToken);
  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    window.localStorage.setItem("refresh_token", refreshToken);
  }
}

export function clearPersistedAuthTokens() {
  if (typeof window === "undefined") return;
  for (const key of [...LEGACY_ACCESS_TOKEN_KEYS, ...LEGACY_REFRESH_TOKEN_KEYS]) {
    window.localStorage.removeItem(key);
  }
}

export const API_BASE_URL = resolveApiOrigin();

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor — attach JWT if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = readRefreshToken();
        if (refreshToken) {
          const { data } = await axios.post(
            `${resolveApiBaseUrl()}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );
          const newToken = data.token?.access_token || data.access_token;
          if (newToken) {
            persistAuthTokens(newToken, data.token?.refresh_token || data.refresh_token);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        clearPersistedAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API ───────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  role: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  /** When true, API grants at least Pro-level entitlements (see `effectiveUserPlan`). */
  is_premium?: boolean;
  is_verified?: boolean;
  language?: string;
  timezone?: string;
  economics?: {
    daily_cost: number;
    monthly_cost: number;
    yearly_cost: number;
    cumulative_cost: number;
    days_since_start: number;
    currency: string;
  };
  momentum?: {
    momentum_score: number;
    last_activity_days: number;
  };
  psychology?: {
    dominant_archetype: string;
    evolution_stage: number;
    kinetic_energy_level: number;
    risk_profile: string;
    psychological_state: string;
  };
}

/** Body for `PUT /auth/me` (matches backend `UpdateProfileRequest`). */
export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string;
  language?: string;
  timezone?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload),

  me: () => api.get<UserProfile>("/auth/me"),

  updateMe: (payload: UpdateProfilePayload) =>
    api.put<UserProfile>("/auth/me", payload),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, new_password: password }),

  verifyEmail: (token: string) =>
    api.post("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    api.post("/auth/resend-verification", { email }),

  requestOrganizationAccess: (payload: { organization_name: string; requested_role: string }) =>
    api.post("/auth/request-organization-access", payload),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }),
};

/** Product analytics events (`POST /analytics/events`). */
export interface AnalyticsEventInput {
  event_name: string;
  properties?: Record<string, unknown>;
  occurred_at?: string;
  session_id?: string;
  client_source?: string;
  app_release?: string;
}

export interface AnalyticsEventBatchResponse {
  inserted: number;
}

export interface ExperimentVariantApiResponse {
  experiment_slug: string;
  variant: string;
  experiment_id: string;
}

export const analyticsApi = {
  ingestEvents: (events: AnalyticsEventInput[]) =>
    api.post<AnalyticsEventBatchResponse>("/analytics/events", { events }),

  listAttributes: (namespace?: string) =>
    api.get<{ items: { namespace: string; key: string; value: string; updated_at: string }[] }>(
      "/analytics/me/attributes",
      { params: namespace ? { namespace } : {} },
    ),

  upsertAttribute: (payload: { namespace?: string; key: string; value: string }) =>
    api.put<{ namespace: string; key: string; value: string; updated_at: string }>(
      "/analytics/me/attributes",
      {
        namespace: payload.namespace ?? "analytics",
        key: payload.key,
        value: payload.value,
      },
    ),

  getExperimentVariant: (slug: string) =>
    api.get<ExperimentVariantApiResponse>(`/analytics/experiments/${encodeURIComponent(slug)}/variant`),
};

// ── Psychology API ─────────────────────────────────────────
export const psychApi = {
  getProfile: () => api.get("/psych/profile"),
  startAssessment: () => api.post("/psych/assessment/start"),
  submitAnswer: (sessionId: string, answer: Record<string, unknown>) =>
    api.post("/psych/assessment/answer", { session_id: sessionId, ...answer }),
  getQuestion: (sessionId: string) =>
    api.get(`/psych/assessment/${sessionId}/question`),
  getResult: (sessionId: string) =>
    api.get(`/psych/assessment/${sessionId}/result`),
  getScoreHistory: () => api.get("/psych/history"),
};

// ── Routes API ─────────────────────────────────────────────
export const routesApi = {
  getTemplates: () => api.get("/routes/templates"),
  getUserRoutes: () => api.get("/routes"),
  getRoute: (id: string) => api.get(`/routes/${id}`),
  createRoute: (data: Record<string, unknown>) =>
    api.post("/routes", data),
  updateRoute: (id: string, data: Record<string, unknown>) =>
    api.put(`/routes/${id}`, data),
  deleteRoute: (id: string) => api.delete(`/routes/${id}`),
  updateMilestone: (milestoneId: string, data: Record<string, unknown>) =>
    api.patch(`/routes/milestones/${milestoneId}`, data),
};

// ── Forge / Documents API ─────────────────────────────────
export const forgeApi = {
  getDocuments: () => api.get("/v1/documents"),
  getDocument: (id: string, params?: Record<string, unknown>) =>
    api.get(`/v1/documents/${id}`, { params }),
  createDocument: (data: Record<string, unknown>) =>
    api.post("/v1/documents", data),
  updateDocument: (id: string, data: Record<string, unknown>) =>
    api.put(`/v1/documents/${id}`, data),
  updateContent: (id: string, content: string) =>
    api.put(`/v1/documents/${id}`, { content }),
  deleteDocument: (id: string) =>
    api.delete(`/v1/documents/${id}`),
  analyzeDocument: (id: string) =>
    api.post(`/v1/documents/${id}/analyze`),
  polishDocument: (id: string) =>
    api.post(`/v1/documents/${id}/polish`),
  getVersions: (id: string) => api.get(`/v1/documents/${id}/versions`),
  createVersion: (id: string, data: Record<string, unknown>) =>
    api.post(`/v1/documents/${id}/versions`, data),
  atsAnalyzeDocument: (id: string, data: { job_description?: string; target_keywords?: string[] }) =>
    api.post(`/v1/documents/${id}/ats-analyze`, data),
  getDossierData: () =>
    api.get("/v1/documents/dossier"),
};

// ── Interviews API ─────────────────────────────────────────
export const interviewsApi = {
  getQuestions: (params?: Record<string, unknown>) =>
    api.get("/interviews/questions", { params }),
  createSession: (data: Record<string, unknown>) =>
    api.post("/interviews/sessions", data),
  startSession: (sessionId: string, data: Record<string, unknown>) =>
    api.post(`/interviews/sessions/${sessionId}/start`, data),
  updateSession: (sessionId: string, data: Record<string, unknown>) =>
    api.patch(`/interviews/sessions/${sessionId}`, data),
  completeSession: (sessionId: string) =>
    api.post(`/interviews/sessions/${sessionId}/complete`),
  submitAnswer: (sessionId: string, data: Record<string, unknown>) =>
    api.post(`/interviews/sessions/${sessionId}/answers`, data),
  analyzeAnswer: (answerId: string, data: Record<string, unknown> = {}) =>
    api.post(`/interviews/answers/${answerId}/analyze`, data),
  getAnswers: (params?: Record<string, unknown>) =>
    api.get("/interviews/answers", { params }),
  getSessions: () => api.get("/interviews/sessions"),
  getSession: (id: string) => api.get(`/interviews/sessions/${id}`),
  getStats: () => api.get("/interviews/stats"),
};

// ── Aura / Presence API ───────────────────────────────────
export const auraApi = {
  getAll: () => api.get("/v1/companions"),
  getById: (id: string) => api.get(`/v1/companions/${id}`),
  create: (data: { name: string; archetype: string }) =>
    api.post("/v1/companions", data),
  care: (id: string, activityType: string) =>
    api.post(`/v1/companions/${id}/care`, { activity_type: activityType }),
  getActivities: (id: string, limit = 50) =>
    api.get(`/v1/companions/${id}/activities`, { params: { limit } }),
  checkEvolution: (id: string) =>
    api.get(`/v1/companions/${id}/evolution/check`),
  evolve: (id: string, payload?: Record<string, unknown>) =>
    api.post(`/v1/companions/${id}/evolution`, payload),
};

// ── Applications API ───────────────────────────────────────
export const applicationsApi = {
  getAll: () => api.get("/applications"),
  get: (id: string) => api.get(`/applications/${id}`),
  create: (data: Record<string, unknown>) => api.post("/applications", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/applications/${id}`, data),
  submit: (id: string, data: Record<string, unknown> = {}) =>
    api.post(`/applications/${id}/submit`, data),
  remove: (id: string) => api.delete(`/applications/${id}`),
  getOpportunities: () => api.get("/applications/opportunities"),
  getOpportunity: (id: string) => api.get(`/applications/opportunities/${id}`),
  createOpportunity: (data: Record<string, unknown>) =>
    api.post("/applications/opportunities", data),
  updateOpportunity: (id: string, data: Record<string, unknown>) =>
    api.patch(`/applications/opportunities/${id}`, data),
  getWatchlist: () => api.get("/applications/watchlist"),
  addToWatchlist: (data: Record<string, unknown>) =>
    api.post("/applications/watchlist", data),
  removeFromWatchlist: (id: string) => api.delete(`/applications/watchlist/${id}`),
  getStats: () => api.get("/applications/stats/dashboard"),
  getDocuments: (applicationId: string) =>
    api.get(`/applications/${applicationId}/documents`),
  updateDocument: (applicationId: string, documentId: string, data: Record<string, unknown>) =>
    api.patch(`/applications/${applicationId}/documents/${documentId}`, data),
};

// ── Sprints API ────────────────────────────────────────────
export const sprintsApi = {
  getAll: () => api.get("/sprints"),
  get: (id: string) => api.get(`/sprints/${id}`),
  create: (data: Record<string, unknown>) => api.post("/sprints", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/sprints/${id}`, data),
  remove: (id: string) => api.delete(`/sprints/${id}`),
  start: (id: string, data: Record<string, unknown> = {}) =>
    api.post(`/sprints/${id}/start`, data),
  createTask: (sprintId: string, data: Record<string, unknown>) =>
    api.post(`/sprints/${sprintId}/tasks`, data),
  /** Bulk-create tasks in a single request — avoids Neon connection exhaustion */
  createTasksBulk: (sprintId: string, tasks: Record<string, unknown>[]) =>
    api.post(`/sprints/${sprintId}/tasks/bulk`, { tasks }),
  updateTask: (sprintId: string, taskId: string, data: Record<string, unknown>) =>
    api.patch(`/sprints/${sprintId}/tasks/${taskId}`, data),
  completeTask: (sprintId: string, taskId: string, data: Record<string, unknown> = {}) =>
    api.post(`/sprints/${sprintId}/tasks/${taskId}/complete`, data),
  getTemplates: () => api.get("/sprints/templates"),
};

// ── Organizations API ──────────────────────────────────────
export const orgApi = {
  getMe: () => api.get("/org/me"),
  updateMe: (data: Record<string, unknown>) => api.patch("/org/me", data),
  getMembers: () => api.get("/org/members"),
  inviteMember: (data: { email: string; role: string }) =>
    api.post("/org/invite", data),
  removeMember: (memberId: string) =>
    api.delete(`/org/members/${memberId}`),
  updateMember: (memberId: string, data: { role?: string; status?: string }) =>
    api.patch(`/org/members/${memberId}`, data),
  getStats: () => api.get("/org/stats"),
};

// ── Marketplace API ────────────────────────────────────────
export const marketplaceApi = {
  applyAsProvider: (data: Record<string, unknown>) =>
    api.post("/marketplace/provider/apply", data),
  getProviders: (params?: Record<string, string>) =>
    api.get("/marketplace/providers", { params }),
  getProvider: (id: string) => api.get(`/marketplace/providers/${id}`),
  getServices: (providerId: string) =>
    api.get(`/marketplace/providers/${providerId}/services`),
  createBooking: (data: Record<string, unknown>) =>
    api.post("/marketplace/bookings", data),
  getBookings: () => api.get("/marketplace/bookings"),
  getBooking: (id: string) => api.get(`/marketplace/bookings/${id}`),
  getConversations: () => api.get("/marketplace/conversations"),
  createConversation: (providerId: string) =>
    api.post("/marketplace/conversations", { provider_id: providerId }),
  getMessages: (conversationId: string) =>
    api.get(`/marketplace/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/marketplace/conversations/${conversationId}/messages`, { content }),
  createReview: (bookingId: string, data: { rating: number; comment: string }) =>
    api.post(`/marketplace/bookings/${bookingId}/review`, data),

  // Provider Management
  getProfileMe: () => api.get("/marketplace/providers/me"),
  updateProfileMe: (data: Record<string, unknown>) =>
    api.patch("/marketplace/providers/me", data),
  getServicesMe: () => api.get("/marketplace/services/me"),
  createService: (data: Record<string, unknown>) =>
    api.post("/marketplace/services", data),
  updateService: (id: string, data: Record<string, unknown>) =>
    api.patch(`/marketplace/services/${id}`, data),
  deleteService: (id: string) =>
    api.delete(`/marketplace/services/${id}`),
  updateBooking: (id: string, data: { status: string; reason?: string; summary?: string }) =>
    api.patch(`/marketplace/bookings/${id}`, data),

  // Stripe Connect Onboarding
  startConnectOnboarding: () =>
    api.post("/marketplace/providers/onboard"),
  getConnectOnboardingStatus: () =>
    api.get("/marketplace/providers/onboard/status"),
};

export default api;
