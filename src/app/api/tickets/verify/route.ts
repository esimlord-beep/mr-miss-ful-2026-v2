import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackReference } from "@/lib/paystack";
import { verifyFlutterwaveReference } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  reference: z.string().min(6)
});

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
  if (!adminSupabase) return "paystack";
  const { data } = await adminSupabase.from("settings").select("payment_provider").maybeSingle();
  return data?.payment_provider === "flutterwave" ? "flutterwave" : "paystack";
}

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 500 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transaction reference." }, { status: 400 });
  }

  const reference = parsed.data.reference;

  const { data: existing } = await adminSupabase
    .from("tickets")
    .select("id, verified")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing?.verified) {
    return NextResponse.json({ processed: true, message: "Ticket already verified." });
  }

  try {
    const provider = await getActiveProvider();
    const verifyFn = provider === "flutterwave" ? verifyFlutterwaveReference : verifyPaystackReference;
    const verification = await verifyFn(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
    }

    const metadata = verification.data.metadata;
    const amountPaid = Number(verification.data.amount) / (provider === "flutterwave" ? 1 : 100);

    const { data: tier } = await adminSupabase
      .from("ticket_tiers")
      .select("*")
      .eq("id", metadata.tierId)
      .maybeSingle();

    if (!tier) {
      return NextResponse.json({ error: "Ticket tier not found." }, { status: 404 });
    }

    if (amountPaid < tier.price) {
      return NextResponse.json({ error: "Paid amount does not match ticket price." }, { status: 400 });
    }

    let ticket = existing;

    if (!ticket) {
      const ticketCode = `FUL-TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qrToken = crypto.randomUUID() + crypto.randomUUID();

      const { data: createdTicket, error: ticketError } = await adminSupabase
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
          payment_provider: provider,
          verified: false
        })
        .select("id, verified")
        .single();

      if (ticketError) throw ticketError;
      ticket = createdTicket;
    }

    const { error: rpcError } = await adminSupabase.rpc("process_verified_ticket_purchase", {
      p_ticket_id: ticket.id
    });

    if (rpcError) throw rpcError;

    const { data: fullTicket } = await adminSupabase
      .from("tickets")
      .select("*, ticket_tiers(name)")
      .eq("id", ticket.id)
      .maybeSingle();

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && fullTicket) {
      const { data: settings } = await adminSupabase.from("settings").select("primary_logo").maybeSingle();
      const logoUrl = settings?.primary_logo ?? null;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Mr & Miss FUL 2026 <tickets@fulsugnight.online>",
          to: [fullTicket.buyer_email],
          subject: `Your Ticket — ${fullTicket.ticket_code}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF9F6;">
              ${logoUrl ? `<img src="${logoUrl}" alt="FUL 2026" style="height:40px;margin-bottom:24px;" />` : ""}
              <h2 style="color:#0B132B;margin:0 0 8px;">Your ticket is confirmed! 🎉</h2>
              <p style="color:#555;margin:0 0 24px;">Hi ${fullTicket.buyer_name}, here's your ticket for the FUL Night 2026.</p>
              <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><strong>Ticket Code:</strong> ${fullTicket.ticket_code}</p>
                <p style="margin:0 0 8px;"><strong>Tier:</strong> ${fullTicket.ticket_tiers?.name}</p>
                <p style="margin:0 0 8px;"><strong>Seats:</strong> ${fullTicket.seats_covered}</p>
                <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ₦${Number(fullTicket.amount_paid).toLocaleString()}</p>
                <p style="margin:0;"><strong>Reference:</strong> ${reference}</p>
              </div>
              <p style="color:#555;font-size:13px;">Present your ticket code at the gate. See you there!</p>
            </div>
          `
        })
      });
    }

    return NextResponse.json({ processed: true, ticket_code: fullTicket?.ticket_code });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ticket verification failed." },
      { status: 500 }
    );
  }
}
