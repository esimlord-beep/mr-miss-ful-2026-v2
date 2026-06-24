import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If someone is trying to access the admin panel
  if (pathname.startsWith("/admin")) {
    // If they are on the login page, let them through completely
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // 2. Look for the bypass tokens we set in the browser cookies
    const sbToken = request.cookies.get("sb-access-token")?.value;
    const supToken = request.cookies.get("supabase-auth-token")?.value;

    // 3. If the bypass tokens exist, let them right into the dashboard
    if (sbToken === "dev-bypass-token" || supToken === "dev-bypass-token" || sbToken || supToken) {
      return NextResponse.next();
    }

    // If no session token is found at all, gently redirect them to log in
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on admin paths to protect the site performance
export const config = {
  matcher: ["/admin/:path*"],
};
