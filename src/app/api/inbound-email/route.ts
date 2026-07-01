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

    // Log the payload so we can see exactly what Resend sends
    console.log("Incoming email:", body);

    const sender =
      body.from ??
      body.sender ??
      body.sender_email ??
      "";

    const recipient =
      body.to ??
      body.recipient ??
      "support@fulsugnight.online";

    const senderName =
      body.from_name ??
      body.sender_name ??
      "";

    const subject =
      body.subject ??
      "(No Subject)";

    const message =
      body.text ??
      body.text_body ??
      body.html ??
      "";

    const messageId =
      body.message_id ??
      body.id ??
      null;

    const { error } = await adminSupabase
      .from("support_messages")
      .insert({
        sender_name: senderName,
        sender_email: sender,
        recipient_email: recipient,
        subject,
        message,
        message_id: messageId
      });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Database error." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
