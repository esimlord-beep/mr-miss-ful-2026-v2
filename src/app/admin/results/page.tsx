import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Trophy, Crown, Lock } from "lucide-react";

async function getFinalScores() {
  if (!adminSupabase) return [];
  const [{ data: scores }, { data: contestants }] = await Promise.all([
    adminSupabase.from("contestant_final_scores").select("*"),
    adminSupabase.from("contestants").select("id, category")
  ]);

  const categoryById = new Map((contestants ?? []).map(c => [c.id, c.category]));

  return (scores ?? []).map(s => ({
    ...s,
    category: categoryById.get(s.contestant_id) ?? "Unknown"
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

  if (!categoryLabel || !winnerId) return;

  const { error } = await adminSupabase.from("winner_declarations").upsert(
    {
      category_label: categoryLabel,
      declared_winner_id: winnerId,
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

          const categoryKey = categoryLabel.startsWith("Mr") ? "Mr" : "Miss";
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
                  <p className="text-sm text-slate-600 font-medium mb-3">
                    Winner: <span className="font-black text-slate-900">
                      {ranked.find(r => r.contestant_id === declaration.declared_winner_id)?.name ?? "Unknown"}
                    </span>
                    {declaration.is_override && (
                      <span className="ml-2 text-xs font-bold text-amber-600">(Admin Override)</span>
                    )}
                  </p>
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
                              Voting: {r.voting_score} · Attendance: {r.attendance_score} · Tasks: {r.task_score} ·
                              Stage: {r.stage_performance_score} · Q&A: {r.qa_score} · Outfit: {r.outfit_score} · Body: {r.body_language_score}
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
                            #{r.contestant_number} {r.name} — {r.final_score} pts
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input type="checkbox" name="is_override" value="true" className="rounded" />
                      This is an override (I'm not picking the top-scoring contestant)
                    </label>

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
