import { NextResponse } from "next/server";
import crypto from "crypto";
import { votePrice } from "@/lib/config";
import { adminSupabase } from "@/lib/supabase";
import { sendVoteConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !adminSupabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.reference;
  const metadata = event.data.metadata || {};
  const amountPaid = Number(event.data.amount) / 100;

  try {
    if (metadata.type === "award") {
      await processAwardVote(reference, metadata, amountPaid);
    } else {
      await processMainVote(reference, metadata, amountPaid);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
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

  const { data: candidate } = await adminSupabase
    .from("contestants")
    .select("name")
    .eq("id", metadata.candidateId)
    .maybeSingle();

  await sendVoteConfirmationEmail({
    to: metadata.payerEmail,
    payerName: metadata.payerName,
    votedFor: candidate?.name || "your chosen contestant",
    voteQuantity,
    amountPaid,
    reference,
    type: "main"
  });
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

  const { data: nominee } = await adminSupabase
    .from("award_nominees")
    .select("name")
    .eq("id", metadata.nomineeId)
    .maybeSingle();

  await sendVoteConfirmationEmail({
    to: metadata.payerEmail,
    payerName: metadata.payerName,
    votedFor: nominee?.name || "your chosen nominee",
    voteQuantity,
    amountPaid,
    reference,
    type: "award"
  });
}
