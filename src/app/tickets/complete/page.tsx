"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PartyPopper, XCircle, Loader2 } from "lucide-react";

function TicketCompleteContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("tx_ref");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference was found.");
      return;
    }

    fetch("/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference })
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Verification failed.");
        setStatus("success");
        setTicketCode(result.ticket_code ?? null);
        setMessage("Your ticket has been confirmed.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Ticket verification failed.");
      });
  }, [reference]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#FAF9F6] p-4">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-[#0B132B]/[0.08] bg-white p-8 text-center shadow-xl shadow-[#0B132B]/[0.08]">
        <p className="font-rounded text-xs font-bold uppercase tracking-[0.22em] text-[#B8901F] mb-2">Mr &amp; Miss FUL 2026</p>

        {status === "loading" && (
          <>
            <Loader2 size={40} strokeWidth={2} className="mx-auto mb-4 animate-spin text-[#D4AF37]" />
            <h1 className="font-rounded text-xl font-bold text-[#0B132B]">Verifying your ticket...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10"
              style={{ filter: "drop-shadow(0 4px 10px rgba(212,175,55,0.25))" }}
            >
              <PartyPopper size={30} strokeWidth={1.75} className="text-[#B8901F]" />
            </div>
            <h1 className="font-rounded text-2xl font-extrabold text-[#0B132B]">Ticket Confirmed!</h1>
            <p className="text-[#0B132B]/55 mt-2 font-medium">{message}</p>
            {ticketCode && (
              <p className="mt-3 rounded-xl bg-[#FAF9F6] border border-[#0B132B]/[0.08] px-4 py-3 font-rounded text-lg font-bold tracking-wider text-[#0B132B]">
                {ticketCode}
              </p>
            )}
            <p className="text-[#0B132B]/45 mt-2 text-xs">Check your email for the full ticket details.</p>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B132B] shadow-lg shadow-[#D4AF37]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/30">
              Back to Home
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle size={30} strokeWidth={1.75} className="text-red-500" />
            </div>
            <h1 className="font-rounded text-2xl font-extrabold text-[#0B132B]">Something went wrong</h1>
            <p className="text-[#0B132B]/55 mt-2 font-medium">{message}</p>
            <Link href="/tickets" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0B132B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B132B]/90">
              Back to Tickets
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default function TicketCompletePage() {
  return (
    <Suspense>
      <TicketCompleteContent />
    </Suspense>
  );
}
