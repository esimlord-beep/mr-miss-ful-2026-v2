"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
    if (n.includes("academic") || n.includes("lecturer") || n.includes("course")) return "🎓";
    if (n.includes("tutor")) return "👨‍🏫";
    if (n.includes("president") || n.includes("secretary") || n.includes("treasurer") || n.includes("leader") || n.includes("pro ") || n.includes("director")) return "🏅";
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
      <div className="py-12 px-4 text-center" style={{ backgroundColor: "#0B132B" }}>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#D4AF37" }}>Federal University Lokoja SUG</p>
        <h1 className="text-4xl font-black text-white">{settings.awards_title || "FUL Awards 2026"}</h1>
        <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "#94A3B8" }}>{settings.awards_description || "Vote for your favorites across all categories. Minimum 250 votes required for each award to be presented."}</p>
      </div>

      {votingClosed && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 text-center">
          <p className="text-sm font-bold" style={{ color: "#92400E" }}>🔒 Voting is currently closed.</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search award categories..."
            className="w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold outline-none shadow-sm transition-shadow focus:shadow-md"
            style={{ border: "1px solid #E2E8F0", color: "#1E293B" }}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }}>🔍</span>
        </div>
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
            const totalVotes = noms.reduce((sum, n) => sum + (n.votes || 0), 0);
            const minReached = totalVotes >= category.minimum_votes;
            const groupName = category.group_name || "General";
            const prevGroupName = index > 0 ? (filteredCategories[index - 1].group_name || "General") : null;
            const showGroupHeader = groupName !== prevGroupName;
            const isExpanded = expandedCategory === category.id;
            const progressPct = Math.min((totalVotes / category.minimum_votes) * 100, 100);

            return (
              <div key={category.id} className="mb-4 last:mb-0 transition-opacity duration-500 opacity-100">
                {showGroupHeader && (
                  <h2 className="text-lg font-black mb-4 mt-8 first:mt-0 pb-2" style={{ color: "#0B132B", borderBottom: "2px solid #D4AF37" }}>
                    {groupName}
                  </h2>
                )}

                <div
                  className="bg-white overflow-hidden transition-all duration-200 active:scale-[0.99]"
                  style={{
                    borderRadius: "20px",
                    border: "1px solid #E2E8F0",
                    boxShadow: isExpanded ? "0 8px 24px rgba(11,19,43,0.10)" : "0 2px 8px rgba(11,19,43,0.05)"
                  }}
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full text-left px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-xl leading-none mt-0.5">{categoryIcon(category.name)}</span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base leading-snug truncate" style={{ color: "#0B132B" }}>
                            {category.category_number ? `${category.category_number}. ` : ""}{category.name}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                            ₦{category.vote_price} per vote · {category.minimum_votes} minimum votes
                          </p>
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-sm font-bold transition-transform duration-200"
                        style={{ color: "#D4AF37", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ›
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E5E7EB" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progressPct}%`, backgroundColor: "#D4AF37" }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-bold" style={{ color: minReached ? "#15803D" : "#64748B" }}>
                          {minReached ? `✅ Qualified · ${totalVotes} votes` : `${totalVotes}/${category.minimum_votes} votes`}
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color: "#64748B" }}>
                          {noms.length > 0 ? `${noms.length} nominee${noms.length !== 1 ? "s" : ""}` : ""}
                        </span>
                      </div>
                    </div>

                    {noms.length === 0 && (
                      <span
                        className="inline-block mt-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                      >
                        Nominees opening soon
                      </span>
                    )}

                    {noms.length > 0 && (
                      <span
                        className="inline-block mt-3 text-[11px] font-black px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: isExpanded ? "#0B132B" : "#F8F9FC", color: isExpanded ? "#D4AF37" : "#0B132B", border: isExpanded ? "none" : "1px solid #E2E8F0" }}
                      >
                        {isExpanded ? "Hide Nominees" : "View Nominees →"}
                      </span>
                    )}
                  </button>

                  {isExpanded && noms.length > 0 && (
                    <div className="px-5 pb-5 pt-1 grid gap-3 sm:grid-cols-2" style={{ borderTop: "1px solid #E2E8F0" }}>
                      {noms.map((nominee) => (
                        <div key={nominee.id} className="rounded-2xl overflow-hidden relative mt-4" style={{ border: "1px solid #E2E8F0" }}>
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
