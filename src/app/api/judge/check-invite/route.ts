import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ invited: false }, { status: 500 });
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ invited: false });
  }

  const { data } = await adminSupabase
    .from("judges")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return NextResponse.json({ invited: !!data });
}
