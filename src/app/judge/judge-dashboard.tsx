"use client";

import { useState, useEffect, useCallback } from "react";
import { browserSupabase } from "@/lib/supabase-browser";
import { FlaskConical, Radio, Info } from "lucide-react";

type Contestant = { id: string; contestant_number: string; name: string; department: string };

const CRITERIA = [
  { key: "stage_performance", label: "Stage Performance" },
  { key: "qa", label: "Q&A" },
  { key: "outfit", label: "Outfit" },
  { key: "body_language", label: "Body Language" }
] as const;

const DEMO_CONTESTANT: Contestant = {
  id: "demo",
  contestant_number: "000",
  name: "Demo Contestant (Practice Only)",
  department: "N/A"
};

export function JudgeDashboard({ contestants }: { contestants: Contestant[] }) {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [judgeId, setJudgeId] = useState<string | null>(null);
  const [judgeName, setJudgeName] = useState<string>("");
  const [selectedContestantId, setSelectedContestantId] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [lockedScores, setLockedScores] = useState<Record<string, number>>({});
  const [practiceScores, setPracticeScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    async function loadJudge() {
      const { data: { user } } = await browserSupabase.auth.getUser();
      if (!user?.email) return;

      const { data } = await browserSupabase
        .from("judges")
        .select("id, name")
        .eq("email", user.email)
        .maybeSingle();

      if (data) {
        setJudgeId(data.id);
        setJudgeName(data.name);
      }
    }
    loadJudge();
  }, []);

  useEffect(() => {
    if (mode === "live" && contestants.length > 0 && !selectedContestantId) {
      setSelectedContestantId(contestants[0].id);
    }
  }, [mode, contestants, selectedContestantId]);

  const loadLockedScores = useCallback(async () => {
    if (!judgeId || !selectedContestantId || mode !== "live") return;
    setLoadingScores(true);

    const { data } = await browserSupabase
      .from("judge_scores")
      .select("criterion, score")
      .eq("judge_id", judgeId)
      .eq("contestant_id", selectedContestantId);

    const locked: Record<string, number> = {};
    (data ?? []).forEach(row => {
      locked[row.criterion] = Number(row.score);
    });
    setLockedScores(locked);
    setLoadingScores(false);
  }, [judgeId, selectedContestantId, mode]);

  useEffect(() => {
    loadLockedScores();
  }, [loadLockedScores]);

  function currentScoreFor(criterion: string): number {
    if (mode === "test") return practiceScores[criterion] ?? 5;
    if (lockedScores[criterion] !== undefined) return lockedScores[criterion];
    return scores[criterion] ?? 5;
  }

  function isLocked(criterion: string): boolean {
    return mode === "live" && lockedScores[criterion] !== undefined;
  }

  function handleSliderChange(criterion: string, value: number) {
    if (mode === "test") {
      setPracticeScores(prev => ({ ...prev, [criterion]: value }));
    } else {
      setScores(prev => ({ ...prev, [criterion]: value }));
    }
  }

  async function handleSubmit(criterion: string) {
    if (mode === "test") return;
    if (!judgeId || !selectedContestantId) return;
    setSaving(true);
    setError("");

    const value = scores[criterion] ?? 5;

    const { error: insertError } = await browserSupabase.from("judge_scores").insert({
      judge_id: judgeId,
      contestant_id: selectedContestantId,
      criterion,
      score: value
    });

    if (insertError) {
      setError(`Could not submit score: ${insertError.message}`);
    } else {
      setLockedScores(prev => ({ ...prev, [criterion]: value }));
    }
    setSaving(false);
  }

  const activeContestant = mode === "test"
    ? DEMO_CONTESTANT
    : contestants.find(c => c.id === selectedContestantId);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#0B132B] pb-20">
      <div className="bg-[#0B132B] px-4 py-5 sticky top-0 z-10">
        <h1 className="font-rounded text-xl font-black text-white">Judge Dashboard</h1>
        <p className="text-white/50 text-xs mt-0.5 font-medium">
          {judgeName ? `Welcome, ${judgeName}` : "Mr & Miss FUL Night 2026"}
        </p>

        <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-full p-1">
          <button
            onClick={() => setMode("test")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-black transition ${
              mode === "test" ? "bg-slate-500 text-white" : "text-white/50"
            }`}
          >
            <FlaskConical size={13} /> Test Mode
          </button>
          <button
            onClick={() => setMode("live")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-black transition ${
              mode === "live" ? "bg-[#D4AF37] text-[#0B132B]" : "text-white/50"
            }`}
          >
            <Radio size={13} /> Live Mode
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-4 mb-5 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04] flex gap-3">
          <Info size={18} className="text-[#B8901F] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#0B132B] mb-1">How scoring works</p>
            <p className="text-xs text-[#0B132B]/60 font-medium leading-relaxed">
              Public voting is 40% of the final result. Instructor attendance and tasks are 20%.
              Your judging tonight is 40%, split evenly across 4 criteria (10% each): Stage Performance,
              Q&A, Outfit, and Body Language. Once you submit a score for a contestant on a criterion in
              Live Mode, it locks permanently and cannot be changed.
            </p>
          </div>
        </div>

        {mode === "test" && (
          <div className="bg-slate-100 border border-slate-300 rounded-2xl p-3 mb-4 text-center">
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
              Practice Mode — nothing here is saved or counted
            </p>
          </div>
        )}

        {mode === "live" && (
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#0B132B]/40 mb-1.5">
              Select Contestant
            </label>
            <select
              value={selectedContestantId}
              onChange={e => setSelectedContestantId(e.target.value)}
              className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-3 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37] mb-4"
            >
              {contestants.map(c => (
                <option key={c.id} value={c.id}>#{c.contestant_number} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        {activeContestant && (
          <div className="bg-white rounded-2xl p-4 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]">
            <p className="font-rounded font-bold text-[#0B132B] mb-4">
              #{activeContestant.contestant_number} {activeContestant.name}
            </p>

            <div className="space-y-5">
              {CRITERIA.map(({ key, label }) => {
                const locked = isLocked(key);
                const value = currentScoreFor(key);

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-[#0B132B]">{label}</p>
                      <p className="text-sm font-black text-[#B8901F]">{value.toFixed(1)} / 10</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={value}
                      disabled={locked || loadingScores}
                      onChange={e => handleSliderChange(key, Number(e.target.value))}
                      className="w-full accent-[#D4AF37] disabled:opacity-40"
                    />
                    {mode === "live" && (
                      locked ? (
                        <p className="text-xs font-bold text-emerald-700 mt-1">✓ Submitted and locked</p>
                      ) : (
                        <button
                          onClick={() => handleSubmit(key)}
                          disabled={saving}
                          className="mt-2 w-full rounded-full bg-[#0B132B] py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          {saving ? "Submitting..." : "Submit Score (cannot be changed after)"}
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
