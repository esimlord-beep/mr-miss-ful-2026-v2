import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackReference } from "@/lib/paystack";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  reference: z.string().min(6)
});

export async function POST(request: Request) {
  if (!adminSupabase) return NextResponse.json({ error: "Server error." }, { status: 500 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid reference." }, { status: 400 });

  const reference = parsed.data.reference;

  const { data: existing } = await adminSupabase
    .from("award_payments")
    .select("id, processed")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ processed: true, message: "Already processed." });
  }

  try {
    const verification = await verifyPaystackReference(reference);
    if (verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
    }

    const metadata = verification.data.metadata;
    const voteQuantity = Number(metadata.voteQuantity);
    const amountPaid = Number(verification.data.amount) / 100;

    const { data: category } = await adminSupabase
      .from("award_categories")
      .select("vote_price")
      .eq("id", metadata.categoryId)
      .single();

    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 400 });

    const expectedAmount = voteQuantity * category.vote_price;
    if (amountPaid < expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
    }

    let payment = existing;
    if (!payment) {
      const { data: createdPayment, error: paymentError } = await adminSupabase
        .from("award_payments")
        .insert({
          nominee_id: metadata.nomineeId,
          category_id: metadata.categoryId,
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

    const { error: rpcError } = await adminSupabase.rpc("process_award_vote", {
      p_nominee_id: metadata.nomineeId,
      p_category_id: metadata.categoryId,
      p_payment_id: payment.id,
      p_votes_added: voteQuantity
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ processed: true, votes_added: voteQuantity });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed." }, { status: 500 });
  }
}
