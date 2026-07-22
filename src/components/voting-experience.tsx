"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { Lock, X, Eye } from "lucide-react";
import { Hero } from "@/components/hero";
import { Podium } from "@/components/podium";
import { ProfileOverlay } from "@/components/profile-overlay";
import { Sponsors } from "@/components/sponsors";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export function VotingExperience({ 
  initialContestants = [], 
  siteSettings 
}: { 
  initialContestants: any[]; 
  siteSettings: any; 
}) {
  const contestantsRef = useRef<HTMLDivElement>(null);
  
  const [votingFor, setVotingFor] = useState<any | null>(null);
  const [viewingProfileOf, setViewingProfileOf] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [voteQuantity, setVoteQuantity] = useState(1);

  const votingClosed = siteSettings?.voting_status === "closed";
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [siteKey]);

  const filteredContestants = initialContestants;

  const topContestants = useMemo(() => {
    return [...initialContestants]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3);
  }, [initialContestants]);

  const openVoteModal = (contestant: any) => {
    if (votingClosed) return;
    setVotingFor(contestant);
    setVoteQuantity(1);
  };

  const closeVoteModal = () => {
    setVotingFor(null);
    setPayerName("");
    setPayerEmail("");
    setPayerPhone("");
  };

  const handleFinalVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!votingFor) return;

    try {
      setLoading(true);

      let recaptchaToken = "";
      if (siteKey && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "vote" });
      }

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          candidateId: votingFor.id,
          payerName,
          payerEmail,
          payerPhone,
          voteQuantity,
          recaptchaToken
        }),
      });
      
      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data?.error || "Failed to initialize payment gateway. Please try again.");
      }
    } catch (err) {
      console.error("Voting error:", err);
      alert("Something went wrong initializing your vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#0B132B] selection:bg-[#D4AF37]/30">
      <Hero 
        onExplore={() => contestantsRef.current?.scrollIntoView({ behavior: "smooth" })} 
        onVote={() => contestantsRef.current?.scrollIntoView({ behavior: "smooth" })}
        siteSettings={siteSettings} 
      />

      {votingClosed && (
        <div className="border-b py-3 text-center flex items-center justify-center gap-1.5" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
          <Lock size={13} strokeWidth={2.5} className="text-red-500" />
          <p className="text-sm font-bold text-red-600">Voting is currently closed.</p>
        </div>
      )}

      {/* Live Leaderboard */}
      {topContestants.length > 0 && (
        <RevealOnScroll>
          <section className="bg-[#F5F3EE] pb-14 px-4 sm:px-6 -mt-16 relative z-10">
            <div className="mx-auto max-w-3xl bg-white p-8 rounded-3xl border border-[#0B132B]/[0.06] shadow-xl shadow-[#0B132B]/[0.06]">
              <div className="text-center mb-6">
                <h2 className="font-rounded text-2xl font-extrabold tracking-tight text-[#0B132B]">Live Leaderboard</h2>
                <p className="text-xs text-[#0B132B]/40 font-medium">Currently leading the ranks</p>
              </div>
              <Podium contestants={topContestants} />
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* Featured Contestants */}
      <main ref={contestantsRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        <div>
          <RevealOnScroll className="mb-6">
            <h2 className="font-rounded text-xl font-bold text-[#0B132B]">Featured Contestants</h2>
          </RevealOnScroll>

          {filteredContestants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04] max-w-md mx-auto">
              <p className="text-[#0B132B]/50 font-medium">No contestants found in the system.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContestants.map((contestant, index) => (
                <RevealOnScroll key={contestant.id} delay={(index % 3) * 80}>
                <div 
                  className="overflow-hidden rounded-2xl border border-[#0B132B]/[0.06] bg-white shadow-sm shadow-[#0B132B]/[0.04] transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-[#0B132B]/[0.08]"
                >
                  <div className="aspect-[4/5] w-full bg-[#F5F3EE] relative">
                    {contestant.photo_url ? (
                      <Image
                        src={contestant.photo_url}
                        alt={contestant.full_name || contestant.name || "Contestant Image"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#0B132B]/40 font-medium">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="p-6 text-[#0B132B]">
                    <h3 className="font-rounded text-xl font-bold text-[#0B132B] mb-1">
                      {contestant.full_name || contestant.name || "Unnamed Contestant"}
                    </h3>
                    <p className="text-xs font-semibold text-[#B8901F] tracking-wider uppercase mb-3">
                      {contestant.department || contestant.faculty || "General / Student"}
                    </p>
                    
                    {(contestant.bio || contestant.description) && (
                      <p className="text-sm text-[#0B132B]/55 line-clamp-2 mb-6">
                        {contestant.bio || contestant.description}
                      </p>
                    )}

                    <div className="flex flex-col space-y-3 border-t border-[#0B132B]/[0.06] pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#0B132B]/35">Total Votes</p>
                          <p className="text-lg font-black text-[#0B132B]">{contestant.votes ?? 0}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setViewingProfileOf(contestant)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0B132B]/15 px-4 py-2 text-xs font-bold text-[#0B132B] hover:bg-[#0B132B]/[0.03] transition-colors cursor-pointer"
                        >
                          <Eye size={13} strokeWidth={2} />
                          View Profile
                        </button>
                        <button 
                          onClick={() => openVoteModal(contestant)}
                          disabled={votingClosed}
                          className={`rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all text-center ${
                            votingClosed 
                              ? "bg-[#0B132B]/10 text-[#0B132B]/35 cursor-not-allowed" 
                              : "bg-[#D4AF37] text-[#0B132B] shadow-[#D4AF37]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4AF37]/25 cursor-pointer"
                          }`}
                        >
                          {votingClosed ? "Voting Closed" : "Vote Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Sponsors & Partners */}
      <RevealOnScroll>
        <Sponsors sponsors={siteSettings?.sponsors} />
      </RevealOnScroll>

      {votingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B132B]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#0B132B" }}>
              <h3 className="font-rounded font-bold text-lg" style={{ color: "#D4AF37" }}>Cast Your Vote</h3>
              <button onClick={closeVoteModal} className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "rgba(212,175,55,0.2)" }}>
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleFinalVoteSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-[#0B132B]/40 uppercase tracking-wider mb-1">Voting For</p>
                <p className="font-bold text-[#0B132B] text-base">{votingFor.full_name || votingFor.name}</p>
              </div>
              <hr className="border-[#0B132B]/[0.08]" />
              <div>
                <label className="block text-xs font-bold text-[#0B132B]/70 mb-1">Your Full Name</label>
                <input type="text" required placeholder="John Doe" value={payerName} onChange={(e) => setPayerName(e.target.value)} className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B132B]/70 mb-1">Email Address</label>
                <input type="email" required placeholder="johndoe@gmail.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B132B]/70 mb-1">Phone Number</label>
                <input type="tel" required placeholder="08012345678" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B132B]/70 mb-2">Number of Votes</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => setVoteQuantity(Math.max(1, voteQuantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-[#0B132B]" style={{ backgroundColor: "#F5F3EE" }}>-</button>
                  <span className="text-base font-black text-[#0B132B] w-8 text-center">{voteQuantity}</span>
                  <button type="button" onClick={() => setVoteQuantity(Math.min(1000, voteQuantity + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-[#0B132B]" style={{ backgroundColor: "#F5F3EE" }}>+</button>
                </div>
              </div>
              <p className="text-xs text-[#0B132B]/40 text-center">Protected by reCAPTCHA</p>
              <button type="submit" disabled={loading} className="w-full rounded-full py-3 text-sm font-semibold shadow-lg transition-all disabled:opacity-70" style={{ backgroundColor: loading ? "#0B132B1A" : "#D4AF37", color: loading ? "#0B132B66" : "#0B132B", boxShadow: loading ? "none" : "0 10px 20px rgba(212,175,55,0.25)" }}>
                {loading ? "Processing Payment..." : "Proceed to Pay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingProfileOf && (
        <ProfileOverlay 
          contestant={viewingProfileOf} 
          onClose={() => setViewingProfileOf(null)} 
          onVote={() => {
            const person = viewingProfileOf;
            setViewingProfileOf(null);
            openVoteModal(person);
          }}
        />
      )}
    </div>
  );
}
