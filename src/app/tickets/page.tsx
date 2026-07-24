"use client";

import { useEffect, useState } from "react";
import { Ticket, Users, CheckCircle, Loader2 } from "lucide-react";

type Tier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  seats_covered: number;
  quantity_available: number;
  quantity_sold: number;
  display_order: number;
};

type Step = "select" | "details" | "paying" | "success" | "error";

export default function TicketsPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [step, setStep] = useState<Step>("select");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetch("/api/tickets/tiers")
      .then(r => r.json())
      .then(data => {
        setTiers(data.tiers ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (ref && !verifying) {
      setVerifying(true);
      setStep("paying");
      fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref })
      })
        .then(r => r.json())
        .then(data => {
          if (data.processed) {
            setTicketCode(data.ticket_code ?? "");
            setStep("success");
          } else {
            setError(data.error ?? "Verification failed.");
            setStep("error");
          }
        })
        .catch(() => {
          setError("Network error during verification.");
          setStep("error");
        });
    }
  }, []);

  async function handlePurchase() {
    if (!selectedTier) return;
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep("paying");

    const res = await fetch("/api/tickets/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tierId: selectedTier.id,
        buyerName: form.name,
        buyerEmail: form.email,
        buyerPhone: form.phone
      })
    });

    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      setError(data.error ?? "Payment initialization failed.");
      setStep("details");
    }
  }

  const soldOut = (tier: Tier) => tier.quantity_sold >= tier.quantity_available;
  const remaining = (tier: Tier) => tier.quantity_available - tier.quantity_sold;

  if (step === "paying") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-[#D4AF37] mb-4" size={40} />
          <p className="font-semibold text-[#0B132B]">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm w-full max-w-sm text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-black text-[#0B132B] mb-2">Ticket Confirmed!</h2>
          <p className="text-slate-500 mb-4">Your ticket has been confirmed. Check your email for details.</p>
          {ticketCode && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-slate-400 mb-1">Ticket Code</p>
              <p className="text-lg font-black text-[#0B132B] tracking-widest">{ticketCode}</p>
            </div>
          )}
          <a href="/" className="inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#0B132B]">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm w-full max-w-sm text-center">
          <p className="text-rose-500 font-black text-lg mb-2">Payment Failed</p>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => { setStep("select"); setError(""); }}
            className="rounded-full bg-[#0B132B] px-6 py-3 text-sm font-black text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (step === "details" && selectedTier) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] px-4 py-12">
        <div className="max-w-sm mx-auto">
          <button onClick={() => setStep("select")} className="text-sm font-semibold text-slate-500 mb-6 flex items-center gap-1">
            ← Back
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-1">{selectedTier.name}</p>
            <p className="text-2xl font-black text-[#0B132B]">₦{selectedTier.price.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{selectedTier.seats_covered} seat{selectedTier.seats_covered > 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-black text-[#0B132B]">Your Details</h2>
            {error && <p className="text-rose-500 text-sm font-semibold">{error}</p>}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Amaka Nwosu"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="08012345678"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              onClick={handlePurchase}
              className="w-full rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#0B132B] hover:bg-[#C9A227]"
            >
              Pay ₦{selectedTier.price.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-4">
            <Ticket size={14} className="text-[#D4AF37]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">FUL Night 2026</span>
          </div>
          <h1 className="text-3xl font-black text-[#0B132B] mb-2">Get Your Ticket</h1>
          <p className="text-slate-500">Select a ticket tier to attend the Mr & Miss FUL Night 2026.</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 font-semibold">No tickets available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tiers
              .sort((a, b) => a.display_order - b.display_order)
              .map(tier => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                    soldOut(tier)
                      ? "border-slate-100 opacity-60"
                      : "border-slate-200 hover:border-[#D4AF37]/50 cursor-pointer"
                  }`}
                  onClick={() => !soldOut(tier) && (setSelectedTier(tier), setStep("details"))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-[#0B132B] text-lg">{tier.name}</p>
                      {tier.description && <p className="text-sm text-slate-500 mt-0.5">{tier.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <Users size={12} />
                          {tier.seats_covered} seat{tier.seats_covered > 1 ? "s" : ""}
                        </span>
                        {!soldOut(tier) && (
                          <span className="text-xs font-semibold text-slate-400">{remaining(tier)} left</span>
                        )}
                        {soldOut(tier) && (
                          <span className="text-xs font-black text-rose-500">SOLD OUT</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0B132B]">₦{tier.price.toLocaleString()}</p>
                      {!soldOut(tier) && (
                        <button className="mt-2 rounded-full bg-[#D4AF37] px-4 py-1.5 text-xs font-black text-[#0B132B]">
                          Get Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
