export function Sponsors({ sponsors }: { sponsors?: { name: string; logo_url?: string }[] }) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase mb-6">
          In Partnership With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {sponsors.map((sponsor) => (
            <div key={sponsor.name} className="flex items-center gap-2 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
              {sponsor.logo_url ? (
                <img src={sponsor.logo_url} alt={sponsor.name} className="h-8 object-contain" />
              ) : (
                <span className="text-sm font-semibold text-slate-500">{sponsor.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
