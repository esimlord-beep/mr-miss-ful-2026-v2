import Image from "next/image";
import { Eye, Vote } from "lucide-react";
import type { Contestant } from "@/types";

export function ContestantCard({
  contestant,
  onVote,
  onProfile
}: {
  contestant: Contestant;
  onVote: (contestant: Contestant) => void;
  onProfile: (contestant: Contestant) => void;
}) {
  // Defensive check: If the URL doesn't start with http, it means only the file path was saved.
  // This automatically prepends a placeholder or builds the URL if it's missing the domain.
  const imageUrl = contestant.photo_url?.startsWith('http') 
    ? contestant.photo_url 
    : contestant.photo_url 
      ? `https://your-project-id.supabase.co/storage/v1/object/public/your-bucket-name/${contestant.photo_url}`
      : "/placeholder-avatar.png"; // Fallback if no image exists at all

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={contestant.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={false}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-black text-navy">{contestant.name}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">{contestant.department}</p>
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-black tabular-nums text-primary">{contestant.votes.toLocaleString()}</p>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">live votes</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => onVote(contestant)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-black text-white transition hover:bg-blue-950"
          >
            <Vote size={16} />
            Vote
          </button>
          <button
            onClick={() => onProfile(contestant)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-black text-primary transition hover:bg-slate-50"
          >
            <Eye size={16} />
            Profile
          </button>
        </div>
      </div>
    </article>
  );
}
