import { NextResponse } from "next/server";
import { z } from "zod";
import { initializePaystackPayment } from "@/lib/paystack";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  nomineeId: z.string().min(1),
  categoryId: z.string().min(1),
  payerName: z.string().min(2),
  payerEmail: z.string().email(),
  payerPhone: z.string().min(7),
  voteQuantity: z.number().int().min(1).max(1000),
});

export async function POST(request: Request) {
  if (!adminSupabase) return NextResponse.json({ error: "Server error." }, { status: 500 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please complete all fields correctly." }, { status: 400 });

  const { data: category } = await adminSupabase
    .from("award_categories")
    .select("vote_price, is_active")
    .eq("id", parsed.data.categoryId)
    .single();

  if (!category || !category.is_active) {
    return NextResponse.json({ error: "This award category is not active." }, { status: 400 });
  }

  const reference = `AWARD2026-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const amount = parsed.data.voteQuantity * category.vote_price;

  try {
    const result = await initializePaystackPayment({
      email: parsed.data.payerEmail,
      amount,
      reference,
      metadata: {
        type: "award",
        nomineeId: parsed.data.nomineeId,
        categoryId: parsed.data.categoryId,
        payerName: parsed.data.payerName,
        payerEmail: parsed.data.payerEmail,
        payerPhone: parsed.data.payerPhone,
        voteQuantity: parsed.data.voteQuantity
      }
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment failed." }, { status: 500 });
  }
}
