import { NextResponse } from "next/server";
import { z } from "zod";
import { initializePaystackPayment } from "@/lib/paystack";
import { initializeFlutterwavePayment } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  tierId: z.string().min(1),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(7),
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

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
  if (!adminSupabase) return "paystack";
  const { data } = await adminSupabase.from("settings").select("payment_provider").maybeSingle();
  return data?.payment_provider === "flutterwave" ? "flutterwave" : "paystack";
}

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({
      error: "Too many requests. Please wait 10 minutes before trying again."
    }, { status: 429 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please complete all fields correctly." }, { status: 400 });

  if (parsed.data.recaptchaToken) {
    const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot detected. Please try again." }, { status: 403 });
    }
  }

  // Look up the tier to get the real price and seat count server-side —
  // never trust a price sent from the client.
  const { data: tier, error: tierError } = await adminSupabase
    .from("ticket_tiers")
    .select("*")
    .eq("id", parsed.data.tierId)
    .eq("is_active", true)
    .maybeSingle();

  if (tierError || !tier) {
    return NextResponse.json({ error: "Selected ticket tier was not found." }, { status: 404 });
  }

  if (tier.quantity_sold >= tier.quantity_available) {
    return NextResponse.json({ error: "This ticket tier is sold out." }, { status: 409 });
  }

  const reference = `FUL2026-TICKET-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const provider = await getActiveProvider();

  try {
    const initializeFn = provider === "flutterwave" ? initializeFlutterwavePayment : initializePaystackPayment;

    const result = await initializeFn({
      email: parsed.data.buyerEmail,
      amount: tier.price,
      reference,
      metadata: {
        type: "ticket",
        tierId: tier.id,
        buyerName: parsed.data.buyerName,
        buyerEmail: parsed.data.buyerEmail,
        buyerPhone: parsed.data.buyerPhone
      }
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment initialization failed." }, { status: 500 });
  }
}
