import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ success: false, message: "Server not configured." }, { status: 500 });
  }

  const body = await request.json();
  const qrToken = body.qr_token ?? "";

  if (!qrToken) {
    return NextResponse.json({ success: false, message: "No QR token provided." }, { status: 400 });
  }

  const { data, error } = await adminSupabase.rpc("check_in_ticket", {
    p_qr_token: qrToken,
    p_staff_label: "Gate Staff"
  });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const result = data?.[0];
  if (!result) {
    return NextResponse.json({ success: false, message: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
