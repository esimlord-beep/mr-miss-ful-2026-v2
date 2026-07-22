"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Users, X } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/awards", label: "FUL Awards 2026" },
  { href: "/", label: "Mr & Miss FUL Voting" },
  { href: "/nominate", label: "Nominate for Awards" },
  { href: "/contact", label: "Contact & Support" },
  { href: "/terms", label: "Terms & Privacy" },
];

export function Hero({
  onExplore,
  onVote,
  siteSettings,
}: {
  onExplore: () => void;
  onVote: () => void;
  siteSettings: any;
}) {
  const tagline = siteSettings?.hero_tagline || "Vote for your favorite contestant.";
  const logo = siteSettings?.primary_logo || siteSettings?.secondary_logo;

  const heroRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const heroHeight = rect.height || 1;
      const raw = -rect.top / heroHeight;
      const clamped = Math.min(Math.max(raw, 0), 1);
      setProgress(clamped);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const opacity = 1 - Math.min(progress * 1.8, 1);
  const scale = 1 - progress * 0.15;
  const translateY = progress * -60;

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-[#FAF9F6]">

        {/* NAV inside hero - floating card */}
        <nav
          className="relative z-50 px-4 pt-4 sm:px-6 sm:pt-6"
          style={{
            opacity,
            transform: `translateY(${translateY}px)`,
            transition: "opacity 0.05s linear, transform 0.05s linear",
            willChange: "transform, opacity",
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between rounded-full bg-[#FAF9F6] border border-[#0B132B]/[0.06] shadow-lg shadow-[#0B132B]/[0.06] px-5 py-3 sm:px-7 sm:py-4">
            {logo && (
              <img
                src={logo}
                alt="FUL Logo"
                className="h-10 w-auto object-contain"
              />
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex flex-col justify-center gap-[5px] w-10 h-10 p-2 text-[#0B132B] transition-opacity duration-200 hover:opacity-60 active:scale-95"
            >
              <span className="block w-7 h-[2px] bg-current rounded-full" />
              <span className="block w-7 h-[2px] bg-current rounded-full" />
              <span className="block w-7 h-[2px] bg-current rounded-full" />
            </button>
          </div>
        </nav>

        <div
          className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F3EE]"
          style={{ opacity: 1 - progress * 0.6 }}
        />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl"
          style={{ opacity: 1 - progress }}
        />
        <div
          className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-3xl"
          style={{ opacity: 1 - progress }}
        />

        <div
          className="relative mx-auto max-w-2xl px-6 pt-2 pb-11 sm:pt-3 sm:pb-14 text-left"
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            transition: "opacity 0.05s linear, transform 0.05s linear",
            willChange: "transform, opacity",
          }}
        >
          <h1
            className="font-rounded text-[2.5rem] leading-[1.1] sm:text-[3.5rem] font-extrabold tracking-tight text-[#0B132B] animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100"
            style={{
              textShadow:
                "0 1px 0 #e8dfc8, 0 2px 0 #ddd0a8, 0 3px 0 #d2c088, 0 4px 6px rgba(11,19,43,0.25), 0 8px 16px rgba(11,19,43,0.15)",
            }}
          >
            Who wears the{" "}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-b from-[#F4D976] via-[#D4AF37] to-[#9C7A1E]"
              style={{
                filter:
                  "drop-shadow(0 2px 0 #7a5f17) drop-shadow(0 4px 6px rgba(11,19,43,0.3))",
              }}
            >
              crown
            </span>{" "}
            this year?
          </h1>

          <p
            className="mt-4 inline-block text-[15px] sm:text-lg font-semibold text-[#0B132B] bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl px-5 py-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150"
            style={{
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(11,19,43,0.06), 0 8px 20px rgba(11,19,43,0.10), 0 2px 4px rgba(11,19,43,0.08)",
            }}
          >
            {tagline}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
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

        <div className="h-16 bg-gradient-to-b from-transparent to-slate-50" />
      </section>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] bg-[#0B132B]/20 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Full screen menu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-[70] bg-[#FAF9F6] overflow-y-auto transition-all duration-400 ease-out ${open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"}`}
      >
        <div className="px-5 py-3 sm:px-8 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {logo && (
              <img
                src={logo}
                alt="FUL Logo"
                className="h-7 w-auto object-contain"
              />
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0B132B] text-[#FAF9F6] transition-all duration-200 hover:bg-[#0B132B]/90 active:scale-95"
            >
              <X size={15} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="mx-5 sm:mx-8">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-[#D4AF37]/60 via-[#D4AF37]/20 to-transparent" />
        </div>

        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-6 py-3.5 sm:py-4 border-b border-[#0B132B]/[0.08] text-[#0B132B] transition-all duration-200"
              >
                <span className="text-[15px] sm:text-lg leading-tight tracking-[-0.01em] font-normal transition-transform duration-200 group-hover:translate-x-1">
                  {item.label}
                </span>
                <span className="flex-shrink-0 text-[16px] sm:text-lg font-light text-[#0B132B]/40 transition-all duration-200 group-hover:text-[#D4AF37] group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-5 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-[10px] text-[#0B132B]/40 tracking-[0.1em] uppercase">Federal University Lokoja</p>
            <p className="text-[10px] text-[#0B132B]/40 tracking-[0.1em] uppercase">© 2026</p>
          </div>
        </div>
      </div>
    </>
  );
}
