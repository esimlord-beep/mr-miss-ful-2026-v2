"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/awards", label: "FUL Awards 2026" },
  { href: "/", label: "Mr & Miss FUL Voting" },
  { href: "/nominate", label: "Nominate for Awards" },
  { href: "/contact", label: "Contact & Support" },
  { href: "/terms", label: "Terms & Privacy" },
];

export function SiteNav({ siteTitle, logo }: { siteTitle?: string; logo?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* =========================
          MAIN NAVBAR - floating pill, matches homepage hero
      ========================== */}
      <div className="relative z-50 bg-[#FAF9F6] px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between rounded-full bg-[#FAF9F6] border border-[#0B132B]/[0.06] shadow-lg shadow-[#0B132B]/[0.06] px-5 py-3 sm:px-7 sm:py-4">
          {logo && (
            <img
              src={logo}
              alt={siteTitle || "FUL Logo"}
              className="h-10 w-auto object-contain"
            />
          )}

          {/* Simple Menu Icon */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex flex-col justify-center gap-[5px] w-10 h-10 p-2 text-[#0B132B] transition-opacity duration-200 hover:opacity-60 active:scale-95"
          >
            <span className="block w-7 h-[2px] bg-current rounded-full" />
            <span className="block w-7 h-[2px] bg-current rounded-full" />
            <span className="block w-7 h-[2px] bg-current rounded-full" />
          </button>
        </nav>
      </div>

      {/* =========================
          BACKDROP
      ========================== */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`
          fixed inset-0 z-[60]
          bg-[#0B132B]/20
          backdrop-blur-[2px]
          transition-opacity duration-300
          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* =========================
          FULL SCREEN MENU
      ========================== */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`
          fixed inset-0 z-[70]
          bg-[#FAF9F6]
          overflow-y-auto
          transition-all
          duration-400
          ease-out
          ${
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0 pointer-events-none"
          }
        `}
      >
        {/* MENU HEADER */}
        <div className="px-5 py-4 sm:px-8 sm:py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {logo && (
              <img
                src={logo}
                alt={siteTitle || "FUL Logo"}
                className="h-10 w-auto object-contain"
              />
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="
                flex items-center justify-center
                w-10 h-10
                rounded-full
                bg-[#0B132B]
                text-[#FAF9F6]
                transition-all
                duration-200
                hover:bg-[#0B132B]/90
                active:scale-95
              "
            >
              <X size={19} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="mx-5 sm:mx-8">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-[#D4AF37]/60 via-[#D4AF37]/20 to-transparent" />
        </div>

        {/* MENU ITEMS */}
        <div className="px-5 sm:px-8 pt-8 sm:pt-12 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      group
                      flex
                      items-center
                      justify-between
                      gap-6
                      py-5
                      sm:py-6
                      border-b
                      border-[#0B132B]/[0.08]
                      transition-all
                      duration-200
                      ${active ? "text-[#9C7A1A]" : "text-[#0B132B]"}
                    `}
                  >
                    <span
                      className="
                        text-[20px]
                        sm:text-[26px]
                        md:text-[30px]
                        leading-tight
                        tracking-[-0.025em]
                        font-normal
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    >
                      {item.label}
                    </span>

                    <span
                      className={`
                        flex-shrink-0
                        text-[24px]
                        sm:text-[28px]
                        font-light
                        transition-all
                        duration-200
                        ${active ? "text-[#D4AF37]" : "text-[#0B132B]/40"}
                        group-hover:text-[#D4AF37]
                        group-hover:translate-x-1
                      `}
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* MENU FOOTER */}
        <div className="px-5 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-[10px] text-[#0B132B]/40 tracking-[0.1em] uppercase">
              Federal University Lokoja
            </p>
            <p className="text-[10px] text-[#0B132B]/40 tracking-[0.1em] uppercase">
              © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
