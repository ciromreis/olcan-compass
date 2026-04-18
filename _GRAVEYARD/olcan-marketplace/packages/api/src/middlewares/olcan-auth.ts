/**
 * Olcan JWT Authentication Middleware for MedusaJS
 * 
 * Validates JWT tokens issued by the Olcan FastAPI backend
 * and maps them to MedusaJS customer sessions.
 * 
 * This enables single sign-on between the main Olcan app
 * and the MedusaJS marketplace.
 */

import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/medusa";
import jwt from "jsonwebtoken";

interface OlcanJWTPayload {
  sub: string;        // User ID
  email: string;
  role: string;       // user | vendor | admin
  exp: number;
  iat: number;
}

interface OlcanAuthConfig {
  jwtSecret: string;
  enabled: boolean;
}

/**
 * Middleware to validate Olcan JWT tokens
 * 
 * Checks Authorization header for Bearer token,
 * validates it against the shared JWT_SECRET,
 * and attaches user info to request.
 */
export function olcanAuthMiddleware(config: OlcanAuthConfig) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    // Skip if disabled
    if (!config.enabled) {
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token, continue without auth
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      // Verify JWT token with shared secret
      const payload = jwt.verify(token, config.jwtSecret) as OlcanJWTPayload;

      // Attach user info to request
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // For MedusaJS compatibility, also set customer_id
      // This allows MedusaJS to associate requests with customers
      req.session = req.session || {};
      req.session.customer_id = payload.sub;

      next();
    } catch (error) {
      // Invalid token - log but don't block request
      console.warn("[olcan-auth] Invalid JWT token:", error.message);
      next();
    }
  };
}

/**
 * Helper to check if request is authenticated via Olcan
 */
export function isOlcanAuthenticated(req: MedusaRequest): boolean {
  return !!(req.user && req.user.id);
}

/**
 * Helper to get Olcan user from request
 */
export function getOlcanUser(req: MedusaRequest): { id: string; email: string; role: string } | null {
  return req.user || null;
}

/**
 * Helper to check if user has specific role
 */
export function hasRole(req: MedusaRequest, role: string | string[]): boolean {
  const user = getOlcanUser(req);
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Middleware to require authentication
 * Returns 401 if not authenticated
 */
export function requireOlcanAuth(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (!isOlcanAuthenticated(req)) {
    return res.status(401).json({
      message: "Authentication required",
      code: "UNAUTHORIZED",
    });
  }
  next();
}

/**
 * Middleware to require specific role
 * Returns 403 if user doesn't have required role
 */
export function requireRole(allowedRoles: string[]) {
  return (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    if (!isOlcanAuthenticated(req)) {
      return res.status(401).json({
        message: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }

    if (!hasRole(req, allowedRoles)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        code: "FORBIDDEN",
        required_roles: allowedRoles,
      });
    }

    next();
  };
}

/**
 * Customer sync service
 * Ensures Olcan users have corresponding MedusaJS customers
 */
export class OlcanCustomerSync {
  private customerService: any;

  constructor(customerService: any) {
    this.customerService = customerService;
  }

  /**
   * Get or create customer for Olcan user
   */
  async getOrCreateCustomer(olcanUser: { id: string; email: string; full_name?: string }) {
    try {
      // Try to find existing customer by email
      const customers = await this.customerService.list({
        email: olcanUser.email,
      });

      if (customers.length > 0) {
        return customers[0];
      }

      // Create new customer
      const nameParts = (olcanUser.full_name || olcanUser.email).split(" ");
      const firstName = nameParts[0] || olcanUser.email;
      const lastName = nameParts.slice(1).join(" ") || "";

      const customer = await this.customerService.create({
        email: olcanUser.email,
        first_name: firstName,
        last_name: lastName,
        metadata: {
          olcan_user_id: olcanUser.id,
          synced_from: "olcan-app",
          synced_at: new Date().toISOString(),
        },
      });

      console.log(`[olcan-sync] Created customer for user ${olcanUser.id}`);
      return customer;
    } catch (error) {
      console.error("[olcan-sync] Failed to sync customer:", error);
      throw error;
    }
  }

  /**
   * Sync vendor role to MedusaJS seller
   * This would integrate with @mercurjs/seller module
   */
  async syncVendorRole(olcanUser: { id: string; email: string; role: string }) {
    if (olcanUser.role !== "vendor") {
      return;
    }

    // TODO: Integrate with Mercur seller module
    // This would create a seller account in MedusaJS
    // when a user has the vendor role in Olcan
    console.log(`[olcan-sync] User ${olcanUser.id} has vendor role - seller sync needed`);
  }
}

/**
 * Export middleware factory for easy integration
 */
export function createOlcanAuthMiddleware() {
  const jwtSecret = process.env.JWT_SECRET || process.env.OLCAN_JWT_SECRET;
  
  if (!jwtSecret) {
    console.warn("[olcan-auth] JWT_SECRET not configured - Olcan auth disabled");
    return olcanAuthMiddleware({ jwtSecret: "", enabled: false });
  }

  return olcanAuthMiddleware({
    jwtSecret,
    enabled: true,
  });
}
