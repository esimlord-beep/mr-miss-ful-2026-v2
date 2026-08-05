import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Gavel, Pencil, Trash2, X, CheckCircle2 } from "lucide-react";

const CRITERIA = [
  { key: "stage_performance", label: "Stage Performance" },
  { key: "qa", label: "Q&A" },
  { key: "outfit", label: "Outfit" },
  { key: "body_language", label: "Body Language" }
] as const;

type Judge = { id: string; name: string; email: string };
type Contestant = { id: string; contestant_number: string; name: string; category: string; department: string };
type ScoreRow = { id: string; judge_id: string; contestant_id: string; criterion: string; score: number };

async function getJudges(): Promise<Judge[]> {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase.from("judges").select("id, name, email").order("name");
  return data ?? [];
}

async function getContestants(): Promise<Contestant[]> {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("contestants")
    .select("id, contestant_number, name, category, department")
    .order("contestant_number");
  return data ?? [];
}

async function getScores(): Promise<ScoreRow[]> {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("judge_scores")
    .select("id, judge_id, contestant_id, criterion, score");
  return data ?? [];
}

async function overrideScores(formData: FormData) {
  "use server";
  if (!adminSupabase) return;

  const judgeId = String(formData.get("judge_id") ?? "").trim();
  const contestantId = String(formData.get("contestant_id") ?? "").trim();
  if (!judgeId || !contestantId) return;

  for (const { key } of CRITERIA) {
    const raw = formData.get(key);

    // Always clear the existing row for this criterion first — avoids
    // relying on a unique constraint that may or may not exist in the DB.
    await adminSupabase
      .from("judge_scores")
      .delete()
      .eq("judge_id", judgeId)
      .eq("contestant_id", contestantId)
      .eq("criterion", key);

    if (raw !== null && String(raw).trim() !== "") {
      const value = Number(raw);
      if (!Number.isNaN(value)) {
        await adminSupabase.from("judge_scores").insert({
          judge_id: judgeId,
          contestant_id: contestantId,
          criterion: key,
          score: value
        });
      }
    }
  }

  revalidatePath("/admin/judges");
  revalidatePath("/admin/results");
}

async function clearScores(formData: FormData) {
  "use server";
  if (!adminSupabase) return;

  const judgeId = String(formData.get("judge_id") ?? "").trim();
  const contestantId = String(formData.get("contestant_id") ?? "").trim();
  if (!judgeId || !contestantId) return;

  await adminSupabase
    .from("judge_scores")
    .delete()
    .eq("judge_id", judgeId)
    .eq("contestant_id", contestantId);

  revalidatePath("/admin/judges");
  revalidatePath("/admin/results");
}

export default async function AdminJudgesPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const [judges, contestants, scores] = await Promise.all([
    getJudges(),
    getContestants(),
    getScores()
  ]);

  const scoreMap = new Map<string, Record<string, number>>();
  for (const row of scores) {
    const key = `${row.judge_id}__${row.contestant_id}`;
    if (!scoreMap.has(key)) scoreMap.set(key, {});
    scoreMap.get(key)![row.criterion] = Number(row.score);
  }

  const scoredCount = (judgeId: string, contestantId: string) => {
    const entry = scoreMap.get(`${judgeId}__${contestantId}`) ?? {};
    return CRITERIA.filter(c => entry[c.key] !== undefined).length;
  };

  const totalFor = (judgeId: string, contestantId: string) => {
    const entry = scoreMap.get(`${judgeId}__${contestantId}`) ?? {};
    return CRITERIA.reduce((sum, c) => sum + (entry[c.key] ?? 0), 0);
  };

  const totalPossibleCells = judges.length * contestants.length * CRITERIA.length;
  const totalFilledCells = scores.length;

  const [editJudgeId, editContestantId] = (params.edit ?? "").split("__");
  const editJudge = judges.find(j => j.id === editJudgeId);
  const editContestant = contestants.find(c => c.id === editContestantId);
  const editEntry = editJudge && editContestant
    ? scoreMap.get(`${editJudge.id}__${editContestant.id}`) ?? {}
    : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Gavel className="text-blue-700" size={28} /> Judge Scores
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            View every judge's raw scores per contestant and criterion. You can override or clear
            any score here — this bypasses the lock judges see on their own dashboard.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
          {[
            { label: "Judges", value: judges.length.toString() },
            { label: "Contestants", value: contestants.length.toString() },
            { label: "Scores Submitted", value: `${totalFilledCells}/${totalPossibleCells}` },
            { label: "Criteria", value: CRITERIA.length.toString() }
          ].map(({ label, value }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
            </article>
          ))}
        </div>

        {editJudge && editContestant && editEntry && (
          <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Override — {editJudge.name} × #{editContestant.contestant_number} {editContestant.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Leave a field blank to remove that score entirely (unlocks it for the judge to resubmit).
                </p>
              </div>
              <a href="/admin/judges" className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </a>
            </div>

            <form action={overrideScores} className="space-y-4">
              <input type="hidden" name="judge_id" value={editJudge.id} />
              <input type="hidden" name="contestant_id" value={editContestant.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                {CRITERIA.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      name={key}
                      min={0}
                      max={10}
                      step={0.5}
                      defaultValue={editEntry[key] ?? ""}
                      placeholder="—"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-blue-700 px-6 py-3 text-sm font-black text-white hover:bg-blue-900"
                >
                  Save Override
                </button>
                
                  href="/admin/judges"
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </a>
              </div>
            </form>

            <form action={clearScores} className="mt-3">
              <input type="hidden" name="judge_id" value={editJudge.id} />
              <input type="hidden" name="contestant_id" value={editContestant.id} />
              <button
                type="submit"
                className="text-xs font-bold text-rose-600 underline"
              >
                Clear all of this judge's scores for this contestant
              </button>
            </form>
          </section>
        )}

        {judges.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
            No judges have been added yet.
          </div>
        )}

        <div className="space-y-4">
          {contestants.map(contestant => {
            const filledForContestant = judges.reduce(
              (sum, j) => sum + scoredCount(j.id, contestant.id),
              0
            );
            const possibleForContestant = judges.length * CRITERIA.length;

            return (
              <details
                key={contestant.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden group"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="text-xs font-black text-blue-700">
                      #{contestant.contestant_number} · {contestant.category}
                    </p>
                    <p className="font-black text-slate-900">{contestant.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{contestant.department}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {possibleForContestant > 0 && filledForContestant === possibleForContestant && (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                    <span className="text-xs font-bold text-slate-400">
                      {filledForContestant}/{possibleForContestant} scores
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider">Judge</th>
                        {CRITERIA.map(c => (
                          <th key={c.key} className="px-3 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-center">
                            {c.label}
                          </th>
                        ))}
                        <th className="px-3 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-center">Total</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {judges.map(judge => {
                        const entry = scoreMap.get(`${judge.id}__${contestant.id}`) ?? {};
                        const complete = scoredCount(judge.id, contestant.id) === CRITERIA.length;

                        return (
                          <tr key={judge.id} className="border-t border-slate-50">
                            <td className="px-4 py-2.5">
                              <p className="font-bold text-slate-900">{judge.name}</p>
                              <p className="text-xs text-slate-400">{judge.email}</p>
                            </td>
                            {CRITERIA.map(c => (
                              <td key={c.key} className="px-3 py-2.5 text-center font-semibold text-slate-700">
                                {entry[c.key] !== undefined ? entry[c.key].toFixed(1) : "—"}
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-center font-black text-slate-900">
                              {complete ? totalFor(judge.id, contestant.id).toFixed(1) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              
                                href={`/admin/judges?edit=${judge.id}__${contestant.id}`}
                                className="inline-flex items-center gap-1 text-xs font-black text-blue-700 hover:underline"
                              >
                                <Pencil size={12} /> Edit
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                      {judges.length === 0 && (
                        <tr>
                          <td colSpan={CRITERIA.length + 3} className="px-4 py-4 text-center text-slate-400 font-semibold">
                            No judges yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}

          {contestants.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              No contestants yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
