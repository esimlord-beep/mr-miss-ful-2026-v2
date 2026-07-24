"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";

export default function CheckInLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/checkin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (data.success) {
      router.push("/checkin");
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <QrCode className="mx-auto text-[#D4AF37] mb-3" size={40} />
          <h1 className="text-2xl font-black text-white">Gate Staff Login</h1>
          <p className="text-white/50 text-sm mt-1">Mr & Miss FUL Night 2026</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6">
          {error && <p className="text-rose-400 text-sm font-semibold mb-4">{error}</p>}
          <label className="block text-xs font-black uppercase tracking-widest text-white/50 mb-2">
            Staff Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            autoFocus
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white font-semibold outline-none focus:border-[#D4AF37] placeholder:text-white/30 mb-3"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !password.trim()}
            className="w-full rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#0B132B] disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </div>
      </div>
    </div>
  );
}
