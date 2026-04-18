/**
 * API Client for Olcan Compass v2.5
 * Connects frontend to real backend API
 */

import {
  AUTH_REFRESH_TOKEN_KEY,
  clearPersistedAuthTokens,
  persistAuthTokens,
  readAccessToken,
  resolveApiBaseUrl,
  type UpdateProfilePayload,
} from "@/lib/api";

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_STATE_COOKIE = 'olcan_session_state';
const AUTH_HINT_COOKIE = 'olcan_known_user';

const AUTH_TOKEN_COOKIE = 'olcan_token';

function writeAuthCookies(isAuthenticated: boolean, token?: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = isAuthenticated ? '2592000' : '0';
  const sameSite = 'SameSite=Lax';
  const path = 'Path=/';
  
  // Determine domain for SSO (e.g., .olcan.com.br)
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const domainParts = hostname.split('.');
  const rootDomain = isLocalhost || domainParts.length < 2 
    ? '' 
    : `; Domain=.${domainParts.slice(-2).join('.')}`;

  document.cookie = `${AUTH_STATE_COOKIE}=${isAuthenticated ? 'authenticated' : 'guest'}; Max-Age=${maxAge}; ${path}; ${sameSite}${rootDomain}`;
  document.cookie = `${AUTH_HINT_COOKIE}=${isAuthenticated ? '1' : '0'}; Max-Age=${maxAge}; ${path}; ${sameSite}${rootDomain}`;
  
  if (isAuthenticated && token) {
    // Store token in cookie for cross-subdomain API access / SSR
    document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=${maxAge}; ${path}; ${sameSite}${rootDomain}`;
  } else {
    document.cookie = `${AUTH_TOKEN_COOKIE}=; Max-Age=0; ${path}; ${sameSite}${rootDomain}`;
  }
}

// Types
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

/** Legacy user shape used by some older endpoints (`/users/profile`, companions). */
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  xp: number;
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
}

/** Response from `GET/PUT /auth/me` (matches API `UserProfileResponse`). */
export interface AuthMeResponse {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  language: string;
  timezone: string;
  role: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
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

// --- Admin Analytics Types ---

export interface SuccessMetric {
  current: number;
  baseline: number | null;
  improvement: number | null;
  target: number;
  target_met: boolean;
}

export interface AdminSuccessMetricsResponse {
  credential_conversion_rate: SuccessMetric;
  temporal_churn_reduction: SuccessMetric;
  opportunity_cost_conversion: SuccessMetric;
  marketplace_booking_value: SuccessMetric;
  decision_paralysis_reduction: SuccessMetric;
  overall_status: string;
}

export interface AdminCredentialsDashboardResponse {
  total_issued: number;
  active_count: number;
  expired_count: number;
  revoked_count: number;
  verification_clicks: number;
  click_through_rate: number;
  conversion_attribution: Record<string, unknown>;
  by_credential_type: Record<string, number>;
}

export interface AuthRegisterApiResponse {
  user_id: string;
  email: string;
  role: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface CommerceContextResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  catalog_url: string;
  app_catalog_url: string;
  auth_mode: string;
  checkout_mode: string;
  source: string;
}

export interface CheckoutIntentResponse {
  checkout_url: string;
  catalog_url: string;
  product: unknown;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  auth_mode: string;
  source: string;
}

function normalizeCommerceProduct(product: unknown): Record<string, unknown> {
  const p = (product ?? {}) as Record<string, unknown>;
  if (!p) return {};

  return {
    id: p.id,
    seller_id: p.seller_id || 'vendor_olcan_official',
    name: p.name || p.title,
    title: p.title || p.name,
    description: p.description || p.short_description || '',
    short_description: p.short_description || p.description || '',
    product_type: p.product_type || 'digital',
    category: p.category || 'Marketplace',
    status: p.status || 'active',
    price: p.price ?? (p as Record<string, unknown>).price_amount ?? 0,
    compare_at_price: p.compare_at_price ?? (p as Record<string, unknown>).compare_at_price_amount ?? undefined,
    currency: p.currency || (p as Record<string, unknown>).price_currency || 'BRL',
    slug: p.slug || p.handle,
    handle: p.handle || p.slug,
    images: p.images || (p.thumbnail ? [p.thumbnail] : []),
    thumbnail: p.thumbnail || (p.images as unknown[] | undefined)?.[0] || null,
    tags: p.tags || [],
    rating: p.rating ?? 5,
    review_count: p.review_count ?? 0,
    sales_count: p.sales_count ?? 0,
    view_count: p.view_count ?? 0,
    is_featured: Boolean(p.is_featured),
    is_olcan_official: Boolean(p.is_olcan_official),
    is_bestseller: Boolean(p.is_bestseller),
    is_new: Boolean(p.is_new),
    requires_shipping: Boolean(p.requires_shipping),
    stock_quantity: p.stock_quantity ?? 999,
    created_at: p.created_at || new Date().toISOString(),
    checkout_mode: p.checkout_mode,
    checkout_url: p.checkout_url,
    catalog_url: p.catalog_url,
    price_display: p.price_display,
    compare_at_price_display: p.compare_at_price_display,
  };
}

// API Client Class
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || resolveApiBaseUrl();
    if (typeof window !== 'undefined') {
      this.token = readAccessToken();
      const tokenCookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith(`${AUTH_TOKEN_COOKIE}=`));

      if (!this.token && tokenCookie) {
        this.token = tokenCookie.split('=')[1]?.trim() || null;
      }

      if (this.token) {
        persistAuthTokens(this.token);
        writeAuthCookies(true, this.token);
      }
    }
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      persistAuthTokens(token);
      writeAuthCookies(true, token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      clearPersistedAuthTokens();
      writeAuthCookies(false);
    }
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<AuthRegisterApiResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthRegisterApiResponse>(response);
  }

  async login(data: LoginData): Promise<TokenResponse> {
    // OAuth2 password flow requires form data
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const tokenData = await this.handleResponse<TokenResponse>(response);
    
    // Store tokens
    this.setToken(tokenData.access_token);
    if (tokenData.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokenData.refresh_token);
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }

    return tokenData;
  }

  async getCurrentUser(): Promise<AuthMeResponse> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<AuthMeResponse>(response);
  }

  async updateMyProfile(data: UpdateProfilePayload): Promise<AuthMeResponse> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthMeResponse>(response);
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } finally {
      this.clearToken();
    }
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<User>(response);
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  // Aura endpoints
  async getAuras(): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/companions/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getAura(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async createAura(data: { name: string; aura_type: string }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        name: data.name,
        archetype: data.aura_type,
      })
    });
    return this.handleResponse<unknown>(response);
  }

  async feedAura(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/care`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ activity_type: 'feed' }),
    });
    return this.handleResponse<unknown>(response);
  }

  async trainAura(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/care`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ activity_type: 'train' }),
    });
    return this.handleResponse<unknown>(response);
  }

  async playWithAura(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/care`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ activity_type: 'play' }),
    });
    return this.handleResponse<unknown>(response);
  }

  async restAura(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/care`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ activity_type: 'rest' }),
    });
    return this.handleResponse<unknown>(response);
  }

  async getAuraActivities(id: number, limit: number = 10): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/activities?limit=${limit}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  // Marketplace endpoints
  async getProviders(params?: { category?: string; search?: string }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}/marketplace/providers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getProvider(id: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/providers/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async contactProvider(id: number, message: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/providers/${id}/contact?message=${encodeURIComponent(message)}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async createProvider(data: {
    name: string;
    bio: string;
    specialties: string[];
    languages: string[];
    country: string;
    timezone: string;
  }): Promise<unknown> {
    const queryParams = new URLSearchParams();
    queryParams.append('name', data.name);
    queryParams.append('bio', data.bio);
    queryParams.append('country', data.country);
    queryParams.append('timezone', data.timezone);
    data.specialties.forEach(s => queryParams.append('specialties', s));
    data.languages.forEach(l => queryParams.append('languages', l));

    const response = await fetch(`${this.baseUrl}/marketplace/providers?${queryParams.toString()}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getConversations(): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/marketplace/conversations`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getMessages(conversationId: number): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/marketplace/conversations/${conversationId}/messages`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  // Leaderboard endpoints
  async getTopAuras(limit: number = 10): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/companions/top?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getTopUsers(limit: number = 10): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/users/top?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getRecentActivities(limit: number = 20): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/activities/recent?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getGlobalStats(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/leaderboard/stats/global`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown>(response);
  }

  async getUserStats(userId: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/leaderboard/stats/user/${userId}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown>(response);
  }

  async getMyRank(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/leaderboard/my-rank`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // Document endpoints (Narrative Forge)
  async createDocument(data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async listDocuments(params?: { skip?: number; limit?: number; document_type?: string; status?: string; search?: string }): Promise<unknown> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.document_type) queryParams.append('document_type', params.document_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/documents?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getDocument(documentId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async updateDocument(documentId: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  async polishDocument(documentId: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async getPolishHistory(documentId: string): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async submitPolishFeedback(documentId: string, polishId: string, feedback: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish/${polishId}/feedback`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(feedback),
    });
    return this.handleResponse<unknown>(response);
  }

  async updateCharacterCount(documentId: string, content: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/count`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse<unknown>(response);
  }

  async getVersionHistory(documentId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/versions`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async trackFocusSession(documentId: string, durationSeconds: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/focus`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ document_id: documentId, duration_seconds: durationSeconds }),
    });
    return this.handleResponse<unknown>(response);
  }

  async getFocusStats(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/stats/focus`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getDocumentStats(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/stats`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async listDocumentTemplates(category?: string): Promise<unknown> {
    const queryParams = category ? `?category=${category}` : '';
    const response = await fetch(`${this.baseUrl}/documents/templates${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown>(response);
  }

  async createFromTemplate(data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/documents/from-template`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  // ============================================================================
  // E-COMMERCE MARKETPLACE ENDPOINTS
  // ============================================================================

  // Product endpoints
  async getProducts(params?: {
    product_type?: string;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    tags?: string[];
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.product_type) queryParams.append('product_type', params.product_type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/products?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getPublicProducts(params?: {
    product_type?: string;
    category?: string;
    is_olcan_official?: boolean;
    is_featured?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
    tags?: string[];
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.product_type) queryParams.append('product_type', params.product_type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_olcan_official !== undefined) queryParams.append('is_olcan_official', params.is_olcan_official.toString());
    if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/commerce/public/products?${queryParams}`, {
      headers: this.getHeaders(false),
    });
    const data = await this.handleResponse<{ items: unknown[] }>(response);
    return (data.items || []).map(normalizeCommerceProduct);
  }

  async getOlcanOfficialProducts(category?: string, limit: number = 50): Promise<unknown[]> {
    const products = await this.getPublicProducts({ limit });
    return products.filter((product) => {
      const p = product as Record<string, unknown>;
      if (!p.is_olcan_official) return false;
      if (!category) return true;
      return p.category === category;
    });
  }

  async getFeaturedProducts(limit: number = 10): Promise<unknown[]> {
    const products = await this.getPublicProducts({ limit });
    return products.filter((product) => (product as Record<string, unknown>).is_featured).slice(0, limit);
  }

  async getProduct(productId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getProductBySlug(slug: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/commerce/public/products/${slug}`, {
      headers: this.getHeaders(false),
    });
    const data = await this.handleResponse<{ item: unknown }>(response);
    return normalizeCommerceProduct(data.item);
  }

  async getCommerceContext(): Promise<CommerceContextResponse> {
    const response = await fetch(`${this.baseUrl}/commerce/me/context`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<CommerceContextResponse>(response);
  }

  async createCheckoutIntent(
    handle: string,
    origin: string = 'compass-product-page'
  ): Promise<CheckoutIntentResponse> {
    const response = await fetch(`${this.baseUrl}/commerce/me/checkout-intents`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ handle, origin }),
    });
    return this.handleResponse<CheckoutIntentResponse>(response);
  }

  async createProduct(data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/products`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async updateProduct(productId: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async publishProduct(productId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}/publish`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // Shopping cart endpoints
  async getCart(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async addToCart(data: {
    product_id: string;
    quantity?: number;
    booking_date?: string;
    booking_notes?: string;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse<unknown>(response);
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to remove item from cart: ${response.statusText}`);
    }
  }

  async clearCart(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }
  }

  // Order endpoints
  async createOrder(data: {
    shipping_address?: Record<string, unknown>;
    billing_address?: Record<string, unknown>;
    payment_method?: string;
    customer_notes?: string;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async getOrders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/orders?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getOrder(orderId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders/${orderId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // Review endpoints
  async createReview(productId: string, data: {
    rating: number;
    title?: string;
    comment?: string;
    order_id?: string;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  // Service provider endpoints
  async createServiceProvider(data: {
    business_name: string;
    bio: string;
    specializations?: string[];
    languages?: string[];
    certifications?: { name: string; issuer?: string; year?: number }[];
    years_experience?: number;
    hourly_rate?: number;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/marketplace/service-providers`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async getServiceProviders(params?: {
    specializations?: string[];
    is_verified?: boolean;
    min_rating?: number;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.specializations) params.specializations.forEach(s => queryParams.append('specializations', s));
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
    if (params?.min_rating !== undefined) queryParams.append('min_rating', params.min_rating.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/service-providers?${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<unknown[]>(response);
  }

  // Interview endpoints
  async getInterviews(params?: {
    interview_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.interview_type) queryParams.append('interview_type', params.interview_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/interviews?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async createInterview(data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/interviews`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async getInterview(interviewId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async startInterview(interviewId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/start`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async submitInterviewResponse(interviewId: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/responses`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async completeInterview(interviewId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // Guild endpoints
  async getGuilds(params?: {
    search?: string;
    is_public?: boolean;
    tags?: string[];
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/guilds?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async createGuild(data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/guilds`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<unknown>(response);
  }

  async getGuild(guildId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async joinGuild(guildId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/join`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async leaveGuild(guildId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getGuildMembers(guildId: string): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/members`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getGuildEvents(guildId: string): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/events`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async getMyGuilds(): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/guilds/my/memberships`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  // Social endpoints
  async getActivityFeed(params?: {
    activity_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    const queryParams = new URLSearchParams();
    if (params?.activity_type) queryParams.append('activity_type', params.activity_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/social/activities?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown[]>(response);
  }

  async likeActivity(activityId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/social/activities/${activityId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async commentOnActivity(activityId: string, comment: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/social/activities/${activityId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ comment }),
    });
    return this.handleResponse<unknown>(response);
  }

  async followUser(userId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/social/follow/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async unfollowUser(userId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/social/unfollow/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/social/notifications/unread/count`, {
      headers: this.getHeaders(true),
    });
    const data = await this.handleResponse<{ count?: number }>(response);
    return data.count || 0;
  }

  // -----------------------------------------------------------------------
  // Psychology / OIOS Quiz
  // -----------------------------------------------------------------------

  async startPsychAssessment(): Promise<{ session_id: string; total_questions: number; current_question_index: number }> {
    const response = await fetch(`${this.baseUrl}/psych/assessment/start`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({}),
    });
    return this.handleResponse(response);
  }

  async getPsychQuestion(sessionId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/psych/assessment/${sessionId}/question`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async submitPsychAnswer(data: {
    session_id: string;
    question_id: string;
    answer_value: string;
    answer_text?: string;
  }): Promise<{ next_index: number; is_complete: boolean }> {
    const response = await fetch(`${this.baseUrl}/psych/assessment/answer`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getPsychResult(sessionId: string): Promise<{
    session_id: string;
    dominant_archetype: string | null;
    primary_fear_cluster: string | null;
    mobility_state: string | null;
    scores_snapshot: Record<string, number>;
  }> {
    const response = await fetch(`${this.baseUrl}/psych/assessment/${sessionId}/result`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // -----------------------------------------------------------------------
  // Narrative Forge — AI Polish + Credits
  // -----------------------------------------------------------------------

  async getForgeCredits(): Promise<{ forge_credits: number }> {
    const response = await fetch(`${this.baseUrl}/forge/credits`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ forge_credits: number }>(response);
  }

  async forgePolishDirect(data: {
    content: string;
    methodology: 'STAR' | 'CAR' | 'free';
    target_word_count: number;
  }): Promise<{
    polished_content: string;
    changes_summary: string;
    word_count_before: number;
    word_count_after: number;
    methodology_applied: string;
    credits_remaining: number;
  }> {
    const response = await fetch(`${this.baseUrl}/forge/polish`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async forgePolish(
    narrativeId: string,
    data: { methodology: 'STAR' | 'CAR' | 'free'; target_word_count: number }
  ): Promise<{
    narrative_id: string;
    new_version_id: string;
    polished_content: string;
    changes_summary: string;
    word_count_before: number;
    word_count_after: number;
    methodology_applied: string;
    credits_remaining: number;
  }> {
    const response = await fetch(`${this.baseUrl}/forge/${narrativeId}/polish`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // -----------------------------------------------------------------------
  // Billing — Forge credit packs
  // -----------------------------------------------------------------------

  async createBillingCheckout(
    pack: 'starter' | 'pro'
  ): Promise<{ checkout_url: string; session_id: string; credits: number; amount_brl: string }> {
    const response = await fetch(`${this.baseUrl}/billing/checkout`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ pack }),
    });
    return this.handleResponse(response);
  }

  async getBillingStatus(): Promise<{
    forge_credits: number;
    is_premium: boolean;
    subscription_plan: string;
    subscription_status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/billing/status`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createSubscriptionCheckout(
    plan: 'pro' | 'premium'
  ): Promise<{ checkout_url: string; session_id: string; plan: string; price_brl: string }> {
    const response = await fetch(`${this.baseUrl}/billing/subscription-checkout`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ plan }),
    });
    return this.handleResponse(response);
  }

  // ── Task Management ───────────────────────────────────────

  async fetchJson<T>(method: string, path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      }
      const qsStr = qs.toString();
      if (qsStr) url += `?${qsStr}`;
    }
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(true),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // Admin Economics endpoints
  async getAdminSuccessMetrics(): Promise<AdminSuccessMetricsResponse> {
    const response = await fetch(`${this.baseUrl}/admin/economics-intelligence/success-metrics`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<AdminSuccessMetricsResponse>(response);
  }

  async getAdminCredentialsStats(params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<AdminCredentialsDashboardResponse> {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.append('start_date', params.start_date);
    if (params?.end_date) qs.append('end_date', params.end_date);
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.page_size) qs.append('page_size', params.page_size.toString());

    const response = await fetch(`${this.baseUrl}/admin/economics-intelligence/credentials${qs.toString() ? '?' + qs.toString() : ''}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<AdminCredentialsDashboardResponse>(response);
  }

  async getAdminOpportunityCostStats(params?: { start_date?: string; end_date?: string }): Promise<unknown> {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.append('start_date', params.start_date);
    if (params?.end_date) qs.append('end_date', params.end_date);

    const response = await fetch(`${this.baseUrl}/admin/economics-intelligence/opportunity-cost${qs.toString() ? '?' + qs.toString() : ''}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getAdminMarketplaceStats(params?: { start_date?: string; end_date?: string }): Promise<unknown> {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.append('start_date', params.start_date);
    if (params?.end_date) qs.append('end_date', params.end_date);

    const response = await fetch(`${this.baseUrl}/admin/economics-intelligence/marketplace${qs.toString() ? '?' + qs.toString() : ''}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async getAdminScenarioStats(params?: { start_date?: string; end_date?: string }): Promise<unknown> {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.append('start_date', params.start_date);
    if (params?.end_date) qs.append('end_date', params.end_date);

    const response = await fetch(`${this.baseUrl}/admin/economics-intelligence/scenarios${qs.toString() ? '?' + qs.toString() : ''}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // === ECONOMICS CREDENTIALS ===

  async getEconomicsCredentials(includeExpired = false): Promise<unknown> {
    const response = await fetch(
      `${this.baseUrl}/credentials/me${includeExpired ? '?include_expired=true' : ''}`,
      { headers: this.getHeaders(true) },
    );
    return this.handleResponse<unknown>(response);
  }

  // === NOTIFICATIONS ===

  async getNotifications(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/notifications`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async markNotificationRead(notificationId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  async markAllNotificationsRead(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // === LEADERBOARD ===

  async getLeaderboard(limit = 20): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/gamification/leaderboard?limit=${limit}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }

  // === SOCIAL ACTIVITY FEED ===

  async getSocialPosts(params?: { skip?: number; limit?: number }): Promise<unknown> {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.append('skip', String(params.skip));
    if (params?.limit !== undefined) qs.append('limit', String(params.limit));
    const response = await fetch(
      `${this.baseUrl}/social/posts${qs.toString() ? '?' + qs.toString() : ''}`,
      { headers: this.getHeaders(false) },
    );
    return this.handleResponse<unknown>(response);
  }

  async likePost(postId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/social/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<unknown>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export for testing/mocking
export default apiClient;
