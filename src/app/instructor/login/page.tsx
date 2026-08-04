"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default function InstructorLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/instructor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (data.success) {
      router.push("/instructor");
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ClipboardList className="mx-auto text-[#D4AF37] mb-3" size={40} />
          <h1 className="text-2xl font-black text-white">Instructor Login</h1>
          <p className="text-white/50 text-sm mt-1">Mr & Miss FUL Night 2026</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <p className="text-rose-400 text-sm font-semibold text-center">{error}</p>
          )}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-1.5">
              Instructor Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter password"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-semibold text-white outline-none focus:border-[#D4AF37] placeholder:text-white/30"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-black text-[#0B132B] transition disabled:opacity-60"
          >
            {loading ? "Checking..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
