import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Olcan Compass v2.5 Middleware
 * Handles:
 * 1. Subdomain Multitenancy (admin.*, vendors.*, app.*)
 * 2. Supabase Session Management
 * 3. Security Headers
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // Custom subdomain detection logic
  // Localhost: admin.localhost:3000 -> admin
  // Production: admin.olcan.com.br -> admin
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const hostParts = hostname.split(".");
  
  let subdomain = "";
  if (isLocalhost) {
    if (hostParts.length > 1) subdomain = hostParts[0];
  } else {
    // Expecting app.olcan.com.br or admin.olcan.com.br
    if (hostParts.length > 2) subdomain = hostParts[0];
  }

  // 1. Subdomain-based Rewriting
  if (subdomain === "admin") {
    // Rewrite to the admin route group if not already there
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else if (subdomain === "vendors" || subdomain === "mentors") {
    // Rewrite to the provider route group if not already there
    if (!url.pathname.startsWith("/provider")) {
      url.pathname = `/provider${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else if (subdomain === "app") {
    // Main app subdomain - ensure we are in a valid app path or redirect to dashboard
    if (url.pathname === "/") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 1. Authentication & Session Update
  // Note: updateSession handles redirects for protected routes
  const response = await updateSession(request);
  
  // 2. Security Hardening
  addSecurityHeaders(response);
  
  return response;
}

/**
 * Add security headers to all responses
 */
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Refined CSP for production
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https: https://*.googleusercontent.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.sentry.io https://api.olcan.com.br https://olcan-compass-api.onrender.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
