"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("tx_ref");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
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
        setStatus("success");
        setMessage("Your votes have been added successfully.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Payment verification failed.");
      });
  }, [reference]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-900 p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600 mb-2">Mr & Miss FUL 2026</p>

        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-black text-slate-900">Verifying your payment...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-black text-slate-900">Vote Counted!</h1>
            <p className="text-slate-500 mt-2 font-medium">{message}</p>
            <Link href="/" className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-white hover:bg-amber-600">
              Back to Voting
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 mt-2 font-medium">{message}</p>
            <Link href="/" className="mt-6 inline-block rounded-full bg-slate-800 px-6 py-3 text-sm font-black text-white hover:bg-slate-900">
              Back to Voting
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense>
      <PaymentCompleteContent />
    </Suspense>
  );
}
