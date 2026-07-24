import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(body);
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference = data.reference;
  const metadata = data.metadata;

  if (metadata?.type !== "ticket") {
    return NextResponse.json({ received: true });
  }

  const amountPaid = Number(data.amount) / 100;

  const { data: existing } = await adminSupabase
    .from("tickets")
    .select("id, verified")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing?.verified) {
    return NextResponse.json({ received: true });
  }

  const { data: tier } = await adminSupabase
    .from("ticket_tiers")
    .select("*")
    .eq("id", metadata.tierId)
    .maybeSingle();

  if (!tier) return NextResponse.json({ received: true });

  let ticket = existing;

  if (!ticket) {
    const ticketCode = `FUL-TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrToken = crypto.randomUUID() + crypto.randomUUID();

    const { data: createdTicket, error } = await adminSupabase
      .from("tickets")
      .insert({
        tier_id: metadata.tierId,
        ticket_code: ticketCode,
        qr_token: qrToken,
        buyer_name: metadata.buyerName,
        buyer_email: metadata.buyerEmail,
        buyer_phone: metadata.buyerPhone,
        seats_covered: tier.seats_covered,
        transaction_reference: reference,
        amount_paid: amountPaid,
        payment_provider: "paystack",
        verified: false
      })
      .select("id, verified")
      .single();

    if (error) {
      console.error("Webhook ticket insert error:", error);
      return NextResponse.json({ received: true });
    }

    ticket = createdTicket;
  }

  await adminSupabase.rpc("process_verified_ticket_purchase", { p_ticket_id: ticket.id });

  return NextResponse.json({ received: true });
}
