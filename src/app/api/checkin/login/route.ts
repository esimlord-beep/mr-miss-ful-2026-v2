import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password ?? "";

  const correctPassword = process.env.CHECKIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";

  if (!password || password !== correctPassword) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const cookieStore = cookies();
  cookieStore.set("checkin_auth", "true", {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 12, // 12 hours
    path: "/"
  });

  return NextResponse.json({ success: true });
}
