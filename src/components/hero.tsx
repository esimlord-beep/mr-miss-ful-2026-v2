"use client";

import { useEffect, useRef, useState } from "react";
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
    siteSettings?.hero_tagline || "Cast your vote. Crown your favorite.";

  const logo = siteSettings?.primary_logo || siteSettings?.secondary_logo;

  const heroRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
      setTilt(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-[#FAF9F6]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F3EE]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-3xl" />

      <div
        className="relative mx-auto max-w-2xl px-6 pt-10 pb-11 sm:pt-12 sm:pb-14 text-center"
        style={{
          transform: `perspective(1000px) rotateX(${tilt * 6}deg) scale(${1 - tilt * 0.04})`,
          transformOrigin: "top center",
          transition: "transform 0.05s linear",
        }}
      >
        {/* Logo */}
        {logo && (
          <div
            className="mb-5 flex justify-center animate-in fade-in duration-700"
            style={{
              transform: `translateY(${tilt * -12}px) rotateY(${tilt * 10}deg)`,
              transition: "transform 0.05s linear",
            }}
          >
            <img
              src={logo}
              alt="Federal University Lokoja"
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-full ring-1 ring-[#0B132B]/10 shadow-md"
            />
          </div>
        )}

        {/* Branding — plain typography, no container */}
        <div className="animate-in fade-in slide-in-from-top-1 duration-700 delay-75">
          <p className="text-[13px] sm:text-sm font-medium tracking-[0.08em] text-[#0B132B]/70">
            Federal University Lokoja
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium tracking-[0.14em] text-[#0B132B]/40 uppercase">
            Student Union Government
          </p>
        </div>

        {/* Headline */}
        <h1 className="mt-6 font-serif text-[2.15rem] leading-[1.12] sm:text-5xl font-bold tracking-tight text-[#0B132B] animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          Who wears the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-[#D4AF37]">
            crown
          </span>{" "}
          this year?
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-[15px] sm:text-lg text-[#0B132B]/55 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          {tagline}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <button
            onClick={onVote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#0B132B] shadow-lg shadow-[#D4AF37]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/30 active:translate-y-0"
          >
            Vote Now
            <ArrowRight size={17} strokeWidth={2.25} />
          </button>
          <button
            onClick={onExplore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#0B132B]/15 bg-[#0B132B]/[0.02] px-8 py-3.5 text-sm font-semibold text-[#0B132B] transition-all hover:bg-[#0B132B]/[0.06] hover:border-[#0B132B]/25"
          >
            <Users size={16} strokeWidth={2} />
            Meet Contestants
          </button>
        </div>
      </div>

      {/* Bottom fade into page body */}
      <div className="h-16 bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}
