/**
 * Shared Authentication Service
 * Unified auth across app-compass-v2.5, site-marketing-v2.5, and Mercur marketplace
 * 
 * Architecture:
 * - Single JWT token stored in localStorage
 * - Token valid across all Olcan services
 * - Mercur uses its own auth but syncs with Olcan user system
 */

export interface OlcanUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'vendor';
  avatar_url?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private token: string | null = null;
  
  // Service endpoints
  private readonly APP_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';
  private readonly MERCUR_API_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('olcan_access_token');
    }
  }
  
  static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }
  
  /**
   * Login user - authenticates with app backend and syncs with Mercur
   */
  async login(email: string, password: string): Promise<OlcanUser> {
    // 1. Authenticate with Olcan app backend
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${this.APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const tokens: AuthTokens = await response.json();
    this.setToken(tokens.access_token);
    
    if (tokens.refresh_token) {
      this.setRefreshToken(tokens.refresh_token);
    }
    
    // 2. Get user profile
    const user = await this.getCurrentUser();
    
    // 3. Sync with Mercur (create customer if doesn't exist)
    await this.syncWithMercur(user);
    
    return user;
  }
  
  /**
   * Register new user - creates account in app backend and Mercur
   */
  async register(email: string, password: string, fullName: string): Promise<OlcanUser> {
    const response = await fetch(`${this.APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username: email,
        password,
        full_name: fullName,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const user: OlcanUser = await response.json();
    
    // Auto-login after registration
    await this.login(email, password);
    
    return user;
  }
  
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<OlcanUser> {
    const response = await fetch(`${this.APP_API_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    const userData = await response.json();
    
    return {
      id: userData.id.toString(),
      email: userData.email,
      full_name: userData.full_name || userData.username,
      role: userData.role || 'user',
      avatar_url: userData.avatar_url,
      created_at: userData.created_at,
    };
  }
  
  /**
   * Logout user from all services
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.APP_API_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }
  
  /**
   * Sync user with Mercur marketplace
   * Creates customer account in Mercur if doesn't exist
   */
  private async syncWithMercur(user: OlcanUser): Promise<void> {
    try {
      // Check if customer exists in Mercur
      const response = await fetch(`${this.MERCUR_API_URL}/store/customers/me`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response.status === 404) {
        // Create customer in Mercur
        await fetch(`${this.MERCUR_API_URL}/store/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify({
            email: user.email,
            first_name: user.full_name.split(' ')[0] || user.full_name,
            last_name: user.full_name.split(' ').slice(1).join(' ') || '',
          }),
        });
      }
    } catch (error) {
      console.warn('Mercur sync failed (non-critical):', error);
    }
  }
  
  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): HeadersInit {
    if (!this.token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }
  
  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }
  
  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('olcan_access_token', token);
    }
  }
  
  /**
   * Set refresh token
   */
  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('olcan_refresh_token', token);
    }
  }
  
  /**
   * Clear all tokens
   */
  clearToken(): void {
    this.clearTokens();
  }
  
  private clearTokens(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olcan_access_token');
      localStorage.removeItem('olcan_refresh_token');
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const refreshToken = localStorage.getItem('olcan_refresh_token');
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.APP_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (!response.ok) {
        this.clearTokens();
        return false;
      }
      
      const tokens: AuthTokens = await response.json();
      this.setToken(tokens.access_token);
      
      if (tokens.refresh_token) {
        this.setRefreshToken(tokens.refresh_token);
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }
  
  /**
   * Auto-refresh token before expiration
   * Call this in app initialization
   */
  startTokenRefresh(intervalMinutes: number = 10): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Refresh token every N minutes
    setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.refreshToken();
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// Export singleton instance
export const authService = UnifiedAuthService.getInstance();
