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
  recaptchaToken: z.string().optional()
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return true;
  try {
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`
    });
    const data = await res.json();
    return data.success && data.score >= 0.5;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
              request.headers.get("x-real-ip") ||
              "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({
      error: "Too many requests. Please wait 10 minutes before trying again."
    }, { status: 429 });
  }

  if (!adminSupabase) return NextResponse.json({ error: "Server error." }, { status: 500 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please complete all fields correctly." }, { status: 400 });

  if (parsed.data.recaptchaToken) {
    const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot detected. Please try again." }, { status: 403 });
    }
  }

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
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/awards/complete`,
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
