export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-3">
          Mr &amp; Miss FUL 2026
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
          We&apos;ll be right back
        </h1>
        <p className="text-white/60 text-sm max-w-sm mx-auto">
          The site is undergoing quick maintenance. Please check back shortly.
        </p>
      </div>
    </div>
  );
}
