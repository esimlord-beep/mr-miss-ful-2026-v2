"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

export function AwardsExperience({
  categories,
  nominees,
  siteSettings,
  votingClosed,
  openVoteModal,
}: {
  categories: any[];
  nominees: Record<string, any[]>;
  siteSettings: any;
  votingClosed: boolean;
  openVoteModal: (nominee: any, category: any) => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [shareOpenFor, setShareOpenFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.group_name || "").toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const categoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sport") || n.includes("athlete") || n.includes("footbal") || n.includes("basketball")) return "⚽";
    if (n.includes("music") || n.includes("song") || n.includes("dj") || n.includes("producer")) return "🎵";
    if (n.includes("fashion") || n.includes("model") || n.includes("style") || n.includes("dress")) return "👗";
    if (n.includes("business") || n.includes("entrepreneur") || n.includes("brand") || n.includes("vendor")) return "💼";
    if (n.includes("humanitarian") || n.includes("philanthrop") || n.includes("community")) return "🤝";
    if (n.includes("king") || n.includes("queen") || n.includes("royal")) return "👑";
    if (n.includes("fresher")) return "🌱";
    if (n.includes("fyb") || n.includes("final year")) return "🎓";
    if (n.includes("couple") || n.includes("bestie") || n.includes("clique")) return "💞";
    if (n.includes("social media") || n.includes("tiktok") || n.includes("youtub") || n.includes("blog") || n.includes("content")) return "📱";
    if (n.includes("photograph") || n.includes("video") || n.includes("cinemat") || n.includes("graphic") || n.includes("media")) return "📸";
    if (n.includes("faculty") || n.includes("department") || n.includes("academic") || n.includes("lecturer")) return "🏛️";
    return "🏆";
  };

  const handleShare = (platform: "whatsapp" | "twitter" | "copy", nominee: any, category: any) => {
    const url = `${window.location.origin}/awards?nominee=${nominee.id}`;
    const text = `Vote for ${nominee.name} in ${category.name} — Mr & Miss FUL 2026 Awards!`;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(nominee.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    setShareOpenFor(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FC" }}>
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3" style={{ backgroundColor: "#F8F9FC", borderBottom: "1px solid #E2E8F0" }}>
        <input
          type="text"
          placeholder="Search categories…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full px-4 py-2.5 text-sm focus:outline-none"
          style={{ border: "1px solid #E2E8F0", backgroundColor: "white" }}
        />
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
              <div key={category.id} className="mb-3 last:mb-0 transition-opacity duration-500 opacity-100">
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
            );
          })
        )}
      </main>
    </div>
  );
}
