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
    siteSettings?.hero_tagline || "The journey to the crown begins here.";

  const prizePool = siteSettings?.prize_pool || "₦1,000,000";
  const logo = siteSettings?.primary_logo || siteSettings?.secondary_logo;

  return (
    <section className="relative overflow-hidden bg-[#0B132B]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08101F] via-[#0B132B] to-[#111C39]" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <div className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 pt-8 pb-8 sm:pt-10 sm:pb-10 text-center">

        {logo && (
          <div className="mb-6 flex justify-center">
            <img
              src={logo}
              alt="Federal University Lokoja"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
            />
          </div>
        )}

        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-white/85 uppercase">
            Federal University Lokoja
          </p>

          <p className="mt-1 text-xs tracking-[0.35em] uppercase text-[#D4AF37]">
            Student Union Government
          </p>
        </div>

        <h1 className="mt-7 text-5xl sm:text-7xl font-black leading-none tracking-tight text-white">
          MR &amp; MISS FUL{" "}
          <span className="bg-gradient-to-r from-[#F6D365] to-[#D4AF37] bg-clip-text text-transparent">
            2026
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-white/65">
          {tagline}
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-3 backdrop-blur-sm">
          <span className="text-xl">🏆</span>

          <span className="text-lg font-bold text-[#F6D365]">
            {prizePool} Grand Prize
          </span>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={onVote}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3.5 font-semibold text-[#08101F] transition hover:scale-[1.03]"
          >
            Vote Now
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExplore}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
          >
            <Users size={17} />
            Meet Contestants
          </button>

        </div>
      </div>
    </section>
  );
}
