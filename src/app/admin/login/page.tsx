"use client";

import React, { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userEmail = email.trim().toLowerCase();
    const userPass = password.trim();

    if (userEmail === "esimlord09@gmail.com" && userPass === "admin123") {
      // Set the cookies the middleware expects to see
      document.cookie = "sb-access-token=dev-bypass-token; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "supabase-auth-token=dev-bypass-token; path=/; max-age=86400; SameSite=Lax";
      
      // Send you straight to the admin page
      window.location.href = "/admin";
    } else {
      setError("Invalid email or password credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Log in to manage contestants and settings</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email / Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm font-medium"
                placeholder="esimlord09@gmail.com"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
