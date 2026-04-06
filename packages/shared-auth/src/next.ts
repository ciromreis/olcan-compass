/**
 * Next.js Middleware for Unified Authentication
 * Usage: import { withAuth } from '@olcan/shared-auth/next'
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAuthService } from './index';

export interface AuthMiddlewareConfig {
  /**
   * Routes that require authentication
   * Supports wildcards: ['/dashboard/*', '/profile']
   */
  protectedRoutes?: string[];
  
  /**
   * Routes that should redirect to dashboard if authenticated
   * Typically login/register pages
   */
  publicOnlyRoutes?: string[];
  
  /**
   * Where to redirect unauthenticated users
   * @default '/login'
   */
  loginUrl?: string;
  
  /**
   * Where to redirect authenticated users from public-only routes
   * @default '/dashboard'
   */
  dashboardUrl?: string;
  
  /**
   * Custom role-based access control
   * Map routes to required roles
   */
  roleBasedAccess?: Record<string, string[]>;
}

const DEFAULT_CONFIG: Required<AuthMiddlewareConfig> = {
  protectedRoutes: ['/dashboard', '/profile', '/settings'],
  publicOnlyRoutes: ['/login', '/register'],
  loginUrl: '/login',
  dashboardUrl: '/dashboard',
  roleBasedAccess: {},
};

/**
 * Check if a path matches a pattern (supports wildcards)
 */
function matchesPattern(path: string, pattern: string): boolean {
  if (pattern.endsWith('/*')) {
    const basePattern = pattern.slice(0, -2);
    return path.startsWith(basePattern);
  }
  return path === pattern;
}

/**
 * Check if path matches any pattern in array
 */
function matchesAnyPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchesPattern(path, pattern));
}

/**
 * Verify JWT token and extract user info
 * This is a simplified version - in production, verify signature with JWT_SECRET
 */
function verifyToken(token: string): { role?: string; exp?: number } | null {
  try {
    // Split JWT token
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create authentication middleware for Next.js
 */
export function withAuth(config: AuthMiddlewareConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Get token from cookie or header
    const tokenFromCookie = request.cookies.get('olcan_access_token')?.value;
    const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromCookie || tokenFromHeader;
    
    // Verify token
    const payload = token ? verifyToken(token) : null;
    const isAuthenticated = !!payload;
    
    // Check if route is protected
    const isProtectedRoute = matchesAnyPattern(pathname, finalConfig.protectedRoutes);
    const isPublicOnlyRoute = matchesAnyPattern(pathname, finalConfig.publicOnlyRoutes);
    
    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL(finalConfig.loginUrl, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Redirect authenticated users from public-only routes
    if (isPublicOnlyRoute && isAuthenticated) {
      const dashboardUrl = new URL(finalConfig.dashboardUrl, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Check role-based access
    if (isAuthenticated && payload?.role) {
      for (const [routePattern, allowedRoles] of Object.entries(finalConfig.roleBasedAccess)) {
        if (matchesPattern(pathname, routePattern)) {
          if (!allowedRoles.includes(payload.role)) {
            // User doesn't have required role
            const forbiddenUrl = new URL('/403', request.url);
            return NextResponse.redirect(forbiddenUrl);
          }
        }
      }
    }
    
    // Add user info to headers for server components
    const response = NextResponse.next();
    if (isAuthenticated && payload) {
      response.headers.set('x-user-role', payload.role || 'user');
      response.headers.set('x-user-authenticated', 'true');
    }
    
    return response;
  };
}

/**
 * Helper to create matcher config for Next.js middleware
 * Usage in middleware.ts:
 * 
 * export const config = createAuthMatcher({
 *   protectedRoutes: ['/dashboard/*', '/profile'],
 *   publicOnlyRoutes: ['/login', '/register']
 * });
 */
export function createAuthMatcher(config: AuthMiddlewareConfig) {
  const allRoutes = [
    ...(config.protectedRoutes || []),
    ...(config.publicOnlyRoutes || []),
  ];
  
  return {
    matcher: allRoutes.map(route => 
      route.endsWith('/*') ? route : `${route}/:path*`
    ),
  };
}

/**
 * Server-side helper to get user from request headers
 * Use in Server Components or API routes
 */
export function getUserFromRequest(request: Request): { role: string; isAuthenticated: boolean } {
  const headers = new Headers(request.headers);
  return {
    role: headers.get('x-user-role') || 'user',
    isAuthenticated: headers.get('x-user-authenticated') === 'true',
  };
}

/**
 * API route protection helper
 * Usage in API routes:
 * 
 * export async function GET(request: Request) {
 *   const user = await requireAuth(request);
 *   // ... rest of handler
 * }
 */
export async function requireAuth(request: Request): Promise<{ role: string }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  if (!payload) {
    throw new Error('Invalid or expired token');
  }
  
  return { role: payload.role || 'user' };
}

/**
 * API route role-based protection
 * Usage:
 * 
 * export async function POST(request: Request) {
 *   await requireRole(request, ['admin', 'vendor']);
 *   // ... rest of handler
 * }
 */
export async function requireRole(request: Request, allowedRoles: string[]): Promise<void> {
  const user = await requireAuth(request);
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}
