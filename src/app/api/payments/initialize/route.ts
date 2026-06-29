import { NextResponse } from "next/server";
import { z } from "zod";
import { votePrice } from "@/lib/config";
import { initializePaystackPayment } from "@/lib/paystack";
import { initializeFlutterwavePayment } from "@/lib/flutterwave";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
 candidateId: z.string().min(1),
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

async function getActiveProvider(): Promise<"paystack" | "flutterwave"> {
 if (!adminSupabase) return "paystack";
 const { data } = await adminSupabase.from("settings").select("payment_provider").maybeSingle();
 return data?.payment_provider === "flutterwave" ? "flutterwave" : "paystack";
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

 const body = await request.json();
 const parsed = schema.safeParse(body);
 if (!parsed.success) return NextResponse.json({ error: "Please complete all payment fields correctly." }, { status: 400 });

 if (parsed.data.recaptchaToken) {
   const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken);
   if (!isHuman) {
     return NextResponse.json({ error: "Bot detected. Please try again." }, { status: 403 });
   }
 }

 const reference = `FUL2026-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
 const amount = parsed.data.voteQuantity * votePrice;
 const provider = await getActiveProvider();

 try {
   const initializeFn = provider === "flutterwave" ? initializeFlutterwavePayment : initializePaystackPayment;

   const result = await initializeFn({
     email: parsed.data.payerEmail,
     amount,
     reference,
     metadata: {
       candidateId: parsed.data.candidateId,
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
   return NextResponse.json({ error: error instanceof Error ? error.message : "Payment initialization failed." }, { status: 500 });
 }
}
