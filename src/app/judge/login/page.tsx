"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase";

export default function JudgeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } = await browserSupabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (loginError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push("/judge");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Judge Login</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Mr & Miss FUL Night 2026</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            Don't have an account yet? <a href="/judge/signup" className="text-slate-700 font-bold underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
