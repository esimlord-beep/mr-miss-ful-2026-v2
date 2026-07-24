import { NextResponse } from "next/server";
import { z } from "zod";
import { votePrice } from "@/lib/config";
import { verifyPaystackReference } from "@/lib/paystack";
import { verifyFlutterwaveReference } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";
import { sendVoteConfirmationEmail } from "@/lib/email";

const schema = z.object({
  reference: z.string().min(6)
});

// Extracts a readable message from any thrown value, including
// Supabase's PostgrestError which is a plain object, not an Error instance.
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
  return "Payment verification failed.";
}

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
  if (!adminSupabase) return "paystack";
  const { data } = await adminSupabase
    .from("settings")
    .select("payment_provider")
    .maybeSingle();
  return data?.payment_provider === "flutterwave"
    ? "flutterwave"
    : "paystack";
}

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 500 }
    );
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid transaction reference." },
      { status: 400 }
    );
  }

  const reference = parsed.data.reference;

  const existing = await adminSupabase
    .from("payments")
    .select("id, processed")
    .eq("transaction_reference", reference)
    .maybeSingle();

  if (existing.data?.processed) {
    return NextResponse.json({
      processed: true,
      message: "Transaction already processed."
    });
  }

  try {
    const provider = await getActiveProvider();
    const verifyFn =
      provider === "flutterwave"
        ? verifyFlutterwaveReference
        : verifyPaystackReference;

    const verification = await verifyFn(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful." },
        { status: 400 }
      );
    }

    // Paystack normally returns metadata as a parsed object, but some
    // payment channels (observed with bank_transfer / OPay) return it as a
    // raw JSON string instead. Handle both so candidateId isn't silently
    // lost just because of the channel used.
    let metadata: any = verification.data.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (parseError) {
        console.error("Failed to parse string metadata from Paystack", {
          reference,
          rawMetadata: metadata,
          parseError
        });
        metadata = null;
      }
    }

    if (!metadata?.candidateId) {
      console.error("Missing candidateId in payment metadata", {
        reference,
        provider,
        rawMetadata: verification.data.metadata,
        parsedMetadata: metadata
      });
      return NextResponse.json(
        { error: "Payment record is missing candidate information." },
        { status: 500 }
      );
    }

    const voteQuantity = Number(metadata.voteQuantity);
    const amountPaid =
      Number(verification.data.amount) /
      (provider === "flutterwave" ? 1 : 100);
    const expectedAmount = voteQuantity * votePrice;

    if (amountPaid < expectedAmount) {
      return NextResponse.json(
        { error: "Paid amount does not match vote quantity." },
        { status: 400 }
      );
    }

    let payment = existing.data;
    if (!payment) {
      const { data: createdPayment, error: paymentError } =
        await adminSupabase
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

      if (paymentError) {
        console.error("Failed to insert payment row", paymentError);
        throw paymentError;
      }
      payment = createdPayment;
    }

    const { error: rpcError } = await adminSupabase.rpc(
      "process_verified_vote",
      {
        p_candidate_id: metadata.candidateId,
        p_payment_id: payment.id,
        p_votes_added: voteQuantity
      }
    );

    if (rpcError) {
      console.error("process_verified_vote RPC failed", {
        rpcError,
        candidateId: metadata.candidateId,
        paymentId: payment.id,
        voteQuantity
      });
      throw rpcError;
    }

    const { data: candidate } = await adminSupabase
      .from("contestants")
      .select("name")
      .eq("id", metadata.candidateId)
      .maybeSingle();

    // Email failures should not make a successfully-recorded vote look like
    // a failed payment to the user — log and continue instead of throwing.
    try {
      await sendVoteConfirmationEmail({
        to: metadata.payerEmail,
        payerName: metadata.payerName,
        votedFor: candidate?.name || "your chosen contestant",
        voteQuantity,
        amountPaid,
        reference,
        type: "main",
        provider
      });
    } catch (emailError) {
      console.error("Vote confirmation email failed to send", emailError);
    }

    return NextResponse.json({
      processed: true,
      votes_added: voteQuantity
    });
  } catch (error) {
    console.error("Payment verification error", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
