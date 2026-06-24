import { ArrowRight, Sparkles } from "lucide-react";

export function Hero({ onExplore, siteSettings }: { onExplore: () => void, siteSettings: any }) {
  // Force clean fallbacks even if the fields exist but are empty text strings
  const title = siteSettings?.site_title || "Mr & Miss FUL 2026";
  const description = siteSettings?.hero_description || "A premium digital voting experience for Federal University Lokoja, organized by the Student Union Government and powered by Red Ink Media Nigeria Limited.";
  
  const rawImage = siteSettings?.primary_logo || siteSettings?.secondary_logo;
  const bannerImage = rawImage && rawImage.trim() !== "" 
    ? rawImage 
    : "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white min-h-[500px] flex items-center py-12 sm:py-16 lg:py-20">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.15),transparent_45%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-950" />
      
      <div className="relative mx-auto grid max-w-7xl w-full items-center gap-8 px-4 md:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="z-10">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
              <Sparkles size={14} />
              SUG official platform
            </span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-amber-200">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
            {description}
          </p>
          <button
            onClick={onExplore}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-400"
          >
            Explore contestants
            <ArrowRight size={18} />
          </button>
        </div>
        
        {/* Banner Column */}
        <div className="relative block min-h-[350px] w-full overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/50 p-3 shadow-xl z-10">
          <img 
            src={bannerImage} 
            alt="Hero Banner"
            className="h-[326px] w-full rounded-[1.5rem] object-cover"
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Grand pageantry night</p>
            <p className="mt-1 text-xl font-black text-white">Elegance. Campus pride. Verified votes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
