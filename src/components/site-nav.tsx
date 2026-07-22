"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, Drama, MessageCircle, FileText, Crown } from "lucide-react";

const NAV_ITEMS = [
  { href: "/awards", label: "FUL Awards 2026", icon: Trophy },
  { href: "/", label: "Mr & Miss FUL Voting", icon: Drama },
  { href: "/contact", label: "Contact & Support", icon: MessageCircle },
  { href: "/terms", label: "Terms & Privacy", icon: FileText },
];

export function SiteNav({ siteTitle }: { siteTitle: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="relative bg-[#FAF9F6] border-b border-[#0B132B]/[0.06] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30">
            <Crown size={14} strokeWidth={2} className="text-[#D4AF37]" />
          </div>
          <p className="text-[#0B132B]/80 font-medium text-[13px] tracking-[0.06em] uppercase">
            FUL 2026
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-[#0B132B]/70 hover:text-[#0B132B] transition-colors"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed top-0 right-0 z-50 h-auto max-h-full w-[78%] max-w-xs
          bg-[#0B132B] shadow-2xl
          rounded-l-[20px]
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Branding block */}
        <div className="flex items-start justify-between px-6 pt-7 pb-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
              Federal University Lokoja
            </p>
            <p className="mt-1.5 text-[17px] font-semibold text-white tracking-tight leading-tight">
              FUL Awards 2026
            </p>
            <p className="mt-0.5 text-[12px] text-[#D4AF37]/90 font-medium">
              Official Voting Platform
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full
              bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white
              transition-colors active:scale-95 duration-150"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Gold divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-[#D4AF37]/70 via-[#D4AF37]/25 to-transparent" />

        {/* Nav items */}
        <div className="px-4 py-3 flex flex-col">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3.5 px-3 py-[13px] rounded-xl text-[14.5px] font-medium
                  transition-colors duration-150
                  ${active ? "text-[#D4AF37]" : "text-white/85 hover:text-white active:bg-white/[0.05]"}`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.6}
                  className={`flex-shrink-0 transition-transform duration-150 group-active:scale-95 ${
                    active ? "text-[#D4AF37]" : "text-white/45 group-hover:text-white/70"
                  }`}
                />
                <span className="leading-none">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="pb-6" />
      </div>
    </nav>
  );
}
