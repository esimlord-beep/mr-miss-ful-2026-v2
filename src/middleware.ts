import { NextResponse, type NextRequest } from "next/server";

async function isMaintenanceMode(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(
      `${url}/rest/v1/settings?select=maintenance_mode&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return rows?.[0]?.maintenance_mode === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (path.startsWith("/checkin/login")) {
    return NextResponse.next();
  }

  if (path.startsWith("/instructor/login")) {
    return NextResponse.next();
  }

  if (path.startsWith("/judge/login") || path.startsWith("/judge/signup")) {
    return NextResponse.next();
  }

  if (path.startsWith("/judge")) {
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(c =>
      c.name.startsWith("sb-") ||
      c.name.includes("supabase") ||
      c.name.includes("auth")
    );
    if (!hasSession) {
      return NextResponse.redirect(new URL("/judge/login", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/instructor")) {
    const auth = request.cookies.get("instructor_auth")?.value;
    if (auth !== "true") {
      return NextResponse.redirect(new URL("/instructor/login", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/checkin")) {
    const auth = request.cookies.get("checkin_auth")?.value;
    if (auth !== "true") {
      return NextResponse.redirect(new URL("/checkin/login", request.url));
    }
    return NextResponse.next();
  }

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

  if (
    path !== "/maintenance" &&
    !path.startsWith("/api") &&
    !path.startsWith("/_next") &&
    !path.startsWith("/favicon")
  ) {
    const maintenance = await isMaintenanceMode();
    if (maintenance) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
};
