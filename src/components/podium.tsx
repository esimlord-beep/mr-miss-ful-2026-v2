import type { Contestant } from "@/types";

export function Podium({ contestants }: { contestants: any[] }) {
  // Safe sorting to ensure highest scores stand at the top center
  const sorted = [...contestants].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="flex flex-col items-end justify-center pt-8 sm:flex-row sm:space-x-4 space-y-8 sm:space-y-0 max-w-2xl mx-auto">
      {/* 2nd Place */}
      {second && (
        <div className="w-full sm:w-1/3 flex flex-col items-center order-2 sm:order-1">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-md mb-2 bg-slate-100">
            {second.photo_url ? (
              <img src={second.photo_url} alt={second.name || second.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
            )}
          </div>
          <p className="font-bold text-sm text-slate-700 truncate max-w-[150px]">{second.full_name || second.name}</p>
          <p className="text-xs font-semibold text-slate-400 mb-2">{second.votes || 0} votes</p>
          <div className="bg-slate-200 w-full text-center py-6 rounded-t-2xl shadow-sm border border-slate-300/30">
            <span className="text-xl font-black text-slate-500">2nd</span>
          </div>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="w-full sm:w-1/3 flex flex-col items-center order-1 sm:order-2 -translate-y-0 sm:-translate-y-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg mb-2 bg-slate-100 relative">
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm animate-pulse">👑</div>
            {first.photo_url ? (
              <img src={first.photo_url} alt={first.name || first.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
            )}
          </div>
          <p className="font-black text-base text-slate-900 truncate max-w-[150px]">{first.full_name || first.name}</p>
          <p className="text-xs font-bold text-amber-600 mb-2">{first.votes || 0} votes</p>
          <div className="bg-amber-500 w-full text-center py-10 rounded-t-2xl shadow-md border border-amber-600/20">
            <span className="text-2xl font-black text-white">1st</span>
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="w-full sm:w-1/3 flex flex-col items-center order-3 sm:order-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-700/30 shadow-md mb-2 bg-slate-100">
            {third.photo_url ? (
              <img src={third.photo_url} alt={third.name || third.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
            )}
          </div>
          <p className="font-bold text-sm text-slate-700 truncate max-w-[150px]">{third.full_name || third.name}</p>
          <p className="text-xs font-semibold text-slate-400 mb-2">{third.votes || 0} votes</p>
          <div className="bg-amber-700/10 w-full text-center py-4 rounded-t-2xl shadow-sm border border-amber-700/10">
            <span className="text-lg font-black text-amber-800/70">3rd</span>
          </div>
        </div>
      )}
    </div>
  );
}
