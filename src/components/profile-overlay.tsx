"use client";

interface ProfileOverlayProps {
  contestant: any;
  onClose: () => void;
  onVote: () => void;
}

export function ProfileOverlay({ contestant, onClose, onVote }: ProfileOverlayProps) {
  if (!contestant) return null;

  // Resolves the image field safely across database schemas
  const displayImage = contestant.photo_url || contestant.image || contestant.avatar_url;
  const displayName = contestant.full_name || contestant.name || "Contestant Profile";
  const displaySubtext = contestant.department || contestant.faculty || "General Contestant";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Panel Panel */}
      <div className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-slate-900">
        
        {/* Top Sticky Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Contestant Profile</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Profile Picture Frame */}
          <div className="aspect-[4/5] w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shadow-sm relative">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-sm">
                No Image Uploaded
              </div>
            )}
          </div>

          {/* Identity Headers */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">{displayName}</h2>
            <p className="text-xs font-bold text-amber-600 tracking-wider uppercase">{displaySubtext}</p>
          </div>

          <hr className="border-slate-100" />

          {/* Stats Metrics Display */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Votes</p>
              <p className="text-xl font-black text-slate-800">{contestant.votes ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank Status</p>
              <p className="text-xl font-black text-slate-800">Verified</p>
            </div>
          </div>

          {/* Biography details section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Contestant</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {contestant.bio || contestant.description || "No biography provided by the candidate yet."}
            </p>
          </div>

        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-1">
          <button
            onClick={onVote}
            className="w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-white shadow-md shadow-amber-500/10 transition-colors hover:bg-amber-600 cursor-pointer"
          >
            Vote for {displayName}
          </button>
        </div>

      </div>
    </div>
  );
}
