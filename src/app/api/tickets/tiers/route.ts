import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";

export async function GET() {
  if (!adminSupabase) {
    return NextResponse.json({ tiers: [] });
  }

  const { data, error } = await adminSupabase
    .from("ticket_tiers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ tiers: [] });
  }

  return NextResponse.json({ tiers: data });
}
