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
          nominee_id: votingFor.id,
          category_id: selectedCategory.id,
          payer_name: payerName,
          payer_email: payerEmail,
          payer_phone: payerPhone,
          quantity: voteQuantity,
          recaptcha_token: recaptchaToken
        })
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black text-slate-900">{settings?.awards_title || "FUL Awards 2026"}</h1>
          {settings?.awards_description && (
            <p className="text-slate-500 text-sm mt-1">{settings.awards_description}</p>
          )}
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-medium text-lg">Award categories coming soon! 👑</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-medium text-lg">No categories match "{searchTerm}"</p>
          </div>
        ) : (
          filteredCategories.map((category, index) => {
            const noms = nominees[category.id] || [];
            const totalVotes = noms.reduce((sum, n) => sum + (n.votes || 0), 0);
            const minReached = totalVotes >= category.minimum_votes;
            const groupName = category.group_name || "General";
            const prevGroupName = index > 0 ? (filteredCategories[index - 1].group_name || "General") : null;
            const showGroupHeader = groupName !== prevGroupName;

            return (
              <div key={category.id} className="mb-16 last:mb-0">
                {showGroupHeader && (
                  <h2 className="text-2xl font-black text-blue-600 mb-6 pb-2 border-b-2 border-blue-100">
                    {groupName}
                  </h2>
                )}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-5">
                  <h2 className="text-xl font-black text-white">{category.category_number ? `${category.category_number}. ` : ""}{category.name}</h2>
                  {category.description && <p className="text-slate-400 text-sm mt-1">{category.description}</p>}
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-amber-400">₦{category.vote_price} per vote</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${minReached ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {minReached ? "✅ Minimum reached!" : `${totalVotes}/${category.minimum_votes} votes`}
                    </span>
                    {minReached && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                        🗳️ {totalVotes} votes
                      </span>
                    )}
                  </div>
                  {!minReached && (
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((totalVotes / category.minimum_votes) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {noms.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">Nominees coming soon!</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
                    {noms.map((nominee) => (
                      <div key={nominee.id} className="rounded-2xl border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all relative">
                        <div className="relative w-full h-40 bg-slate-100">
                          {nominee.photo_url ? (
                            <Image
                              src={nominee.photo_url}
                              alt={nominee.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Photo</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-900">{nominee.nominee_number ? `#${nominee.nominee_number} · ` : ""}{nominee.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">🗳️ {nominee.votes || 0} votes</p>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setShareOpenFor(shareOpenFor === nominee.id ? null : nominee.id)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                ⋯
                              </button>
                              {shareOpenFor === nominee.id && (
                                <div className="absolute right-0 top-8 z-10 w-40 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                  <button
                                    onClick={() => handleShare("whatsapp", nominee, category)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    📱 WhatsApp
                                  </button>
                                  <button
                                    onClick={() => handleShare("twitter", nominee, category)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    🐦 Twitter
                                  </button>
                                  <button
                                    onClick={() => handleShare("copy", nominee, category)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    {copiedId === nominee.id ? "✅ Copied!" : "📋 Copy Link"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => openVoteModal(nominee, category)}
                            disabled={votingClosed}
                            className={`mt-3 w-full rounded-xl py-2 text-xs font-bold text-white transition-colors ${
                              votingClosed
                                ? "bg-slate-300 cursor-not-allowed"
                                : "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                            }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-amber-500 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Cast Your Vote</h3>
              <button onClick={closeModal} className="text-white bg-amber-600/50 w-7 h-7 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Voting for: {votingFor.name}</p>
                <p className="text-xs text-slate-500">{selectedCategory.name}</p>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Your Name</label>
                <input required value={payerName} onChange={(e) => setPayerName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email</label>
                <input required type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Phone</label>
                <input required value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Number of Votes</label>
                <input required type="number" min={1} value={voteQuantity} onChange={(e) => setVoteQuantity(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-amber-500" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                Total: ₦{(selectedCategory.vote_price * voteQuantity).toLocaleString()}
              </div>
              <button type="submit" disabled={processing} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50">
                {processing ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
