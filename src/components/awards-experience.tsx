"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function AwardsExperience({
  initialCategories = [],
  initialNominees = {},
  siteSettings
}: {
  initialCategories: any[];
  initialNominees: Record<string, any[]>;
  siteSettings: any;
}) {
  const categories = initialCategories;
  const nominees = initialNominees;
  const settings = siteSettings;

  const [votingFor, setVotingFor] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [voteQuantity, setVoteQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [shareOpenFor, setShareOpenFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const categoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("leadership") || n.includes("executive") || n.includes("president") || n.includes("secretary") || n.includes("treasurer") || n.includes("leader") || n.includes("pro ") || n.includes("director")) return "👑";
    if (n.includes("academic") || n.includes("lecturer") || n.includes("course") || n.includes("tutor")) return "🎓";
    if (n.includes("music") || n.includes("entertain") || n.includes("mc ") || n.includes("comedian")) return "🎤";
    if (n.includes("sport") || n.includes("athlete")) return "⚽";
    if (n.includes("photo")) return "📷";
    if (n.includes("art") || n.includes("fashion") || n.includes("dressed") || n.includes("style")) return "🎭";
    if (n.includes("business") || n.includes("entrepreneur") || n.includes("hustle")) return "💼";
    return "🏆";
  };

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

  const votingClosed = settings?.voting_status === "closed";

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openVoteModal = (nominee: any, category: any) => {
    if (votingClosed) return;
    setVotingFor(nominee);
    setSelectedCategory(category);
    setVoteQuantity(1);
  };

  const closeModal = () => {
    setVotingFor(null);
    setSelectedCategory(null);
    setPayerName("");
    setPayerEmail("");
    setPayerPhone("");
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };

  const getShareText = (nominee: any, category: any) => {
    return `Vote for ${nominee.name} in ${category.name} — FUL Awards 2026!`;
  };

  const handleShare = (platform: "whatsapp" | "twitter" | "copy", nominee: any, category: any) => {
    const url = getShareUrl();
    const text = getShareText(nominee, category);

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url);
      setCopiedId(nominee.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    setShareOpenFor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!votingFor || !selectedCategory) return;
    setProcessing(true);
    try {
      let recaptchaToken = "";
      if (siteKey && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "vote" });
      }

      const res = await fetch("/api/awards/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomineeId: votingFor.id,
          categoryId: selectedCategory.id,
          payerName,
          payerEmail,
          payerPhone,
          voteQuantity,
          recaptchaToken
        })
      });
      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data?.error || "Failed to initialize payment.");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

    return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FC" }}>
      <div className="relative overflow-hidden py-7 px-4 text-center" style={{ backgroundColor: "#FAF9F6" }}>
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 15% 20%, rgba(212,175,55,0.14) 0%, transparent 35%), radial-gradient(circle at 85% 75%, rgba(212,175,55,0.12) 0%, transparent 40%)"
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#B8901F" }}>Federal University Lokoja SUG</p>
          <h1 className="text-2xl font-black" style={{ color: "#0B132B" }}>{settings.awards_title || "Awards Categories"}</h1>
          <p className="mt-2 text-xs max-w-xs mx-auto" style={{ color: "#0B132B99" }}>{settings.awards_description || "Celebrate excellence. Vote for your favourite nominees."}</p>
          <a
            href="#categories"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-xs font-black transition-transform active:scale-95"
            style={{ backgroundColor: "#D4AF37", color: "#0B132B" }}
          >
            🏆 Start Voting
          </a>
        </div>
      </div>

      {votingClosed && (

        <div className="bg-amber-50 border-b border-amber-200 py-3 text-center">
          <p className="text-sm font-bold" style={{ color: "#92400E" }}>🔒 Voting is currently closed.</p>
        </div>
      )}

      <div id="categories" className="max-w-2xl mx-auto px-4 pt-8 scroll-mt-4">
        <RevealOnScroll>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search award categories..."
            className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold outline-none shadow-sm transition-shadow focus:shadow-md"
            style={{ border: "1px solid #E2E8F0", color: "#1E293B" }}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#D4AF37" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
        </RevealOnScroll>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-medium text-lg" style={{ color: "#64748B" }}>Award categories coming soon! 👑</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-medium text-lg" style={{ color: "#64748B" }}>No categories match "{searchTerm}"</p>
          </div>
        ) : (
          filteredCategories.map((category, index) => {
            const noms = nominees[category.id] || [];
            const anyQualified = noms.some((n) => (n.votes || 0) >= category.minimum_votes);
            const leaderVotes = noms.reduce((max, n) => Math.max(max, n.votes || 0), 0);
            const groupName = category.group_name || "General";
            const prevGroupName = index > 0 ? (filteredCategories[index - 1].group_name || "General") : null;
            const showGroupHeader = groupName !== prevGroupName;
            const isExpanded = expandedCategory === category.id;
            const progressPct = Math.min((leaderVotes / category.minimum_votes) * 100, 100);

            return (
              <RevealOnScroll key={category.id} delay={(index % 4) * 60} className="mb-3 last:mb-0">
              <div className="transition-opacity duration-500 opacity-100">
                {showGroupHeader && (
                  <div className="mb-4 mt-8 first:mt-0 overflow-hidden" style={{ borderRadius: "16px" }}>
                    <div
                      className="px-5 py-4"
                      style={{ background: "linear-gradient(135deg, #0B132B 0%, #1C2541 100%)" }}
                    >
                      <p className="text-base font-black text-white flex items-center gap-2">
                        <span>{categoryIcon(groupName)}</span>
                        {groupName}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                        {filteredCategories.filter((c) => (c.group_name || "General") === groupName).length} Categories
                      </p>
                    </div>
                    <div style={{ height: "3px", background: "linear-gradient(90deg, #D4AF37, #F4E4A1, #D4AF37)" }} />
                  </div>
                )}

                <div
                  className="bg-white overflow-hidden transition-all duration-200 active:scale-[0.99]"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    boxShadow: isExpanded ? "0 8px 24px rgba(11,19,43,0.10)" : "0 1px 4px rgba(11,19,43,0.04)"
                  }}
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full text-left px-4 py-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none shrink-0">{categoryIcon(category.name)}</span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm leading-snug truncate" style={{ color: "#0B132B" }}>
                            {category.category_number ? `${category.category_number}. ` : ""}{category.name}
                          </h3>
                          <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>
                            ₦{category.vote_price}/Vote · Min. {category.minimum_votes} Votes
                          </p>
                        </div>
                      </div>
                      <span
                        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold transition-transform duration-200"
                        style={{ backgroundColor: "#D4AF37", color: "#0B132B", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ➜
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      {leaderVotes > 0 ? (
                        <div className="flex-1">
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E5E7EB" }}>
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progressPct}%`, backgroundColor: "#D4AF37" }}
                            />
                          </div>
                          <span className="text-[11px] font-bold mt-1 block" style={{ color: anyQualified ? "#15803D" : "#64748B" }}>
                            {anyQualified ? `✅ Nominee qualified` : `Leading nominee: ${leaderVotes}/${category.minimum_votes} votes`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold italic" style={{ color: "#94A3B8" }}>
                          Voting opens soon
                        </span>
                      )}
                    </div>

                    {noms.length === 0 && (
                      <span
                        className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                      >
                        Opening soon
                      </span>
                    )}

                    {noms.length > 0 && (
                      <span
                        className="inline-block mt-2 text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: isExpanded ? "#0B132B" : "#F8F9FC", color: isExpanded ? "#D4AF37" : "#0B132B", border: isExpanded ? "none" : "1px solid #E2E8F0" }}
                      >
                        {isExpanded ? "Hide Nominees" : `View ${noms.length} Nominee${noms.length !== 1 ? "s" : ""}`}
                      </span>
                    )}
                  </button>

                  {isExpanded && noms.length > 0 && (
                    <div className="px-4 pb-4 pt-1 grid gap-3 sm:grid-cols-2" style={{ borderTop: "1px solid #E2E8F0" }}>
                      {noms.map((nominee) => (
                        <div key={nominee.id} className="overflow-hidden relative mt-4" style={{ border: "1px solid #E2E8F0", borderRadius: "14px" }}>
                          <div className="relative w-full h-32" style={{ backgroundColor: "#F8F9FC" }}>
                            {nominee.photo_url ? (
                              <Image
                                src={nominee.photo_url}
                                alt={nominee.name}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-medium" style={{ color: "#94A3B8" }}>No Photo</div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate" style={{ color: "#1E293B" }}>
                                  {nominee.nominee_number ? `#${nominee.nominee_number} · ` : ""}{nominee.name}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>🗳️ {nominee.votes || 0} votes</p>
                                {(nominee.votes || 0) >= category.minimum_votes ? (
                                  <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
                                    ✅ Qualified
                                  </span>
                                ) : (
                                  <span className="inline-block mt-1 text-[10px] font-semibold" style={{ color: "#94A3B8" }}>
                                    {nominee.votes || 0}/{category.minimum_votes} to qualify
                                  </span>
                                )}
                              </div>
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShareOpenFor(shareOpenFor === nominee.id ? null : nominee.id); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                                  style={{ backgroundColor: "#F8F9FC" }}
                                  aria-label="Share"
                                >
                                  🔗
                                </button>
                                {shareOpenFor === nominee.id && (
                                  <div className="absolute right-0 top-8 z-10 w-40 rounded-xl bg-white shadow-lg py-1.5 overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleShare("whatsapp", nominee, category); }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                      style={{ color: "#1E293B" }}
                                    >
                                      💬 WhatsApp
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleShare("twitter", nominee, category); }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                      style={{ color: "#1E293B" }}
                                    >
                                      𝕏 Twitter
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleShare("copy", nominee, category); }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                                      style={{ color: "#1E293B" }}
                                    >
                                      {copiedId === nominee.id ? "✅ Copied!" : "📋 Copy Link"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); openVoteModal(nominee, category); }}
                              disabled={votingClosed}
                              className="mt-2.5 w-full rounded-full py-2 text-xs font-black transition-all active:scale-95"
                              style={{
                                backgroundColor: votingClosed ? "#E5E7EB" : "#D4AF37",
                                color: votingClosed ? "#94A3B8" : "#0B132B",
                                cursor: votingClosed ? "not-allowed" : "pointer"
                              }}
                            >
                              {votingClosed ? "Voting Closed" : `Vote — ₦${category.vote_price}`}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </RevealOnScroll>
            );
          })
        )}
      </main>

      {votingFor && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#0B132B" }}>
              <h3 className="font-bold text-lg" style={{ color: "#D4AF37" }}>Cast Your Vote</h3>
              <button onClick={closeModal} className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: "rgba(212,175,55,0.2)" }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: "#64748B" }}>Voting For</p>
                <p className="font-bold" style={{ color: "#1E293B" }}>{votingFor.name}</p>
                <p className="text-xs font-semibold" style={{ color: "#D4AF37" }}>{selectedCategory.name}</p>
              </div>
              <hr style={{ borderColor: "#E2E8F0" }} />
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#1E293B" }}>Your Full Name</label>
                <input type="text" required placeholder="John Doe" value={payerName} onChange={(e) => setPayerName(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#1E293B" }}>Email Address</label>
                <input type="email" required placeholder="johndoe@gmail.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#1E293B" }}>Phone Number</label>
                <input type="tel" required placeholder="08012345678" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: "#1E293B" }}>Number of Votes</label>
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => setVoteQuantity(Math.max(1, voteQuantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ backgroundColor: "#F8F9FC" }}>-</button>
                  <span className="text-base font-black w-8 text-center" style={{ color: "#1E293B" }}>{voteQuantity}</span>
                  <button type="button" onClick={() => setVoteQuantity(Math.min(1000, voteQuantity + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ backgroundColor: "#F8F9FC" }}>+</button>
                </div>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>Total: ₦{voteQuantity * selectedCategory.vote_price}</p>
              </div>
              <p className="text-xs text-center" style={{ color: "#94A3B8" }}>Protected by reCAPTCHA</p>
              <button type="submit" disabled={processing} className="w-full rounded-full py-3 text-sm font-black transition-all active:scale-95" style={{ backgroundColor: processing ? "#E5E7EB" : "#D4AF37", color: processing ? "#94A3B8" : "#0B132B" }}>
                {processing ? "Processing..." : "Proceed to Pay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
