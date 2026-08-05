"use client";

import { useState, useEffect, useCallback } from "react";
import { browserSupabase } from "@/lib/supabase-browser";
import { FlaskConical, Radio, Info } from "lucide-react";

type Contestant = { id: string; contestant_number: string; name: string; department: string; category?: string };
type WinnerDeclaration = {
  category_label: string;
  declared_winner_id: string | null;
  confirmed_at: string | null;
};

const CRITERIA = [
  { key: "around_the_world", label: "Around the World in Style" },
  { key: "alter_ego", label: "Alter Ego" },
  { key: "roots_and_royalty", label: "Roots and Royalty" },
  { key: "evening_dress", label: "Evening Dress/Suit" }
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
  const [totalSubmittedByMe, setTotalSubmittedByMe] = useState<number | null>(null);
  const [declarations, setDeclarations] = useState<WinnerDeclaration[]>([]);
  const [allContestantsForReveal, setAllContestantsForReveal] = useState<Contestant[]>([]);
  const [finalScores, setFinalScores] = useState<Record<string, number>>({});

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

  const checkCompletion = useCallback(async () => {
    if (!judgeId || mode !== "live" || contestants.length === 0) return;

    const { count } = await browserSupabase
      .from("judge_scores")
      .select("id", { count: "exact", head: true })
      .eq("judge_id", judgeId);

    setTotalSubmittedByMe(count ?? 0);
  }, [judgeId, mode, contestants.length]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion, lockedScores]);

  const isJudgeDone = totalSubmittedByMe !== null && contestants.length > 0
    && totalSubmittedByMe >= contestants.length * CRITERIA.length;

  useEffect(() => {
    if (!isJudgeDone) return;

    let cancelled = false;

    async function poll() {
      const { data: declData } = await browserSupabase
        .from("winner_declarations")
        .select("category_label, declared_winner_id, confirmed_at")
        .not("confirmed_at", "is", null);

      if (cancelled) return;
      setDeclarations(declData ?? []);

      if ((declData ?? []).length > 0) {
        const { data: allC } = await browserSupabase
          .from("contestants")
          .select("id, contestant_number, name, department, category");
        const { data: scoresData } = await browserSupabase
          .from("contestant_final_scores")
          .select("contestant_id, final_score");

        if (!cancelled) {
          setAllContestantsForReveal(allC ?? []);
          const scoreMap: Record<string, number> = {};
          (scoresData ?? []).forEach(s => {
            scoreMap[s.contestant_id] = Number(s.final_score);
          });
          setFinalScores(scoreMap);
        }
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isJudgeDone]);

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

    if (lockedScores[criterion] !== undefined) {
      setError("You've already submitted a score for this round.");
      return;
    }

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
      if (insertError.code === "23505") {
        setError("This score was already submitted — refreshing your locked scores.");
        await loadLockedScores();
      } else {
        setError(`Could not submit score: ${insertError.message}`);
      }
    } else {
      setLockedScores(prev => ({ ...prev, [criterion]: value }));
    }
    setSaving(false);
  }

  const activeContestant = mode === "test"
    ? DEMO_CONTESTANT
    : contestants.find(c => c.id === selectedContestantId);

  const bothConfirmed = declarations.length >= 2 &&
    declarations.every(d => d.confirmed_at);

  if (mode === "live" && isJudgeDone) {
    if (bothConfirmed) {
      return (
        <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center">
            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-2">
              Mr & Miss FUL Night 2026 — Results
            </p>
            <h1 className="font-rounded text-2xl font-black mb-8">The Winners Are In!</h1>

            <div className="space-y-6">
              {declarations.map(decl => {
                const winner = allContestantsForReveal.find(c => c.id === decl.declared_winner_id);
                const pct = decl.declared_winner_id ? finalScores[decl.declared_winner_id] : undefined;
                return (
                  <div key={decl.category_label} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                      {decl.category_label}
                    </p>
                    <p className="font-rounded text-xl font-black text-[#D4AF37]">
                      {winner ? `${winner.contestant_number} ${winner.name}` : "—"}
                    </p>
                    {pct !== undefined && (
                      <p className="text-sm font-bold text-white/70 mt-1">{pct.toFixed(1)}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-2">
            Mr & Miss FUL Night 2026
          </p>
          <h1 className="font-rounded text-xl font-black mb-4">
            Thank you for participating as a judge!
          </h1>
          <p className="text-sm text-white/60 font-medium leading-relaxed">
            Please wait a few minutes while we compile the results.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

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
              Your judging tonight is 40%, split evenly across 4 rounds (10% each): Around the World
              in Style, Alter Ego, Roots and Royalty, and Evening Dress/Suit. Once you submit a score
              for a contestant in a round in Live Mode, it locks permanently and cannot be changed.
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
                <option key={c.id} value={c.id}>{c.contestant_number} {c.name}</option>
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
              {activeContestant.contestant_number} {activeContestant.name}
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
