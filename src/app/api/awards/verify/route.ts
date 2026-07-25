import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackReference } from "@/lib/paystack";
import { verifyFlutterwaveReference } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";

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
  return "Verification failed.";
}

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
  if (!adminSupabase) return "paystack";
  const { data } = await adminSupabase.from("settings").select("payment_provider").maybeSingle();
  return data?.payment_provider === "flutterwave" ? "flutterwave" : "paystack";
}

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
    const provider = await getActiveProvider();
    const verifyFn = provider === "flutterwave" ? verifyFlutterwaveReference : verifyPaystackReference;
    const verification = await verifyFn(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
    }

    // Paystack normally returns metadata as a parsed object, but some
    // payment channels (observed with bank_transfer / OPay) return it as a
    // raw JSON string instead. Handle both so categoryId/nomineeId aren't
    // silently lost just because of the channel used.
    let metadata: any = verification.data.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (parseError) {
        console.error("Failed to parse string metadata from Paystack (award)", {
          reference,
          rawMetadata: metadata,
          parseError
        });
        metadata = null;
      }
    }

    if (!metadata?.categoryId || !metadata?.nomineeId) {
      console.error("Missing categoryId/nomineeId in award payment metadata", {
        reference,
        provider,
        rawMetadata: verification.data.metadata,
        parsedMetadata: metadata
      });
      return NextResponse.json({ error: "Payment record is missing category or nominee information." }, { status: 500 });
    }

    const voteQuantity = Number(metadata.voteQuantity);
    const amountPaid = Number(verification.data.amount) / (provider === "flutterwave" ? 1 : 100);

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

      if (paymentError) {
        console.error("Failed to insert award_payments row", paymentError);
        throw paymentError;
      }
      payment = createdPayment;
    }

    const { error: rpcError } = await adminSupabase.rpc("process_award_vote", {
      p_nominee_id: metadata.nomineeId,
      p_category_id: metadata.categoryId,
      p_payment_id: payment.id,
      p_votes_added: voteQuantity
    });

    if (rpcError) {
      console.error("process_award_vote RPC failed", {
        rpcError,
        nomineeId: metadata.nomineeId,
        categoryId: metadata.categoryId,
        paymentId: payment.id,
        voteQuantity
      });
      throw rpcError;
    }

    return NextResponse.json({ processed: true, votes_added: voteQuantity });
  } catch (error) {
    console.error("Award verification error", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
