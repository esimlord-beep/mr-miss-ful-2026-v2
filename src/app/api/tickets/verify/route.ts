import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackReference } from "@/lib/paystack";
import { verifyFlutterwaveReference } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";
import { generateTicketsPdf } from "@/lib/ticket-pdf";

const schema = z.object({
  reference: z.string().min(6)
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Ticket verification failed.";
}

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
  if (!adminSupabase) return "paystack";
  const { data } = await adminSupabase.from("settings").select("payment_provider").maybeSingle();
  return data?.payment_provider === "flutterwave" ? "flutterwave" : "paystack";
}

function generateTicketCode(): string {
  return `FUL-TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function generateQrToken(): string {
  return crypto.randomUUID() + crypto.randomUUID();
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

  // A purchase of quantity N produces N ticket rows sharing this reference.
  const { data: existingTickets } = await adminSupabase
    .from("tickets")
    .select("id, verified, ticket_code")
    .eq("transaction_reference", reference);

  if (existingTickets && existingTickets.length > 0 && existingTickets.every((t) => t.verified)) {
    return NextResponse.json({
      processed: true,
      message: "Tickets already verified.",
      ticket_code: existingTickets[0].ticket_code,
      quantity: existingTickets.length
    });
  }

  try {
    const provider = await getActiveProvider();
    const verifyFn = provider === "flutterwave" ? verifyFlutterwaveReference : verifyPaystackReference;
    const verification = await verifyFn(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
    }

    // Paystack normally returns metadata as a parsed object, but some
    // payment channels (observed with bank_transfer / OPay) return it as a
    // raw JSON string instead. Handle both so tierId isn't silently lost
    // just because of the channel used.
    let metadata: any = verification.data.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (parseError) {
        console.error("Failed to parse string metadata from Paystack (ticket)", {
          reference,
          rawMetadata: metadata,
          parseError
        });
        metadata = null;
      }
    }

    if (!metadata?.tierId) {
      console.error("Missing tierId in ticket payment metadata", {
        reference,
        provider,
        rawMetadata: verification.data.metadata,
        parsedMetadata: metadata
      });
      return NextResponse.json({ error: "Ticket record is missing tier information." }, { status: 500 });
    }

    const quantity = Math.max(1, Math.min(10, Number(metadata.quantity) || 1));
    const amountPaid = Number(verification.data.amount) / (provider === "flutterwave" ? 1 : 100);

    const { data: tier } = await adminSupabase
      .from("ticket_tiers")
      .select("*")
      .eq("id", metadata.tierId)
      .maybeSingle();

    if (!tier) {
      return NextResponse.json({ error: "Ticket tier not found." }, { status: 404 });
    }

    const expectedAmount = Number(tier.price) * quantity;
    if (amountPaid < expectedAmount) {
      return NextResponse.json({ error: "Paid amount does not match ticket price." }, { status: 400 });
    }

    let tickets = existingTickets ?? [];

    if (tickets.length === 0) {
      const rowsToInsert = Array.from({ length: quantity }, () => ({
        tier_id: metadata.tierId,
        ticket_code: generateTicketCode(),
        qr_token: generateQrToken(),
        buyer_name: metadata.buyerName,
        buyer_email: metadata.buyerEmail,
        buyer_phone: metadata.buyerPhone,
        seats_covered: tier.seats_covered,
        transaction_reference: reference,
        amount_paid: amountPaid / quantity, // split evenly across tickets for accounting
        payment_provider: provider,
        verified: false
      }));

      const { data: createdTickets, error: ticketError } = await adminSupabase
        .from("tickets")
        .insert(rowsToInsert)
        .select("id, verified, ticket_code");

      if (ticketError) {
        console.error("Failed to insert ticket rows", ticketError);
        throw ticketError;
      }
      tickets = createdTickets ?? [];
    }

    const { error: rpcError } = await adminSupabase.rpc("process_verified_ticket_purchase", {
      p_ticket_ids: tickets.map((t) => t.id)
    });

    if (rpcError) {
      console.error("process_verified_ticket_purchase RPC failed", {
        rpcError,
        ticketIds: tickets.map((t) => t.id)
      });
      throw rpcError;
    }

    const { data: fullTickets } = await adminSupabase
      .from("tickets")
      .select("*, ticket_tiers(name)")
      .in("id", tickets.map((t) => t.id));

    if (fullTickets && fullTickets.length > 0) {
      try {
        await sendTicketsEmail(fullTickets, reference);
      } catch (emailError) {
        console.error("Ticket confirmation email failed to send", emailError);
      }
    }

    return NextResponse.json({
      processed: true,
      ticket_code: fullTickets?.[0]?.ticket_code,
      quantity: tickets.length
    });
  } catch (error) {
    console.error("Ticket verification error", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function sendTicketsEmail(fullTickets: any[], reference: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !adminSupabase) return;

  const first = fullTickets[0];
  const { data: settings } = await adminSupabase.from("settings").select("primary_logo").maybeSingle();
  const logoUrl = settings?.primary_logo ?? null;

  const pdfBuffer = await generateTicketsPdf(
    fullTickets.map((t) => ({
      ticketCode: t.ticket_code,
      qrToken: t.qr_token,
      tierName: t.ticket_tiers?.name ?? "Ticket",
      seatsCovered: t.seats_covered,
      buyerName: t.buyer_name
    }))
  );
  const pdfBase64 = pdfBuffer.toString("base64");

  const totalPaid = fullTickets.reduce((sum, t) => sum + Number(t.amount_paid), 0);
  const quantity = fullTickets.length;
  const ticketCodesList = fullTickets.map((t) => t.ticket_code).join(", ");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Mr & Miss FUL 2026 <tickets@fulsugnight.online>",
      to: [first.buyer_email],
      subject: quantity > 1 ? `Your ${quantity} Tickets for FUL Award Night 2026` : `Your Ticket: ${first.ticket_code}`,
      attachments: [
        {
          filename: quantity > 1 ? "ful-tickets.pdf" : "ful-ticket.pdf",
          content: pdfBase64
        }
      ],
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#FAF9F6;">
          <div style="background:#FAF9F6;padding:28px 24px;text-align:center;border-bottom:3px solid #D4AF37;">
            ${logoUrl ? `<img src="${logoUrl}" alt="FUL Award Night 2026" style="height:44px;width:auto;margin-bottom:10px;" />` : ""}
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#B8901F;margin:0;">
              FUL Award Night 2026
            </p>
          </div>
          <div style="padding:28px 24px;">
            <h1 style="font-size:20px;font-weight:800;margin:0 0 16px;color:#0B132B;">
              ${quantity > 1 ? `Your ${quantity} tickets are confirmed` : "Your ticket is confirmed"}
            </h1>
            <p style="margin:0 0 16px;color:#0B132B;font-size:14px;">Hi ${first.buyer_name},</p>
            <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
              Thank you for your purchase. ${quantity > 1 ? `Your ${quantity} tickets are` : "Your ticket is"} attached to this email as a PDF. Please present the QR code on each ticket at the entrance. Each ticket admits entry once only.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Ticket type</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${first.ticket_tiers?.name ?? "Ticket"}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Quantity</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${quantity}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Ticket codes</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;font-size:11px;color:#0B132B;">${ticketCodesList}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Amount paid</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">₦${totalPaid.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;">Reference</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;font-size:11px;color:#0B132B;">${reference}</td>
              </tr>
            </table>
            <div style="background:#F5F3EE;border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="font-size:13px;font-weight:700;color:#0B132B;margin:0 0 6px;">Questions about this order?</p>
              <p style="font-size:13px;color:#64748b;margin:0 0 8px;line-height:1.5;">
                Reply to this email or reach our support team directly, and please include your reference number above.
              </p>
              <p style="font-size:13px;margin:0;">
                <a href="mailto:support@fulsugnight.online" style="color:#B8901F;font-weight:700;text-decoration:none;">support@fulsugnight.online</a>
                &nbsp;·&nbsp;
                <a href="https://wa.me/2348105789086" style="color:#B8901F;font-weight:700;text-decoration:none;">WhatsApp support</a>
              </p>
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:16px;" />
            <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0;line-height:1.6;">
              This is an automated ticket receipt from FUL SUG Night. Replies go to our support team.<br/>
              © 2026 Mr &amp; Miss FUL. All rights reserved.<br/>
              Designed with ❤️ by Esim Web Studio
            </p>
          </div>
        </div>
      `
    })
  });

  if (!emailResponse.ok) {
    console.error("Resend ticket email failed", await emailResponse.text());
  }
}
