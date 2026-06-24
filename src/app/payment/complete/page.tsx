"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentCompletePage() {
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) {
      setMessage("No payment reference was found.");
      return;
    }

    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference })
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Verification failed.");
        setMessage("Payment verified. Your votes have been added.");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Payment verification failed."));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-page p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-premium">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Mr & Miss FUL 2026</p>
        <h1 className="mt-3 text-3xl font-black text-navy">{message}</h1>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
          Back to voting
        </Link>
      </section>
    </main>
  );
}
