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
  const tagline =
    siteSettings?.hero_tagline || "Where excellence takes the crown.";

  const prizePool = siteSettings?.prize_pool || "₦1,000,000";
  const logo = siteSettings?.primary_logo || siteSettings?.secondary_logo;

  return (
    <section className="relative overflow-hidden bg-[#0B132B]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B] via-[#0B132B] to-[#0d1730]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.07] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-6 pt-10 pb-11 sm:pt-12 sm:pb-14 text-center">
        {/* Logo */}
        {logo && (
          <div className="mb-5 flex justify-center animate-in fade-in duration-700">
            <img
              src={logo}
              alt="Federal University Lokoja"
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-full ring-1 ring-white/10"
            />
          </div>
        )}

        {/* Branding — plain typography, no container */}
        <div className="animate-in fade-in slide-in-from-top-1 duration-700 delay-75">
          <p className="text-[13px] sm:text-sm font-medium tracking-[0.08em] text-white/80">
            Federal University Lokoja
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium tracking-[0.14em] text-white/40 uppercase">
            Student Union Government
          </p>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-[2.35rem] leading-[1.08] sm:text-6xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          MR &amp; MISS FUL{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f3d878]">
            2026
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-[15px] sm:text-lg text-white/55 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          {tagline}
        </p>

        {/* Prize — shown once */}
        <div className="mt-7 inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-700 delay-200">
          <span className="text-lg sm:text-xl">🏆</span>
          <span className="text-lg sm:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#f3d878] to-[#D4AF37] tracking-tight">
            {prizePool} Grand Prize
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
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
            Meet Contestants
          </button>
        </div>
      </div>

      {/* Bottom fade into page body */}
      <div className="h-8 bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}
