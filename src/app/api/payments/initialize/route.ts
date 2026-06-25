import { NextResponse } from "next/server";
import { z } from "zod";
import { isVotingOpen, votePrice } from "@/lib/config";
import { initializePaystackPayment } from "@/lib/paystack";

const schema = z.object({
  candidateId: z.string().min(1),
  payerName: z.string().min(2),
  payerEmail: z.string().email(),
  payerPhone: z.string().min(7),
  voteQuantity: z.number().int().min(1).max(1000),
  recaptchaToken: z.string().optional()
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return true; // Skip if not configured
  
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
  if (!isVotingOpen) return NextResponse.json({ error: "Voting is currently closed." }, { status: 403 });

  // Get IP for rate limiting
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
  if (!parsed.success) return NextResponse.json({ error: "Please complete all payment fields." }, { status: 400 });

  // Verify reCAPTCHA
  if (parsed.data.recaptchaToken) {
    const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot detected. Please try again." }, { status: 403 });
    }
  }

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
