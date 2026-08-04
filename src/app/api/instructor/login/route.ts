import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password ?? "";

  const correctPassword = process.env.INSTRUCTOR_PASSWORD ?? "";

  if (!correctPassword || !password || password !== correctPassword) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("instructor_auth", "true", {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 12, // 12 hours
    path: "/"
  });

  return NextResponse.json({ success: true });
}
