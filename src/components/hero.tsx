"use client";

import { ArrowRight, Users } from "lucide-react";

export function Hero({
  onExplore,
  onVote,
  siteSettings,
}: {
  onExplore: () => void;
  onVote: () => void;
  siteSettings: any;
}) {
  const description =
    siteSettings?.hero_tagline ||
    "Cast your vote. Crown a champion.";

  const prizePool = siteSettings?.prize_pool || "₦1,000,000";
  const flyerImage = siteSettings?.event_flyer || siteSettings?.primary_logo || siteSettings?.secondary_logo;

  return (
    <section className="relative overflow-hidden bg-[#0B132B]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B] via-[#0B132B] to-[#0d1730]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.08] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-5 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-700">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
            Federal University Lokoja &middot; SUG
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.5rem] leading-[1.05] sm:text-6xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-3 duration-700">
          Mr & Miss FUL{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f3d878]">
            2026
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-white/60 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
          {description}
        </p>

        {/* Prize pool */}
        <div className="mt-8 inline-flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 delay-150">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase mb-1">
            Total Prize Pool
          </span>
          <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#f3d878] to-[#D4AF37] tracking-tight">
            {prizePool}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <button
            onClick={onVote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#0B132B] shadow-lg shadow-[#D4AF37]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/25 active:translate-y-0"
          >
            Vote Now
            <ArrowRight size={17} strokeWidth={2.25} />
          </button>
          <button
            onClick={onExplore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-white/25"
          >
            <Users size={16} strokeWidth={2} />
            Explore Contestants
          </button>
        </div>
      </div>

      {/* Flyer card */}
      {flyerImage && (
        <div className="relative mx-auto max-w-md px-5 pb-12 sm:pb-16 animate-in fade-in zoom-in-95 duration-700 delay-300">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-2.5 shadow-2xl shadow-black/40">
            <img
              src={flyerImage}
              alt="Official Event Flyer"
              className="w-full rounded-[1.35rem] object-cover"
            />
          </div>
        </div>
      )}

      {/* Bottom fade into page body */}
      <div className="h-10 bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}
