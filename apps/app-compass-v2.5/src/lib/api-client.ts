/**
 * API Client for Olcan Compass v2.5
 * Connects frontend to real backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

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

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
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
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
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
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }

    return tokenData;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<User>(response);
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
  async getAuras(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/companions/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async getAura(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async createAura(data: { name: string; aura_type: string }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        name: data.name,
        archetype_id: data.aura_type,
        type: data.aura_type,
        level: 1,
        xp: 0,
        xp_to_next: 500,
        evolution_stage: 'egg',
        abilities: [],
        stats: {
          power: 70,
          wisdom: 70,
          charisma: 70,
          agility: 70
        },
        current_health: 100.0,
        max_health: 100.0,
        energy: 100.0,
        max_energy: 100.0
      })
    });
    return this.handleResponse<any>(response);
  }

  async feedAura(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/feed`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async trainAura(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/train`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async playWithAura(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/play`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async restAura(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/rest`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getAuraActivities(id: number, limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/companions/${id}/activities?limit=${limit}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  // Marketplace endpoints
  async getProviders(params?: { category?: string; search?: string }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}/marketplace/providers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async getProvider(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/providers/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async contactProvider(id: number, message: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/providers/${id}/contact?message=${encodeURIComponent(message)}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async createProvider(data: {
    name: string;
    bio: string;
    specialties: string[];
    languages: string[];
    country: string;
    timezone: string;
  }): Promise<any> {
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
    return this.handleResponse<any>(response);
  }

  async getConversations(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/marketplace/conversations`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async getMessages(conversationId: number): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/marketplace/conversations/${conversationId}/messages`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  // Leaderboard endpoints
  async getTopAuras(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/companions/top?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getTopUsers(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/users/top?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getRecentActivities(limit: number = 20): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard/activities/recent?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getGlobalStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/leaderboard/stats/global`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  async getUserStats(userId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/leaderboard/stats/user/${userId}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  async getMyRank(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/leaderboard/my-rank`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  // Document endpoints (Narrative Forge)
  async createDocument(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async listDocuments(params?: { skip?: number; limit?: number; document_type?: string; status?: string; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.document_type) queryParams.append('document_type', params.document_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/documents?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getDocument(documentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async updateDocument(documentId: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
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

  async polishDocument(documentId: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async getPolishHistory(documentId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async submitPolishFeedback(documentId: string, polishId: string, feedback: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/polish/${polishId}/feedback`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(feedback),
    });
    return this.handleResponse<any>(response);
  }

  async updateCharacterCount(documentId: string, content: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/count`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse<any>(response);
  }

  async getVersionHistory(documentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/versions`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async trackFocusSession(documentId: string, durationSeconds: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/focus`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ document_id: documentId, duration_seconds: durationSeconds }),
    });
    return this.handleResponse<any>(response);
  }

  async getFocusStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/stats/focus`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getDocumentStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/stats`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async listDocumentTemplates(category?: string): Promise<any> {
    const queryParams = category ? `?category=${category}` : '';
    const response = await fetch(`${this.baseUrl}/documents/templates${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  async createFromTemplate(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/from-template`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
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
  }): Promise<any[]> {
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
    return this.handleResponse<any[]>(response);
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
  }): Promise<any[]> {
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

    const response = await fetch(`${this.baseUrl}/marketplace/products/public?${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getOlcanOfficialProducts(category?: string, limit: number = 50): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/products/public/olcan-official?${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getFeaturedProducts(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/public/featured?limit=${limit}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  async getProduct(productId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getProductBySlug(slug: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/public/${slug}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  async createProduct(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async updateProduct(productId: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async publishProduct(productId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}/publish`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  // Shopping cart endpoints
  async getCart(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async addToCart(data: {
    product_id: string;
    quantity?: number;
    booking_date?: string;
    booking_notes?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse<any>(response);
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
    shipping_address?: any;
    billing_address?: any;
    payment_method?: string;
    customer_notes?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async getOrders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/orders?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async getOrder(orderId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/orders/${orderId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  // Review endpoints
  async createReview(productId: string, data: {
    rating: number;
    title?: string;
    comment?: string;
    order_id?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/products/${productId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  // Service provider endpoints
  async createServiceProvider(data: {
    business_name: string;
    bio: string;
    specializations?: string[];
    languages?: string[];
    certifications?: any[];
    years_experience?: number;
    hourly_rate?: number;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/marketplace/service-providers`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async getServiceProviders(params?: {
    specializations?: string[];
    is_verified?: boolean;
    min_rating?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.specializations) params.specializations.forEach(s => queryParams.append('specializations', s));
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
    if (params?.min_rating !== undefined) queryParams.append('min_rating', params.min_rating.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/marketplace/service-providers?${queryParams}`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any[]>(response);
  }

  // Interview endpoints
  async getInterviews(params?: {
    interview_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.interview_type) queryParams.append('interview_type', params.interview_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/interviews?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async createInterview(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/interviews`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async getInterview(interviewId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async startInterview(interviewId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/start`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async submitInterviewResponse(interviewId: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/responses`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async completeInterview(interviewId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  // Guild endpoints
  async getGuilds(params?: {
    search?: string;
    is_public?: boolean;
    tags?: string[];
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
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
    return this.handleResponse<any[]>(response);
  }

  async createGuild(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  async getGuild(guildId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async joinGuild(guildId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/join`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async leaveGuild(guildId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  // Social endpoints
  async getActivityFeed(params?: {
    activity_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.activity_type) queryParams.append('activity_type', params.activity_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/social/activities?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async likeActivity(activityId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/social/activities/${activityId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async commentOnActivity(activityId: string, comment: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/social/activities/${activityId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ comment }),
    });
    return this.handleResponse<any>(response);
  }

  async followUser(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/social/follow/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async unfollowUser(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/social/unfollow/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getNotifications(params?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/social/notifications?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any[]>(response);
  }

  async markNotificationRead(notificationId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/social/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<any>(response);
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/social/notifications/unread/count`, {
      headers: this.getHeaders(true),
    });
    const data = await this.handleResponse<any>(response);
    return data.count || 0;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export for testing/mocking
export default apiClient;
