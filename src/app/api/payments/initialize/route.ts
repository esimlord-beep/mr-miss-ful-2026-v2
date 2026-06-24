import { NextResponse } from "next/server";
import { z } from "zod";
import { isVotingOpen, votePrice } from "@/lib/config";
import { initializePaystackPayment } from "@/lib/paystack";

const schema = z.object({
  candidateId: z.string().min(1),
  payerName: z.string().min(2),
  payerEmail: z.string().email(),
  payerPhone: z.string().min(7),
  voteQuantity: z.number().int().min(1).max(1000)
});

export async function POST(request: Request) {
  if (!isVotingOpen) return NextResponse.json({ error: "Voting is currently closed." }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete all payment fields." }, { status: 400 });

  const reference = `FUL2026-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const amount = parsed.data.voteQuantity * votePrice;

  try {
    const result = await initializePaystackPayment({
      email: parsed.data.payerEmail,
      amount,
      reference,
      metadata: parsed.data
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment initialization failed." }, { status: 500 });
  }
}
