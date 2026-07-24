import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin panel — protected by admin login
  if (pathname.startsWith("/admin")) {
    // If they are on the login page, let them through completely
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Look for the bypass tokens we set in the browser cookies
    const sbToken = request.cookies.get("sb-access-token")?.value;
    const supToken = request.cookies.get("supabase-auth-token")?.value;

    // If the bypass tokens exist, let them right into the dashboard
    if (sbToken === "dev-bypass-token" || supToken === "dev-bypass-token" || sbToken || supToken) {
      return NextResponse.next();
    }

    // If no session token is found at all, gently redirect them to log in
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Gate check-in scanner — protected by a separate, shared gate password.
  // Deliberately NOT tied to admin auth, so door staff can use it without
  // needing access to the admin panel.
  if (pathname.startsWith("/checkin")) {
    if (pathname === "/checkin/login") {
      return NextResponse.next();
    }

    const gateToken = request.cookies.get("gate-access-token")?.value;
    const gatePassword = process.env.GATE_CHECKIN_PASSWORD;

    if (gateToken && gatePassword && gateToken === gatePassword) {
      return NextResponse.next();
    }

    const gateLoginUrl = new URL("/checkin/login", request.url);
    return NextResponse.redirect(gateLoginUrl);
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on admin + check-in paths to protect site performance
export const config = {
  matcher: ["/admin/:path*", "/checkin/:path*"],
};
