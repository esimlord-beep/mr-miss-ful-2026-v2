import { ContestantCard } from "@/components/contestant-card";
import type { Contestant } from "@/types";

export function ContestantGrid({
  contestants,
  onVote,
  onProfile
}: {
  contestants: Contestant[];
  onVote: (contestant: Contestant) => void;
  onProfile: (contestant: Contestant) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="contestants">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Contestant gallery</p>
        <h2 className="mt-2 text-3xl font-black text-navy sm:text-4xl">Cast verified votes for your favorite</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 px-2">
        {contestants.map((contestant) => (
          <ContestantCard key={contestant.id} contestant={contestant} onVote={onVote} onProfile={onProfile} />
        ))}
      </div>
    </section>
  );
}
