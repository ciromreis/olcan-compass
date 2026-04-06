/**
 * Custom Authentication Strategy for Payload CMS
 * 
 * Validates Olcan JWT tokens to allow authenticated users
 * from the main app to access the CMS admin panel.
 * 
 * Only users with 'admin' role can access CMS.
 */

import type { PayloadRequest } from 'payload/types';
import jwt from 'jsonwebtoken';

interface OlcanJWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Olcan JWT Authentication Strategy for Payload CMS
 */
export const olcanAuthStrategy = {
  name: 'olcan-jwt',
  
  /**
   * Authenticate user from Olcan JWT token
   */
  authenticate: async ({ headers }: { headers: Headers }) => {
    const authHeader = headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || process.env.PAYLOAD_SECRET;

    if (!jwtSecret) {
      console.error('[payload-auth] JWT_SECRET not configured');
      return { user: null };
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(token, jwtSecret) as OlcanJWTPayload;

      // Only allow admin role to access CMS
      if (payload.role !== 'admin') {
        console.warn(`[payload-auth] User ${payload.email} attempted CMS access with role: ${payload.role}`);
        return { user: null };
      }

      // Return user object in Payload format
      return {
        user: {
          id: payload.sub,
          email: payload.email,
          role: 'admin',
          collection: 'users',
        },
      };
    } catch (error) {
      console.error('[payload-auth] Token verification failed:', error.message);
      return { user: null };
    }
  },

  /**
   * Refresh authentication (not needed for JWT)
   */
  refresh: async () => {
    return { user: null };
  },
};

/**
 * Helper to check if user can access CMS
 */
export function canAccessCMS(role: string): boolean {
  return role === 'admin';
}

/**
 * Middleware to protect CMS routes
 */
export async function requireCMSAccess(req: PayloadRequest, res: any, next: any) {
  const user = req.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.',
    });
  }

  next();
}
