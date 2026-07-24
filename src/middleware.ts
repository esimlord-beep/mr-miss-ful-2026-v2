import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow admin login page through
  if (path.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Allow checkin login page through
  if (path.startsWith("/checkin/login")) {
    return NextResponse.next();
  }

  // Protect /checkin routes
  if (path.startsWith("/checkin")) {
    const auth = request.cookies.get("checkin_auth")?.value;
    if (auth !== "true") {
      return NextResponse.redirect(new URL("/checkin/login", request.url));
    }
    return NextResponse.next();
  }

  // Protect /admin routes
  if (path.startsWith("/admin")) {
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(c =>
      c.name.startsWith("sb-") ||
      c.name.includes("supabase") ||
      c.name.includes("auth")
    );
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkin/:path*"]
};
