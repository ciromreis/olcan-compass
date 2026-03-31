import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://olcan-compass-api.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor — attach JWT if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );
          const newToken = data.token?.access_token || data.access_token;
          if (newToken) {
            localStorage.setItem("access_token", newToken);
            if (data.token?.refresh_token) {
              localStorage.setItem("refresh_token", data.token.refresh_token);
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
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
  token: {
    access_token: string;
    refresh_token: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload),

  me: () => api.get<UserProfile>("/auth/me"),

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

// ── Psychology API ─────────────────────────────────────────
export const psychApi = {
  getProfile: () => api.get("/psych/profile"),
  getQuestions: () => api.get("/psych/questions"),
  submitAnswers: (sessionId: string, answers: Record<string, number>) =>
    api.post(`/psych/sessions/${sessionId}/answers`, { answers }),
  createSession: () => api.post("/psych/sessions"),
  getScoreHistory: () => api.get("/psych/score-history"),
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

// ── Narratives/Forge API ───────────────────────────────────
export const forgeApi = {
  getDocuments: () => api.get("/narratives"),
  getDocument: (id: string, params?: Record<string, unknown>) =>
    api.get(`/narratives/${id}`, { params }),
  createDocument: (data: Record<string, unknown>) =>
    api.post("/narratives", data),
  updateDocument: (id: string, data: Record<string, unknown>) =>
    api.patch(`/narratives/${id}`, data),
  updateContent: (id: string, content: string) =>
    api.patch(`/narratives/${id}/content`, { content }),
  deleteDocument: (id: string) =>
    api.delete(`/narratives/${id}`),
  analyzeDocument: (id: string) =>
    api.post(`/narratives/${id}/analyze`),
  getVersions: (id: string) => api.get(`/narratives/${id}/versions`),
  createVersion: (id: string, data: Record<string, unknown>) =>
    api.post(`/narratives/${id}/versions`, data),
  getAnalyses: (id: string) => api.get(`/narratives/${id}/analyses`),
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
};

export default api;
