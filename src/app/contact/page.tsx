import type { Metadata } from "next";
import { Mail, MessageCircle, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support — Mr & Miss FUL 2026",
  description: "Get in touch with the Mr & Miss FUL 2026 support team for help with voting or payments.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F3EE] pt-16 pb-14 px-6 text-center">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[380px] w-[380px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
        <div className="relative">
          <p className="font-rounded text-[11px] sm:text-xs font-bold tracking-[0.14em] text-[#0B132B]/40 uppercase">
            Mr &amp; Miss FUL 2026
          </p>
          <h1 className="mt-2 font-rounded text-[2rem] sm:text-[2.5rem] font-extrabold tracking-tight text-[#0B132B]">
            Contact &amp; Support
          </h1>
          <p className="mt-3 text-[15px] sm:text-base text-[#0B132B]/55 font-medium max-w-md mx-auto">
            Having trouble voting or with a payment? Reach out and we&apos;ll help as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-12 space-y-4">
        <a
          href="mailto:Esimlord09@gmail.com"
          className="group flex items-center gap-4 rounded-2xl border border-[#0B132B]/[0.08] bg-white p-5 shadow-sm shadow-[#0B132B]/[0.04] transition-all hover:border-[#D4AF37]/40 hover:shadow-md hover:shadow-[#D4AF37]/10"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#0B132B]">
            <Mail size={20} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-rounded text-[11px] font-bold uppercase tracking-[0.1em] text-[#0B132B]/40">Email</p>
            <p className="font-semibold text-[#0B132B] truncate">Esimlord09@gmail.com</p>
          </div>
          <ArrowUpRight size={16} className="flex-shrink-0 text-[#0B132B]/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <a
          href="https://wa.me/2348105789086"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-[#0B132B]/[0.08] bg-white p-5 shadow-sm shadow-[#0B132B]/[0.04] transition-all hover:border-[#D4AF37]/40 hover:shadow-md hover:shadow-[#D4AF37]/10"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#0B132B]">
            <MessageCircle size={20} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-rounded text-[11px] font-bold uppercase tracking-[0.1em] text-[#0B132B]/40">WhatsApp</p>
            <p className="font-semibold text-[#0B132B]">+234 810 578 9086</p>
          </div>
          <ArrowUpRight size={16} className="flex-shrink-0 text-[#0B132B]/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <p className="text-center text-[13px] text-[#0B132B]/40 font-medium pt-4">
          For payment issues, please include your transaction reference if available.
        </p>
      </div>
    </main>
  );
}
