"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">FUL AWARDS 2026</p>

        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-black text-slate-900">Verifying your vote...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-slate-900">Vote Counted!</h2>
            <p className="text-slate-500 mt-2 font-medium">{message}</p>
            <a href="/awards" className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-white hover:bg-amber-600">
              Back to Awards
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-black text-slate-900">Something went wrong</h2>
            <p className="text-slate-500 mt-2 font-medium">{message}</p>
            <a href="/awards" className="mt-6 inline-block rounded-full bg-slate-800 px-6 py-3 text-sm font-black text-white hover:bg-slate-900">
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
