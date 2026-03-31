import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("placeholder"));
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // If Supabase is not configured, skip all auth checks and let the app
  // handle authentication via its own JWT/API layer
  if (!isSupabaseConfigured()) {
    return response;
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Protected routes — redirect to login if not authenticated
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/routes") ||
    request.nextUrl.pathname.startsWith("/readiness") ||
    request.nextUrl.pathname.startsWith("/forge") ||
    request.nextUrl.pathname.startsWith("/interviews") ||
    request.nextUrl.pathname.startsWith("/applications") ||
    request.nextUrl.pathname.startsWith("/sprints") ||
    request.nextUrl.pathname.startsWith("/community") ||
    request.nextUrl.pathname.startsWith("/marketplace") ||
    request.nextUrl.pathname.startsWith("/provider") ||
    request.nextUrl.pathname.startsWith("/org") ||
    request.nextUrl.pathname.startsWith("/shop") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/subscription") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Auth routes — redirect to dashboard if already authenticated
  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
