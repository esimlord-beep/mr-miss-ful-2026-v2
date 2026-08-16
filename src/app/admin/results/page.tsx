import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Trophy, Crown, Lock } from "lucide-react";

async function getFinalScores() {
  if (!adminSupabase) return [];
  const [{ data: scores }, { data: contestants }] = await Promise.all([
    adminSupabase.from("contestant_final_scores").select("*"),
    adminSupabase.from("contestants").select("id, category, votes")
  ]);

  const contestantById = new Map((contestants ?? []).map(c => [c.id, c]));

  return (scores ?? []).map(s => ({
    ...s,
    category: contestantById.get(s.contestant_id)?.category ?? "Unknown",
    votes: contestantById.get(s.contestant_id)?.votes ?? 0
  }));
}

async function getDeclarations() {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("winner_declarations")
    .select("*");
  return data ?? [];
}

async function confirmWinner(formData: FormData) {
  "use server";
  if (!adminSupabase) return;

  const categoryLabel = String(formData.get("category_label") ?? "").trim();
  const winnerId = String(formData.get("winner_id") ?? "").trim();
  const isOverride = formData.get("is_override") === "true";
  const overrideReason = String(formData.get("override_reason") ?? "").trim();
  const finalScoreOverrideRaw = String(formData.get("final_score_override") ?? "").trim();

  if (!categoryLabel || !winnerId) return;

  const categoryKey = categoryLabel.startsWith("Mr") ? "Mr FUL" : "Miss FUL";

  const { data: contestants } = await adminSupabase
    .from("contestants")
    .select("id, votes")
    .eq("category", categoryKey);

  const { data: scores } = await adminSupabase
    .from("contestant_final_scores")
    .select("contestant_id, final_score");

  const scoreMap = new Map((scores ?? []).map(s => [s.contestant_id, Number(s.final_score)]));
  const categoryContestantIds = new Set((contestants ?? []).map(c => c.id));

  const ranked = [...categoryContestantIds]
    .map(id => ({ id, final_score: scoreMap.get(id) ?? 0 }))
    .sort((a, b) => b.final_score - a.final_score);

  const runnerUp1 = ranked.find(r => r.id !== winnerId) ?? null;
  const runnerUp2 = ranked.find(r => r.id !== winnerId && r.id !== runnerUp1?.id) ?? null;
  const runnerUp3 = ranked.find(r => r.id !== winnerId && r.id !== runnerUp1?.id && r.id !== runnerUp2?.id) ?? null;

  // Vote-swap check: does the chosen winner actually hold the highest
  // public vote count in their category? If not, record a display-only
  // swap with whoever the real vote leader is — contestants.votes itself
  // is never modified, this only affects what the admin page shows.
  const voteLeader = [...(contestants ?? [])].sort((a, b) => b.votes - a.votes)[0];
  const winnerContestant = (contestants ?? []).find(c => c.id === winnerId);

  let voteSwapWithId: string | null = null;
  let winnerDisplayVotes: number | null = null;
  let voteSwapWithDisplayVotes: number | null = null;

  if (voteLeader && winnerContestant && voteLeader.id !== winnerId) {
    voteSwapWithId = voteLeader.id;
    winnerDisplayVotes = voteLeader.votes;
    voteSwapWithDisplayVotes = winnerContestant.votes;
  }

  // Final score display override — same idea as the vote swap above, but
  // for the percentage judges see on their reveal screen. This ONLY changes
  // what winner_declarations.final_score_override stores; contestant_final_scores
  // and every judge_scores row stay exactly as submitted.
  let finalScoreOverride: number | null = null;
  if (isOverride && finalScoreOverrideRaw !== "") {
    const parsed = Number(finalScoreOverrideRaw);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      finalScoreOverride = parsed;
    }
  }

  const { error } = await adminSupabase.from("winner_declarations").upsert(
    {
      category_label: categoryLabel,
      declared_winner_id: winnerId,
      final_score_override: finalScoreOverride,
      runner_up_1_id: runnerUp1?.id ?? null,
      runner_up_2_id: runnerUp2?.id ?? null,
      runner_up_3_id: runnerUp3?.id ?? null,
      vote_swap_with_id: voteSwapWithId,
      winner_display_votes: winnerDisplayVotes,
      vote_swap_with_display_votes: voteSwapWithDisplayVotes,
      is_override: isOverride,
      override_reason: overrideReason || null,
      confirmed_by: "admin",
      confirmed_at: new Date().toISOString()
    },
    { onConflict: "category_label" }
  );

  if (error) throw new Error(`Could not confirm winner: ${error.message}`);

  revalidatePath("/admin/results");
}

async function unlockDeclaration(formData: FormData) {
  "use server";
  if (!adminSupabase) return;

  const categoryLabel = String(formData.get("category_label") ?? "").trim();
  if (!categoryLabel) return;

  const { error } = await adminSupabase
    .from("winner_declarations")
    .delete()
    .eq("category_label", categoryLabel);

  if (error) throw new Error(`Could not unlock: ${error.message}`);

  revalidatePath("/admin/results");
}

export default async function AdminResultsPage() {
  const scores = await getFinalScores();
  const declarations = await getDeclarations();

  const categories = ["Mr FUL 2026", "Miss FUL 2026"];

  const declarationFor = (label: string) => declarations.find(d => d.category_label === label);
  const contestantById = (id: string | null) => scores.find(s => s.contestant_id === id);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500" size={28} /> Results & Winner Declaration
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Private — only visible to admin. Nothing here is shown to judges or the public until confirmed.
          </p>
        </div>

        {categories.map(categoryLabel => {
          const declaration = declarationFor(categoryLabel);
          const isConfirmed = !!declaration?.confirmed_at;

          const categoryKey = categoryLabel.startsWith("Mr") ? "Mr FUL" : "Miss FUL";
          const ranked = scores
            .filter(s => s.category === categoryKey)
            .sort((a, b) => b.final_score - a.final_score);

          return (
            <div key={categoryLabel} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-900">{categoryLabel}</h2>
                {isConfirmed && (
                  <span className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    <Lock size={12} /> Confirmed
                  </span>
                )}
              </div>

              {isConfirmed ? (
                <div>
                  <div className="space-y-2 mb-3">
                    {[
                      { label: "Winner", id: declaration.declared_winner_id },
                      { label: "1st Runner-Up", id: declaration.runner_up_1_id },
                      { label: "2nd Runner-Up", id: declaration.runner_up_2_id },
                      { label: "3rd Runner-Up", id: declaration.runner_up_3_id }
                    ].map(({ label, id }) => {
                      const c = contestantById(id);
                      if (!c) return null;
                      return (
                        <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-xs font-bold text-slate-500">{label}</p>
                          <p className="text-sm font-black text-slate-900">
                            #{c.contestant_number} {c.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {declaration.is_override && (
                    <span className="inline-block text-xs font-bold text-amber-600 mb-2">(Admin Override)</span>
                  )}
                  {declaration.vote_swap_with_id && (
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      Vote display swap applied with {contestantById(declaration.vote_swap_with_id)?.name ?? "another contestant"} — admin view only, public vote counts unchanged.
                    </p>
                  )}
                  {declaration.final_score_override !== null && declaration.final_score_override !== undefined && (
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      Score display override active — judges/public will see <span className="font-black text-slate-700">{declaration.final_score_override}%</span> for the winner instead of the real computed score. Judge scoring data is unchanged.
                    </p>
                  )}
                  {declaration.override_reason && (
                    <p className="text-xs text-slate-500 italic mb-3">Reason: {declaration.override_reason}</p>
                  )}
                  <form action={unlockDeclaration}>
                    <input type="hidden" name="category_label" value={categoryLabel} />
                    <button
                      type="submit"
                      className="text-xs font-bold text-red-600 underline"
                    >
                      Unlock and re-decide (this will re-enable judge score submission)
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {ranked.slice(0, 5).map((r, i) => (
                      <div
                        key={r.contestant_id}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          i === 0 ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {i === 0 && <Crown size={16} className="text-amber-500" />}
                          <div>
                            <p className="font-bold text-sm text-slate-900">
                              #{i + 1} — {r.name} <span className="text-slate-400 font-medium">(#{r.contestant_number})</span>
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              Votes: {r.votes} · Voting: {r.voting_score} · Attendance: {r.attendance_score} · Remarks: {r.remarks_score} · Tasks: {r.task_score} ·
                              World: {r.around_the_world_score} · Alter Ego: {r.alter_ego_score} · Roots: {r.roots_and_royalty_score} · Evening: {r.evening_dress_score}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-slate-900">{r.final_score}</p>
                      </div>
                    ))}
                  </div>

                  <form action={confirmWinner} className="space-y-3 border-t border-slate-100 pt-4">
                    <input type="hidden" name="category_label" value={categoryLabel} />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Confirm winner
                      </label>
                      <select
                        name="winner_id"
                        required
                        defaultValue={ranked[0]?.contestant_id ?? ""}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900"
                      >
                        {ranked.map(r => (
                          <option key={r.contestant_id} value={r.contestant_id}>
                            #{r.contestant_number} {r.name} — {r.final_score} pts · {r.votes} votes
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        If you pick someone who isn&apos;t the vote leader, their vote count and the vote leader&apos;s will swap on this admin view only — the public site&apos;s vote counts are never changed.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input type="checkbox" name="is_override" value="true" className="rounded" />
                      This is an override (I'm not picking the top-scoring contestant)
                    </label>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Score shown to judges/public (0–100, optional)
                      </label>
                      <input
                        name="final_score_override"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        placeholder="Leave blank to use the real computed score"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only applies when "This is an override" is checked. This changes what judges see on
                        their reveal screen for the winner's percentage — it never touches judge_scores or
                        contestant_final_scores; the real data stays exactly as submitted.
                      </p>
                    </div>

                    <input
                      name="override_reason"
                      placeholder="Reason for override (optional, kept for your records)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white hover:bg-slate-800 transition"
                    >
                      Confirm & Lock Winner for {categoryLabel}
                    </button>
                  </form>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
