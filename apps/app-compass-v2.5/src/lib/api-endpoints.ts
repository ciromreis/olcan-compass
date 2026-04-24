export const API_ENDPOINTS = {
  api: {
    base: process.env.NEXT_PUBLIC_API_URL || "https://api.olcan.com.br",
    v1: process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/v1` 
      : "https://api.olcan.com.br/v1",
  },
  cms: {
    base: process.env.NEXT_PUBLIC_CMS_URL || "https://api.olcan.com.br",
  },
  storefront: {
    base: process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://api.olcan.com.br",
  },
  zenith: {
    base: process.env.NEXT_PUBLIC_ZENITH_API_URL || "https://api.olcan.com.br",
  },
} as const;

export const API_ROUTES = {
  auth: {
    register: `${API_ENDPOINTS.api.base}/auth/register`,
    login: `${API_ENDPOINTS.api.base}/auth/login`,
    me: `${API_ENDPOINTS.api.base}/auth/me`,
    refresh: `${API_ENDPOINTS.api.base}/auth/refresh`,
  },
  documents: {
    list: `${API_ENDPOINTS.api.v1}/documents`,
    create: `${API_ENDPOINTS.api.v1}/documents`,
    polish: (id: string) => `${API_ENDPOINTS.api.v1}/documents/${id}/polish`,
    analyze: (id: string) => `${API_ENDPOINTS.api.v1}/documents/${id}/analyze`,
  },
  dossiers: {
    list: `${API_ENDPOINTS.api.v1}/dossiers`,
    create: `${API_ENDPOINTS.api.v1}/dossiers`,
    get: (id: string) => `${API_ENDPOINTS.api.v1}/dossiers/${id}`,
    evaluate: (id: string) => `${API_ENDPOINTS.api.v1}/dossiers/${id}/evaluate`,
  },
  routes: {
    list: `${API_ENDPOINTS.api.base}/routes`,
    create: `${API_ENDPOINTS.api.base}/routes`,
  },
  tasks: {
    list: `${API_ENDPOINTS.api.base}/api/tasks`,
    create: `${API_ENDPOINTS.api.base}/api/tasks`,
    complete: (id: string) => `${API_ENDPOINTS.api.base}/api/tasks/${id}/complete`,
  },
  profiles: {
    base: `${API_ENDPOINTS.api.v1}/users`,
    byId: (userId: string) => `${API_ENDPOINTS.api.v1}/users/${userId}`,
  },
} as const;

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";

export function getApiUrl(service: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[service].base;
}