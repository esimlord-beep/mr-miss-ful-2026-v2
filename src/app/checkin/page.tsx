"use client";

import { useState, useRef } from "react";
import { CheckCircle, XCircle, Loader2, QrCode } from "lucide-react";

type ScanResult = {
  success: boolean;
  message: string;
  ticket_code?: string;
  buyer_name?: string;
  tier_name?: string;
  seats_covered?: number;
  already_checked_in?: boolean;
  checked_in_at?: string;
};

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleScan(qrToken: string) {
    if (!qrToken.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_token: qrToken.trim() })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
    setToken("");
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-[#0B132B] px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <QrCode className="mx-auto text-[#D4AF37] mb-3" size={40} />
          <h1 className="text-2xl font-black text-white">Gate Check-In</h1>
          <p className="text-white/50 text-sm mt-1">Mr & Miss FUL Night 2026</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <label className="block text-xs font-black uppercase tracking-widest text-white/50 mb-2">
            Scan or Enter QR Token
          </label>
          <input
            ref={inputRef}
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleScan(token)}
            placeholder="Scan QR code here..."
            autoFocus
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white font-semibold outline-none focus:border-[#D4AF37] placeholder:text-white/30 mb-3"
          />
          <button
            onClick={() => handleScan(token)}
            disabled={loading || !token.trim()}
            className="w-full rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#0B132B] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Check In"}
          </button>
        </div>

        {result && (
          <div className={`rounded-2xl p-6 ${
            result.success
              ? "bg-green-500/10 border border-green-500/30"
              : result.already_checked_in
              ? "bg-amber-500/10 border border-amber-500/30"
              : "bg-rose-500/10 border border-rose-500/30"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <CheckCircle className="text-green-400 flex-shrink-0" size={28} />
              ) : (
                <XCircle className="text-rose-400 flex-shrink-0" size={28} />
              )}
              <p className={`font-black text-lg ${
                result.success ? "text-green-400" : result.already_checked_in ? "text-amber-400" : "text-rose-400"
              }`}>
                {result.success ? "Admitted!" : result.already_checked_in ? "Already Checked In" : "Denied"}
              </p>
            </div>
            {result.buyer_name && (
              <div className="space-y-2">
                <p className="text-white font-black text-xl">{result.buyer_name}</p>
                {result.tier_name && (
                  <p className="text-white/70 text-sm font-semibold">{result.tier_name} · {result.seats_covered} seat{(result.seats_covered ?? 1) > 1 ? "s" : ""}</p>
                )}
                {result.ticket_code && (
                  <p className="text-white/50 text-xs font-mono">{result.ticket_code}</p>
                )}
                {result.already_checked_in && result.checked_in_at && (
                  <p className="text-amber-400 text-sm font-semibold">
                    Checked in at {new Date(result.checked_in_at).toLocaleTimeString("en-NG", { timeStyle: "short" })}
                  </p>
                )}
              </div>
            )}
            <p className="text-white/60 text-sm mt-3">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
