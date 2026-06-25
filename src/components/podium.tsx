import type { Contestant } from "@/types";

export function Podium({ contestants }: { contestants: any[] }) {
  const sorted = [...contestants].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="flex flex-row items-end justify-center gap-2 pt-8 max-w-2xl mx-auto">
      
      {/* 2nd Place */}
      {second && (
        <div className="flex-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-slate-300 shadow-md mb-2 bg-slate-100">
            {second.photo_url ? (
              <img src={second.photo_url} alt={second.name || second.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">?</div>
            )}
          </div>
          <p className="font-bold text-xs text-slate-700 truncate max-w-[100px] text-center">{second.full_name || second.name}</p>
          <p className="text-xs font-semibold text-slate-400 mb-2">{second.votes || 0} votes</p>
          <div className="bg-slate-200 w-full text-center py-5 rounded-t-2xl border border-slate-300/30">
            <span className="text-lg font-black text-slate-500">2nd</span>
          </div>
        </div>
      )}

      {/* 1st Place - Center and tallest */}
      {first && (
        <div className="flex-1 flex flex-col items-center -translate-y-4">
          <div className="relative mb-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg bg-slate-100">
              {first.photo_url ? (
                <img src={first.photo_url} alt={first.name || first.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">?</div>
              )}
            </div>
          </div>
          <p className="font-black text-sm text-slate-900 truncate max-w-[100px] text-center">{first.full_name || first.name}</p>
          <p className="text-xs font-bold text-amber-600 mb-2">{first.votes || 0} votes</p>
          <div className="bg-amber-500 w-full text-center py-8 rounded-t-2xl shadow-md">
            <span className="text-2xl font-black text-white">1st</span>
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-700/30 shadow-md mb-2 bg-slate-100">
            {third.photo_url ? (
              <img src={third.photo_url} alt={third.name || third.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">?</div>
            )}
          </div>
          <p className="font-bold text-xs text-slate-700 truncate max-w-[100px] text-center">{third.full_name || third.name}</p>
          <p className="text-xs font-semibold text-slate-400 mb-2">{third.votes || 0} votes</p>
          <div className="bg-amber-700/10 w-full text-center py-3 rounded-t-2xl border border-amber-700/10">
            <span className="text-lg font-black text-amber-800/70">3rd</span>
          </div>
        </div>
      )}

    </div>
  );
}
