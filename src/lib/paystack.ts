export async function verifyPaystackReference(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Unable to verify Paystack transaction");
  return response.json();
}

export async function initializePaystackPayment(payload: {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: payload.email,
      amount: payload.amount * 100,
      reference: payload.reference,
      callback_url: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/payment/complete`,
      metadata: payload.metadata
    })
  });

  if (!response.ok) throw new Error("Unable to initialize Paystack transaction");
  return response.json();
}
