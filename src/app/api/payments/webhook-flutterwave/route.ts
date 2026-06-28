import { NextResponse } from "next/server";
import { votePrice } from "@/lib/config";
import { adminSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const secret = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secret || !adminSupabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const signature = request.headers.get("verif-hash");
  if (signature !== secret) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = await request.json();

  if (event.event !== "charge.completed" || event.data?.status !== "successful") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.tx_ref;
  const metadata = event.data.meta || {};
  const amountPaid = Number(event.data.amount);

  try {
    if (metadata.type === "award") {
      await processAwardVote(reference, metadata, amountPaid);
    } else {
      await processMainVote(reference, metadata, amountPaid);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

async function processMainVote(reference: string, metadata: any, amountPaid: number) {
  if (!adminSupabase) return;

  const { data: existing } = await adminSupabase
    .from("payments")
    .select("id, processed")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing?.processed) return;

  const voteQuantity = Number(metadata.voteQuantity);
  const expectedAmount = voteQuantity * votePrice;
  if (amountPaid < expectedAmount) return;

  let payment = existing;
  if (!payment) {
    const { data: created, error } = await adminSupabase
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
    if (error) throw error;
    payment = created;
  }

  const { error: rpcError } = await adminSupabase.rpc("process_verified_vote", {
    p_candidate_id: metadata.candidateId,
    p_payment_id: payment.id,
    p_votes_added: voteQuantity
  });
  if (rpcError) throw rpcError;
}

async function processAwardVote(reference: string, metadata: any, amountPaid: number) {
  if (!adminSupabase) return;

  const { data: existing } = await adminSupabase
    .from("award_payments")
    .select("id, processed")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing?.processed) return;

  const voteQuantity = Number(metadata.voteQuantity);

  const { data: category } = await adminSupabase
    .from("award_categories")
    .select("vote_price")
    .eq("id", metadata.categoryId)
    .single();

  if (!category) return;

  const expectedAmount = voteQuantity * category.vote_price;
  if (amountPaid < expectedAmount) return;

  let payment = existing;
  if (!payment) {
    const { data: created, error } = await adminSupabase
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
    if (error) throw error;
    payment = created;
  }

  const { error: rpcError } = await adminSupabase.rpc("process_award_vote", {
    p_nominee_id: metadata.nomineeId,
    p_category_id: metadata.categoryId,
    p_payment_id: payment.id,
    p_votes_added: voteQuantity
  });
  if (rpcError) throw rpcError;
}
