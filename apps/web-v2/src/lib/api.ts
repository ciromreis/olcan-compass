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
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
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

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken }),
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
  createRoute: (templateId: string) =>
    api.post("/routes", { template_id: templateId }),
  updateMilestone: (routeId: string, milestoneId: string, status: string) =>
    api.patch(`/routes/${routeId}/milestones/${milestoneId}`, { status }),
};

// ── Narratives/Forge API ───────────────────────────────────
export const forgeApi = {
  getDocuments: () => api.get("/narratives"),
  getDocument: (id: string) => api.get(`/narratives/${id}`),
  createDocument: (data: { title: string; document_type: string; content: string }) =>
    api.post("/narratives", data),
  updateDocument: (id: string, content: string) =>
    api.patch(`/narratives/${id}`, { content }),
  analyzeDocument: (id: string) =>
    api.post(`/narratives/${id}/analyze`),
  getVersions: (id: string) => api.get(`/narratives/${id}/versions`),
};

// ── Interviews API ─────────────────────────────────────────
export const interviewsApi = {
  getQuestions: (type?: string) =>
    api.get("/interviews/questions", { params: { type } }),
  createSession: (type: string) =>
    api.post("/interviews/sessions", { interview_type: type }),
  submitAnswer: (sessionId: string, questionId: string, answer: string) =>
    api.post(`/interviews/sessions/${sessionId}/answers`, {
      question_id: questionId,
      answer_text: answer,
    }),
  getSessions: () => api.get("/interviews/sessions"),
  getSession: (id: string) => api.get(`/interviews/sessions/${id}`),
};

// ── Applications API ───────────────────────────────────────
export const applicationsApi = {
  getAll: () => api.get("/applications"),
  get: (id: string) => api.get(`/applications/${id}`),
  create: (data: Record<string, unknown>) => api.post("/applications", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/applications/${id}`, data),
  getOpportunities: () => api.get("/applications/opportunities"),
  getWatchlist: () => api.get("/applications/watchlist"),
};

// ── Sprints API ────────────────────────────────────────────
export const sprintsApi = {
  getAll: () => api.get("/sprints"),
  get: (id: string) => api.get(`/sprints/${id}`),
  create: (templateId: string) =>
    api.post("/sprints", { template_id: templateId }),
  updateTask: (sprintId: string, taskId: string, done: boolean) =>
    api.patch(`/sprints/${sprintId}/tasks/${taskId}`, { is_completed: done }),
  getTemplates: () => api.get("/sprints/templates"),
};

// ── Marketplace API ────────────────────────────────────────
export const marketplaceApi = {
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
};

export default api;
