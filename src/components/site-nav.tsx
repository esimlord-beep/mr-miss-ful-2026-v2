"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Crown, ArrowUpRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/awards", label: "FUL Awards 2026" },
  { href: "/", label: "Mr & Miss FUL Voting" },
  { href: "/nominate", label: "Nominate for Awards" },
  { href: "/contact", label: "Contact & Support" },
  { href: "/terms", label: "Terms & Privacy" },
];

export function SiteNav({ siteTitle }: { siteTitle: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close menu with Escape key
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* =========================
          NAVBAR
      ========================== */}
      <nav className="relative z-50 bg-[#FAF9F6] border-b border-[#0B132B]/[0.06] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30">
              <Crown
                size={17}
                strokeWidth={1.8}
                className="text-[#D4AF37]"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[#0B132B] font-semibold text-[13px] tracking-[0.08em] uppercase leading-none">
                FUL 2026
              </span>

              <span className="mt-1 text-[#0B132B]/45 text-[9px] tracking-[0.12em] uppercase">
                Official Platform
              </span>
            </div>
          </div>

          {/* Menu Button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="
              flex items-center justify-center
              h-11
              px-6
              rounded-full
              bg-[#0B132B]
              text-[#FAF9F6]
              text-[13px]
              font-medium
              tracking-[0.02em]
              shadow-sm
              transition-all
              duration-200
              hover:bg-[#0B132B]/90
              active:scale-[0.97]
            "
          >
            <span className="hidden sm:block mr-3">
              Explore
            </span>

            <Menu
              size={19}
              strokeWidth={1.7}
            />
          </button>
        </div>
      </nav>


      {/* =========================
          MENU OVERLAY
      ========================== */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`
          fixed inset-0 z-[60]
          bg-[#0B132B]/20
          backdrop-blur-[3px]
          transition-opacity duration-300
          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />


      {/* =========================
          FULL MENU
      ========================== */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`
          fixed inset-0 z-[70]
          bg-[#FAF9F6]
          overflow-y-auto
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0 pointer-events-none"
          }
        `}
      >

        {/* =========================
            MENU HEADER
        ========================== */}
        <div className="px-5 py-5 sm:px-8 sm:py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30">
                <Crown
                  size={20}
                  strokeWidth={1.7}
                  className="text-[#D4AF37]"
                />
              </div>

              <div>
                <p className="text-[#0B132B] text-[13px] font-semibold tracking-[0.08em] uppercase">
                  FUL 2026
                </p>

                <p className="text-[#0B132B]/45 text-[10px] tracking-[0.12em] uppercase mt-1">
                  Official Platform
                </p>
              </div>
            </div>


            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="
                flex
                items-center
                justify-center
                w-12
                h-12
                rounded-full
                bg-[#0B132B]
                text-[#FAF9F6]
                transition-all
                duration-200
                hover:bg-[#0B132B]/90
                active:scale-95
              "
            >
              <X
                size={22}
                strokeWidth={1.6}
              />
            </button>

          </div>
        </div>


        {/* Gold Divider */}
        <div className="mx-5 sm:mx-8">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-[#D4AF37]/60 via-[#D4AF37]/20 to-transparent" />
        </div>


        {/* =========================
            NAVIGATION LINKS
        ========================== */}
        <div className="px-5 sm:px-8 pt-12 pb-16">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col">
              {NAV_ITEMS.map((item, index) => {
                const active = pathname === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      group
                      relative
                      flex
                      items-center
                      justify-between
                      py-6
                      sm:py-8
                      border-b
                      border-[#0B132B]/[0.08]
                      transition-all
                      duration-300
                      ${
                        active
                          ? "text-[#9C7A1A]"
                          : "text-[#0B132B]"
                      }
                    `}
                  >

                    {/* Left side */}
                    <div className="flex items-center gap-4 sm:gap-6">

                      {/* Number */}
                      <span
                        className={`
                          text-[10px]
                          sm:text-[11px]
                          font-medium
                          tracking-[0.12em]
                          transition-colors
                          duration-300
                          ${
                            active
                              ? "text-[#D4AF37]"
                              : "text-[#0B132B]/30"
                          }
                        `}
                      >
                        0{index + 1}
                      </span>

                      {/* Label */}
                      <span
                        className="
                          text-[30px]
                          leading-none
                          tracking-[-0.035em]
                          font-normal
                          sm:text-[48px]
                          md:text-[56px]
                          transition-transform
                          duration-300
                          group-hover:translate-x-2
                        "
                      >
                        {item.label}
                      </span>

                    </div>


                    {/* Arrow */}
                    <div
                      className={`
                        flex
                        items-center
                        justify-center
                        w-10
                        h-10
                        sm:w-12
                        sm:h-12
                        rounded-full
                        border
                        transition-all
                        duration-300
                        ${
                          active
                            ? "border-[#D4AF37] text-[#9C7A1A]"
                            : "border-[#0B132B]/20 text-[#0B132B]/60"
                        }
                        group-hover:bg-[#D4AF37]
                        group-hover:border-[#D4AF37]
                        group-hover:text-white
                        group-hover:translate-x-1
                      `}
                    >
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.5}
                      />
                    </div>

                  </a>
                );
              })}
            </div>

          </div>
        </div>


        {/* =========================
            FOOTER
        ========================== */}
        <div className="px-5 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <p className="text-[10px] sm:text-[11px] text-[#0B132B]/40 tracking-[0.1em] uppercase">
              Federal University Lokoja
            </p>

            <p className="text-[10px] sm:text-[11px] text-[#0B132B]/40 tracking-[0.1em] uppercase">
              © 2026 FUL
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
