import { ArrowRight } from "lucide-react";

export function Hero({ onExplore, siteSettings }: { onExplore: () => void, siteSettings: any }) {
  const title = siteSettings?.site_title || "Mr & Miss FUL 2026";
  const description = siteSettings?.hero_description || "A premium digital voting experience for Federal University Lokoja, organized by the Student Union Government.";
  
  const rawImage = siteSettings?.primary_logo || siteSettings?.secondary_logo;
  const bannerImage = rawImage && rawImage.trim() !== "" 
    ? rawImage 
    : null;

  const secondaryLogo = siteSettings?.secondary_logo;

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white min-h-[500px] flex items-center py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-950" />
      
      <div className="relative mx-auto grid max-w-7xl w-full items-center gap-8 px-4 md:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="z-10">
          
          <div className="flex items-center gap-3 mb-5">
            {secondaryLogo && (
              <img src={secondaryLogo} alt="FUL Logo" className="h-12 w-12 object-contain rounded-full" />
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">Federal University Lokoja</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Union Government</p>
            </div>
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
        
        {bannerImage && (
          <div className="relative block w-full overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/50 p-3 shadow-xl z-10">
            <img 
              src={bannerImage} 
              alt="Hero Banner"
              className="w-full rounded-[1.5rem] object-contain"
            />
          </div>
        )}
      </div>
    </section>
  );
}
