import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// DEMO MODE - disable for production so middleware enforces auth
// Note: `DEMO_MODE` is server-side env (not exposed to the browser by Next).
// You can also set `NEXT_PUBLIC_DEMO_MODE` for local/client-side debugging.
const DEMO_MODE =
  process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function middleware(request: NextRequest) {
  // In demo mode, skip authentication middleware
  if (DEMO_MODE) {
    return NextResponse.next();
  }
  
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
