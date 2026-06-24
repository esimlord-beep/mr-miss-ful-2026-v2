"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Hero } from "@/components/hero";
import { Podium } from "@/components/podium";
import { ProfileOverlay } from "@/components/profile-overlay";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-200">
      <Hero 
        onExplore={() => contestantsRef.current?.scrollIntoView({ behavior: "smooth" })} 
        siteSettings={siteSettings} 
      />

      {votingClosed && (
        <div className="bg-red-50 border-b border-red-200 py-3 text-center">
          <p className="text-sm font-bold text-red-600">🔒 Voting is currently closed.</p>
        </div>
      )}
      
      <main ref={contestantsRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {topContestants.length > 0 && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Live Leaderboard</h2>
              <p className="text-xs text-slate-400 font-medium">Currently leading the ranks</p>
            </div>
            <Podium contestants={topContestants} />
          </div>
        )}

        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">All Contestants</h2>
          </div>

          {filteredContestants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
              <p className="text-slate-500 font-medium">No contestants found in the system.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContestants.map((contestant) => (
                <div 
                  key={contestant.id} 
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-[4/5] w-full bg-slate-100 relative">
                    {contestant.photo_url ? (
                      <img
                        src={contestant.photo_url}
                        alt={contestant.full_name || contestant.name || "Contestant Image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 font-medium">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="p-6 text-slate-900">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {contestant.full_name || contestant.name || "Unnamed Contestant"}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 tracking-wider uppercase mb-3">
                      {contestant.department || contestant.faculty || "General / Student"}
                    </p>
                    
                    {(contestant.bio || contestant.description) && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                        {contestant.bio || contestant.description}
                      </p>
                    )}

                    <div className="flex flex-col space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Votes</p>
                          <p className="text-lg font-black text-slate-800">{contestant.votes ?? 0}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setViewingProfileOf(contestant)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => openVoteModal(contestant)}
                          disabled={votingClosed}
                          className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-colors text-center ${
                            votingClosed 
                              ? "bg-slate-300 cursor-not-allowed" 
                              : "bg-amber-500 shadow-amber-500/10 hover:bg-amber-600 cursor-pointer"
                          }`}
                        >
                          {votingClosed ? "Voting Closed" : "Vote Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {votingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-amber-500 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Cast Your Vote</h3>
              <button onClick={closeVoteModal} className="text-white hover:text-amber-100 font-bold text-sm bg-amber-600/50 w-7 h-7 rounded-full flex items-center justify-center">✕</button>
            </div>

            <form onSubmit={handleFinalVoteSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Voting For</p>
                <p className="font-bold text-slate-800 text-base">{votingFor.full_name || votingFor.name}</p>
              </div>
              <hr className="border-slate-100" />
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input type="text" required placeholder="John Doe" value={payerName} onChange={(e) => setPayerName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" required placeholder="johndoe@gmail.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input type="tel" required placeholder="08012345678" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Number of Votes</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => setVoteQuantity(Math.max(1, voteQuantity - 1))} className
