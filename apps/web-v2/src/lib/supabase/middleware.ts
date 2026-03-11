import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // In development with placeholder Supabase creds, skip auth checks
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  let user = null;
  if (!isDevBypass) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

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

  if (isProtectedRoute && !user && !isDevBypass) {
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

  return response;
}
