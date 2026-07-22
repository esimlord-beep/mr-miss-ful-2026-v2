"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PartyPopper, XCircle, Loader2 } from "lucide-react";

function AwardCompleteContent() {
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
      setMessage("No payment reference found.");
      return;
    }

    fetch("/api/awards/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference })
    })
      .then(res => res.json())
      .then(data => {
        if (data.processed) {
          setStatus("success");
          setMessage(`Your vote has been counted! ${data.votes_added ? `${data.votes_added} vote(s) added.` : ""}`);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please contact support.");
      });
  }, [reference]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-3xl" />

      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl shadow-[#0B132B]/[0.08] border border-[#0B132B]/[0.08]">
        <p className="font-rounded text-xs font-bold uppercase tracking-widest text-[#B8901F] mb-2">FUL Awards 2026</p>

        {status === "loading" && (
          <>
            <Loader2 size={40} strokeWidth={2} className="mx-auto mb-4 animate-spin text-[#D4AF37]" />
            <h2 className="font-rounded text-xl font-bold text-[#0B132B]">Verifying your vote...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10">
              <PartyPopper size={30} strokeWidth={1.75} className="text-[#B8901F]" />
            </div>
            <h2 className="font-rounded text-2xl font-extrabold text-[#0B132B]">Vote Counted!</h2>
            <p className="text-[#0B132B]/55 mt-2 font-medium">{message}</p>
            <a href="/awards" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B132B] shadow-lg shadow-[#D4AF37]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/30">
              Back to Awards
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle size={30} strokeWidth={1.75} className="text-red-500" />
            </div>
            <h2 className="font-rounded text-2xl font-extrabold text-[#0B132B]">Something went wrong</h2>
            <p className="text-[#0B132B]/55 mt-2 font-medium">{message}</p>
            <a href="/awards" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0B132B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B132B]/90">
              Back to Awards
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function AwardCompletePage() {
  return (
    <Suspense>
      <AwardCompleteContent />
    </Suspense>
  );
}
