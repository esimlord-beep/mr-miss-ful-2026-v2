import type { Contestant } from "@/types";
import { Crown } from "lucide-react";

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
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 shadow-md mb-2 bg-[#F5F3EE]" style={{ borderColor: "#0B132B26" }}>
            {second.photo_url ? (
              <img src={second.photo_url} alt={second.name || second.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "#0B132B66" }}>?</div>
            )}
          </div>
          <p className="font-bold text-xs truncate max-w-[100px] text-center" style={{ color: "#0B132B" }}>{second.full_name || second.name}</p>
          <p className="text-xs font-semibold mb-2" style={{ color: "#0B132B66" }}>{second.votes || 0} votes</p>
          <div className="w-full text-center py-5 rounded-t-2xl border" style={{ backgroundColor: "#0B132B0D", borderColor: "#0B132B1A" }}>
            <span className="text-lg font-black" style={{ color: "#0B132B99" }}>2nd</span>
          </div>
        </div>
      )}

      {/* 1st Place - Center and tallest */}
      {first && (
        <div className="flex-1 flex flex-col items-center -translate-y-4">
          <div className="relative mb-2">
            <Crown
              size={22}
              strokeWidth={2}
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              style={{ color: "#D4AF37", filter: "drop-shadow(0 2px 3px rgba(212,175,55,0.4))" }}
            />
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg bg-[#F5F3EE]" style={{ borderColor: "#D4AF37" }}>
              {first.photo_url ? (
                <img src={first.photo_url} alt={first.name || first.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "#0B132B66" }}>?</div>
              )}
            </div>
          </div>
          <p className="font-black text-sm truncate max-w-[100px] text-center" style={{ color: "#0B132B" }}>{first.full_name || first.name}</p>
          <p className="text-xs font-bold mb-2" style={{ color: "#B8901F" }}>{first.votes || 0} votes</p>
          <div className="w-full text-center py-8 rounded-t-2xl shadow-md" style={{ backgroundColor: "#D4AF37" }}>
            <span className="text-2xl font-black" style={{ color: "#0B132B" }}>1st</span>
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 shadow-md mb-2 bg-[#F5F3EE]" style={{ borderColor: "#D4AF3733" }}>
            {third.photo_url ? (
              <img src={third.photo_url} alt={third.name || third.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "#0B132B66" }}>?</div>
            )}
          </div>
          <p className="font-bold text-xs truncate max-w-[100px] text-center" style={{ color: "#0B132B" }}>{third.full_name || third.name}</p>
          <p className="text-xs font-semibold mb-2" style={{ color: "#0B132B66" }}>{third.votes || 0} votes</p>
          <div className="w-full text-center py-3 rounded-t-2xl border" style={{ backgroundColor: "#D4AF370D", borderColor: "#D4AF371A" }}>
            <span className="text-lg font-black" style={{ color: "#B8901F99" }}>3rd</span>
          </div>
        </div>
      )}

    </div>
  );
}
