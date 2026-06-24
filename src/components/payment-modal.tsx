"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { isVotingOpen, votePrice } from "@/lib/config";
import type { Contestant } from "@/types";

export function PaymentModal({
  contestant,
  onClose
}: {
  contestant: Contestant | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", quantity: "1" });
  const [message, setMessage] = useState("");
  if (!contestant) return null;

  const total = Math.max(1, Number(form.quantity) || 0) * votePrice;

  function adjustQuantity(delta: number) {
    setForm((current) => ({
      ...current,
      quantity: String(Math.max(1, (Number(current.quantity) || 1) + delta))
    }));
  }

  async function pay() {
    if (!isVotingOpen) {
      setMessage("Voting is currently closed.");
      return;
    }
    setMessage("Preparing secure payment...");
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: contestant!.id,
        payerName: form.name,
        payerEmail: form.email,
        payerPhone: form.phone,
        voteQuantity: Math.max(1, Number(form.quantity) || 1)
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Unable to start payment.");
      return;
    }
    window.location.href = result.authorization_url;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-premium">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Secure payment</p>
            <h2 className="text-xl font-black text-navy">Vote for {contestant.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close payment" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {[
            ["Full Name", "name", "text"],
            ["Email Address", "email", "email"],
            ["Phone Number", "phone", "tel"]
          ].map(([label, key, type]) => (
            <label key={key} className="block">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <input
                type={type}
                value={form[key as "name" | "email" | "phone"]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-primary"
              />
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Number of Votes</span>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-xl font-black text-slate-700"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onFocus={(event) => event.target.select()}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                onBlur={() => setForm((current) => ({ ...current, quantity: String(Math.max(1, Number(current.quantity) || 1)) }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-xl font-black text-slate-700"
              >
                +
              </button>
            </div>
          </label>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Total</p>
            <p className="text-4xl font-black text-primary">₦{total.toLocaleString()}</p>
          </div>
          {message && <p className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-primary">{message}</p>}
          <button onClick={pay} className="w-full rounded-full bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-blue-950">
            Continue to Paystack
          </button>
        </div>
      </div>
    </div>
  );
}
