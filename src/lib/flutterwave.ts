export async function verifyFlutterwaveReference(reference: string) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store"
    }
  );

  if (!response.ok) throw new Error("Unable to verify Flutterwave transaction");
  const result = await response.json();

  return {
    data: {
      status: result.data?.status === "successful" ? "success" : "failed",
      amount: result.data?.amount,
      metadata: result.data?.meta || {}
    }
  };
}

export async function initializeFlutterwavePayment(payload: {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
  callback_url?: string;
}) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");

  const callbackUrl = payload.callback_url ??
    `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/payment/complete`;

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tx_ref: payload.reference,
      amount: payload.amount,
      currency: "NGN",
      redirect_url: callbackUrl,
      customer: {
        email: payload.email
      },
      meta: payload.metadata
    })
  });

  if (!response.ok) throw new Error("Unable to initialize Flutterwave transaction");
  const result = await response.json();

  return {
    data: {
      authorization_url: result.data?.link
    }
  };
}
