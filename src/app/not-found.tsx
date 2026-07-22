import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAF9F6] flex items-center justify-center px-6">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/[0.10] blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-3xl" />

      <div className="relative text-center space-y-4 max-w-sm">
        <p className="font-rounded text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B132B]/40">
          Mr &amp; Miss FUL 2026
        </p>
        <h1
          className="font-rounded text-[5rem] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#F4D976] via-[#D4AF37] to-[#9C7A1E]"
          style={{ filter: "drop-shadow(0 3px 0 #7a5f17) drop-shadow(0 6px 14px rgba(11,19,43,0.25))" }}
        >
          404
        </h1>
        <p className="text-[#0B132B]/55 font-medium">This page doesn&apos;t exist or may have been moved.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B132B] shadow-lg shadow-[#D4AF37]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/30 active:translate-y-0 mt-2"
        >
          <ArrowLeft size={16} strokeWidth={2.25} />
          Back to Home
        </a>
      </div>
    </main>
  );
}
