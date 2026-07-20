"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Drama, Trophy, MessageCircle, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Mr & Miss FUL Voting", icon: Drama },
  { href: "/awards", label: "FUL Awards 2026", icon: Trophy },
  { href: "/contact", label: "Contact & Support", icon: MessageCircle },
  { href: "/terms", label: "Terms & Privacy", icon: FileText },
];

export function SiteNav({ siteTitle }: { siteTitle: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="relative bg-[#0B132B] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-white font-semibold text-[15px] tracking-tight">
          {siteTitle}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-white/90 hover:text-white transition-colors"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed top-0 right-0 z-50 h-full w-[78%] max-w-xs
          bg-[#0B132B] shadow-2xl
          rounded-l-[20px]
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <span className="text-[11px] font-medium tracking-[0.14em] text-white/40 uppercase">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 -mr-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 px-3 flex flex-col">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[14.5px] font-medium
                  transition-colors
                  ${active ? "text-[#D4AF37]" : "text-white/80 hover:text-white hover:bg-white/[0.04]"}`}
              >
                <Icon
                  size={19}
                  strokeWidth={1.5}
                  className={active ? "text-[#D4AF37]" : "text-white/50"}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 py-5">
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-[11px] text-white/30 font-medium">
            © 2026 Mr & Miss FUL
          </p>
        </div>
      </div>
    </nav>
  );
}
