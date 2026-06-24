import { CircleCheck, CircleX } from "lucide-react";
import { isVotingOpen } from "@/lib/config";

export function VotingStatusBadge() {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
        isVotingOpen
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {isVotingOpen ? <CircleCheck size={14} /> : <CircleX size={14} />}
      {isVotingOpen ? "Voting Open" : "Voting Closed"}
    </span>
  );
}
