import { NextResponse } from "next/server";
import { z } from "zod";
import { votePrice } from "@/lib/config";
import { verifyPaystackReference } from "@/lib/paystack";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  reference: z.string().min(6)
});

export async function POST(request: Request) {
  if (!adminSupabase) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 500 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid transaction reference." }, { status: 400 });

  const reference = parsed.data.reference;
  const existing = await adminSupabase
    .from("payments")
    .select("id, processed")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing.data?.processed) {
    return NextResponse.json({ processed: true, message: "Transaction already processed." });
  }

  try {
    const verification = await verifyPaystackReference(reference);
    if (verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
    }

    const metadata = verification.data.metadata;
    const voteQuantity = Number(metadata.voteQuantity);
    const amountPaid = Number(verification.data.amount) / 100;
    const expectedAmount = voteQuantity * votePrice;

    if (amountPaid < expectedAmount) {
      return NextResponse.json({ error: "Paid amount does not match vote quantity." }, { status: 400 });
    }

    let payment = existing.data;
    if (!payment) {
      const { data: createdPayment, error: paymentError } = await adminSupabase
        .from("payments")
        .insert({
          candidate_id: metadata.candidateId,
          transaction_reference: reference,
          payer_name: metadata.payerName,
          payer_email: metadata.payerEmail,
          payer_phone: metadata.payerPhone,
          vote_quantity: voteQuantity,
          amount_paid: amountPaid,
          verified: true,
          processed: false
        })
        .select("id, processed")
        .single();

      if (paymentError) throw paymentError;
      payment = createdPayment;
    }

    const { error: rpcError } = await adminSupabase.rpc("process_verified_vote", {
      p_candidate_id: metadata.candidateId,
      p_payment_id: payment.id,
      p_votes_added: voteQuantity
    });

    if (rpcError) throw rpcError;
    return NextResponse.json({ processed: true, votes_added: voteQuantity });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment verification failed." }, { status: 500 });
  }
}
