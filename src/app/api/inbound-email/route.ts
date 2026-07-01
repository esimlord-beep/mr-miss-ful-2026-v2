import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    console.log("Incoming email:", body);

    const email = body.data ?? {};

    const sender = email.from ?? "";
    const recipient = Array.isArray(email.to)
      ? email.to.join(", ")
      : email.to ?? "support@fulsugnight.online";

    const senderName = email.from_name ?? "";

    const subject = email.subject ?? "(No Subject)";

    const message =
      email.text ??
      email.text_body ??
      email.html ??
      "";

    const messageId =
      email.email_id ??
      email.message_id ??
      null;

    const { data, error } = await adminSupabase
      .from("support_messages")
      .insert({
        sender_name: senderName,
        sender_email: sender,
        recipient_email: recipient,
        subject,
        message,
        message_id: messageId,
      })
      .select();

    if (error) {
      console.error("Supabase Error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("Inserted:", data);

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("Webhook Error:", err);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
