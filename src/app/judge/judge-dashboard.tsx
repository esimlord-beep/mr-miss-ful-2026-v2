"use client";

import { useState, useEffect, useCallback } from "react";
import { browserSupabase } from "@/lib/supabase-browser";
import { Info, ChevronDown, Check } from "lucide-react";

type Contestant = { id: string; contestant_number: string; name: string; department: string; category?: string; photo_url?: string | null };
type WinnerDeclaration = {
  category_label: string;
  declared_winner_id: string | null;
  runner_up_1_id: string | null;
  runner_up_2_id: string | null;
  runner_up_3_id: string | null;
  runner_up_1_score_override: number | null;
  runner_up_2_score_override: number | null;
  runner_up_3_score_override: number | null;
  confirmed_at: string | null;
  final_score_override: number | null;
};

const ROUNDS = [
  {
    key: "around_the_world",
    label: "Round 1: Around the World in Style",
    subcriteria: [
      { key: "catwalk", label: "Catwalk" },
      { key: "charisma", label: "Charisma" },
      { key: "outfit_style", label: "Outfit/Style" },
      { key: "question", label: "Question" }
    ]
  },
  {
    key: "alter_ego",
    label: "Round 2: Alter Ego",
    subcriteria: [
      { key: "confidence", label: "Confidence" },
      { key: "creativity", label: "Creativity" },
      { key: "transformation", label: "Transformation" },
      { key: "question", label: "Question" }
    ]
  },
  {
    key: "roots_and_royalty",
    label: "Round 3: Roots and Royalty",
    subcriteria: [
      { key: "aura", label: "Aura" },
      { key: "stage_management", label: "Stage Management" },
      { key: "innovation_style", label: "Innovation & Style" },
      { key: "question", label: "Question" }
    ]
  },
  {
    key: "evening_dress",
    label: "Round 4: Evening Dress & Suit",
    subcriteria: [
      { key: "catwalk", label: "Catwalk" },
      { key: "charisma", label: "Charisma" },
      { key: "stage_presence", label: "Stage Presence" },
      { key: "question", label: "Question" }
    ]
  }
] as const;

const ALL_CRITERIA = ROUNDS.flatMap(round =>
  round.subcriteria.map(sub => ({
    key: `${round.key}__${sub.key}`,
    roundLabel: round.label,
    subLabel: sub.label
  }))
);

const ROUND_LABEL_PATTERN = /^Round (\d+):\s*(.+)$/;

function splitRoundLabel(label: string): { number: string; name: string } {
  const match = label.match(ROUND_LABEL_PATTERN);
  return match ? { number: match[1], name: match[2] } : { number: "", name: label };
}

const DEMO_CONTESTANT: Contestant = {
  id: "demo",
  contestant_number: "000",
  name: "Demo Contestant",
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

  const [viewIndex, setViewIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    async function loadJudgeFromEmail(email: string) {
      const { data } = await browserSupabase
        .from("judges")
        .select("id, name")
        .eq("email", email)
        .maybeSingle();

      if (data) {
        setJudgeId(data.id);
        setJudgeName(data.name);
      }
    }

    browserSupabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        loadJudgeFromEmail(session.user.email);
      }
    });

    const { data: authListener } = browserSupabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        loadJudgeFromEmail(session.user.email);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mode === "live" && contestants.length > 0 && !selectedContestantId) {
      setSelectedContestantId(contestants[0].id);
    }
  }, [mode, contestants, selectedContestantId]);

  useEffect(() => {
    setViewIndex(0);
  }, [mode, selectedContestantId]);

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
    && totalSubmittedByMe >= contestants.length * ALL_CRITERIA.length;

  useEffect(() => {
    if (!isJudgeDone) return;
    // Fire-and-forget: server figures out if EVERY judge is done and emails
    // admin at most once. Safe to call every time any judge finishes.
    fetch("/api/judge/notify-if-all-done", { method: "POST" }).catch(() => {});
  }, [isJudgeDone]);

  useEffect(() => {
    if (!isJudgeDone) return;

    let cancelled = false;

    async function poll() {
      const { data: declData } = await browserSupabase
        .from("winner_declarations")
        .select("category_label, declared_winner_id, runner_up_1_id, runner_up_2_id, runner_up_3_id, runner_up_1_score_override, runner_up_2_score_override, runner_up_3_score_override, confirmed_at, final_score_override")
        .not("confirmed_at", "is", null);

      if (cancelled) return;
      setDeclarations(declData ?? []);

      if ((declData ?? []).length > 0) {
        const { data: allC } = await browserSupabase
          .from("contestants")
          .select("id, contestant_number, name, department, category, photo_url");
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
    if (mode === "test") return practiceScores[criterion] ?? 1.25;
    if (lockedScores[criterion] !== undefined) return lockedScores[criterion];
    return scores[criterion] ?? 1.25;
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

    const value = scores[criterion] ?? 1.25;

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
        <div className="min-h-screen bg-[#1C1710] text-[#FAF3E3] px-4 py-14 sm:py-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
            Mr & Miss FUL Night 2026 — Results
          </p>
          <h1 className="text-center font-serif text-2xl sm:text-3xl font-bold mb-2">The Winners Are In!</h1>
          <div className="w-12 h-px bg-[#D4AF37]/40 mx-auto mb-12" />

          <div className="max-w-md mx-auto space-y-16">
            {declarations.map(decl => {
              const winner = allContestantsForReveal.find(c => c.id === decl.declared_winner_id);
              const pct = decl.final_score_override !== null && decl.final_score_override !== undefined
                ? decl.final_score_override
                : decl.declared_winner_id ? finalScores[decl.declared_winner_id] : undefined;
              const runnerUps = [
                { id: decl.runner_up_1_id, override: decl.runner_up_1_score_override },
                { id: decl.runner_up_2_id, override: decl.runner_up_2_score_override },
                { id: decl.runner_up_3_id, override: decl.runner_up_3_score_override }
              ]
                .map(({ id, override }, i) => ({
                  ordinal: i + 1,
                  contestant: id ? allContestantsForReveal.find(c => c.id === id) : undefined,
                  score: override !== null && override !== undefined ? override : (id ? finalScores[id] : undefined)
                }))
                .filter(r => r.contestant);

              return (
                <div key={decl.category_label}>
                  <p className="text-center text-xs font-bold uppercase tracking-widest text-[#FAF3E3]/40 mb-6">
                    {decl.category_label}
                  </p>

                  {winner && (
                    <div className="flex flex-col items-center text-center mb-10">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
                        Winner
                      </p>
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white/5 ring-[3px] ring-[#D4AF37] ring-offset-4 ring-offset-[#1C1710]">
                        {winner.photo_url ? (
                          <img src={winner.photo_url} alt={winner.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/30 text-3xl font-serif">
                            {winner.contestant_number}
                          </div>
                        )}
                      </div>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#FAF3E3] mt-4">
                        {winner.name}
                      </p>
                      <p className="text-xs font-semibold text-[#FAF3E3]/40 mt-1">
                        #{winner.contestant_number}
                      </p>
                      {pct !== undefined && (
                        <p className="mt-3 inline-flex items-center rounded-full bg-[#D4AF37] px-4 py-1 text-sm font-bold text-[#1C1710]">
                          {pct.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}

                  {runnerUps.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {runnerUps.map(r => (
                        <div key={r.ordinal} className="flex flex-col items-center text-center">
                          <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/5 ring-2 ring-[#D4AF37]/50">
                              {r.contestant!.photo_url ? (
                                <img src={r.contestant!.photo_url} alt={r.contestant!.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/30 text-sm font-serif">
                                  {r.contestant!.contestant_number}
                                </div>
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#1C1710] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1C1710]">
                              {r.ordinal}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#FAF3E3]/85 mt-2.5 leading-snug">
                            {r.contestant!.name}
                          </p>
                          {r.score !== undefined && (
                            <p className="text-[11px] font-bold text-[#D4AF37]/80 mt-1">{r.score.toFixed(1)}%</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1C1710] text-[#FAF3E3] flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
            Mr & Miss FUL Night 2026
          </p>
          <h1 className="font-serif text-xl font-bold mb-4">
            Thank you for participating as a judge!
          </h1>
          <p className="text-sm text-[#FAF3E3]/60 font-medium leading-relaxed">
            Please wait a few minutes while we compile the results.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const currentRound = viewIndex < ROUNDS.length ? ROUNDS[viewIndex] : null;
  const currentRoundInfo = currentRound ? splitRoundLabel(currentRound.label) : null;

  const roundTotals = ROUNDS.map(round => {
    const info = splitRoundLabel(round.label);
    const total = round.subcriteria.reduce(
      (sum, sub) => sum + currentScoreFor(`${round.key}__${sub.key}`),
      0
    );
    return { key: round.key, number: info.number, name: info.name, total };
  });
  const grandTotal = roundTotals.reduce((sum, r) => sum + r.total, 0);
  const maxTotal = ROUNDS.length * 10;

  const allLockedForContestant = mode === "live" &&
    ALL_CRITERIA.every(c => lockedScores[c.key] !== undefined);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#0B132B]">
      <div className="bg-[#0B132B] px-4 pt-4 pb-3.5 sticky top-0 z-20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">
              Mr & Miss FUL Night 2026
            </p>
            <h1 className="font-rounded text-[19px] font-black text-white leading-tight mt-0.5">
              Judge Dashboard
            </h1>
          </div>
          {judgeName && (
            <p className="text-[11px] font-semibold text-white/40 shrink-0 mt-1 truncate max-w-[35%]">
              {judgeName}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={mode === "live"}
            onClick={() => setMode(mode === "live" ? "test" : "live")}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              mode === "live" ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                mode === "live" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-xs font-black ${mode === "live" ? "text-emerald-400" : "text-white/50"}`}>
            {mode === "live" ? "Live" : "Test"}
          </span>
        </div>
      </div>

      <div className="px-4 pt-3 pb-28">
        {mode === "test" && (
          <div className="flex items-center gap-1.5 rounded-lg bg-[#0B132B]/[0.04] border border-[#0B132B]/10 px-3 py-2 mb-3">
            <span className="text-sm leading-none">🧪</span>
            <p className="text-[11px] font-bold text-[#0B132B]/60">
              Practice Mode · Scores won&apos;t be saved
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.03] mb-3 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInfo(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#0B132B]">
              <Info size={13} className="text-[#B8901F]" /> How scoring works
            </span>
            <ChevronDown
              size={14}
              className={`text-[#0B132B]/40 transition-transform ${showInfo ? "rotate-180" : ""}`}
            />
          </button>
          {showInfo && (
            <p className="px-3.5 pb-3 text-[11px] text-[#0B132B]/60 font-medium leading-relaxed">
              Public voting is 35% of the final result. Camp score — attendance, instructor
              remarks, and tasks — makes up 25%. Your judging tonight is 40%, split across 4
              rounds worth 10 marks each: Around the World in Style, Alter Ego, Roots and
              Royalty, and Evening Dress & Suit. Each round has 4 criteria worth 2.5 marks each.
              Once you submit a score for a criterion in Live Mode, it locks permanently and
              cannot be changed.
            </p>
          )}
        </div>

        {mode === "live" && (
          <div className="mb-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B132B]/40 mb-1">
              Contestant
            </label>
            <select
              value={selectedContestantId}
              onChange={e => setSelectedContestantId(e.target.value)}
              className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-2.5 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37]"
            >
              {contestants.map(c => (
                <option key={c.id} value={c.id}>{c.contestant_number} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-lg text-center mb-3">
            {error}
          </div>
        )}

        {activeContestant && (
          <>
            <div className="bg-white rounded-2xl px-4 py-3 mb-3 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B8901F]">
                  Contestant #{activeContestant.contestant_number}
                </p>
                <p className="font-rounded text-base font-black text-[#0B132B] truncate">
                  {activeContestant.name}
                </p>
              </div>
              {mode === "test" && (
                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                  Practice
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              {ROUNDS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === viewIndex ? "w-5 bg-[#D4AF37]" : "w-1.5 bg-[#0B132B]/15"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-[11px] font-bold text-[#0B132B]/40 mb-3">
              {currentRound
                ? `Round ${viewIndex + 1} of ${ROUNDS.length}`
                : "Final Score Review"}
            </p>

            {currentRound && currentRoundInfo && (
              <div className="bg-white rounded-2xl border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04] overflow-hidden mb-3">
                <div className="px-4 pt-3.5 pb-3 border-b border-[#0B132B]/[0.06] flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0B132B]/40">
                      Round {currentRoundInfo.number}
                    </p>
                    <p className="font-rounded text-sm font-black text-[#0B132B] leading-snug">
                      {currentRoundInfo.name}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-black text-[#B8901F] font-rounded">
                    {roundTotals[viewIndex].total.toFixed(2)}
                    <span className="text-[#0B132B]/30 text-xs font-bold"> / 10</span>
                  </p>
                </div>

                <div className="px-4 py-1 divide-y divide-[#0B132B]/[0.05]">
                  {currentRound.subcriteria.map(sub => {
                    const criterionKey = `${currentRound.key}__${sub.key}`;
                    const locked = isLocked(criterionKey);
                    const value = currentScoreFor(criterionKey);
                    const fillPct = (value / 2.5) * 100;

                    return (
                      <div key={criterionKey} className="py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[13px] font-bold text-[#0B132B]/75">{sub.label}</p>
                          <p className="text-[13px] font-black text-[#B8901F]">
                            {value.toFixed(2)}
                            <span className="text-[#0B132B]/30 font-bold"> / 2.50</span>
                          </p>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={2.5}
                          step={0.25}
                          value={value}
                          disabled={locked || loadingScores}
                          onChange={e => handleSliderChange(criterionKey, Number(e.target.value))}
                          style={{ "--slider-fill": `${fillPct}%` } as React.CSSProperties}
                          className="judge-slider w-full"
                        />
                        {mode === "live" && (
                          locked ? (
                            <p className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                              <Check size={11} strokeWidth={3} /> Submitted and locked
                            </p>
                          ) : (
                            <button
                              onClick={() => handleSubmit(criterionKey)}
                              disabled={saving}
                              className="mt-1.5 w-full rounded-lg bg-[#0B132B] py-1.5 text-[11px] font-black text-white disabled:opacity-50 active:scale-[0.98] transition"
                            >
                              {saving ? "Submitting..." : "Submit (cannot be changed after)"}
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!currentRound && (
              <div className="bg-white rounded-2xl border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04] overflow-hidden mb-3">
                <div className="px-4 pt-3.5 pb-3 border-b border-[#0B132B]/[0.06]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0B132B]/40">
                    Final Score
                  </p>
                  <p className="font-rounded text-sm font-black text-[#0B132B]">
                    {activeContestant.contestant_number} {activeContestant.name}
                  </p>
                </div>

                <div className="px-4 py-1 divide-y divide-[#0B132B]/[0.05]">
                  {roundTotals.map((r, i) => (
                    <div key={r.key} className="flex items-center justify-between py-2.5">
                      <button
                        type="button"
                        onClick={() => setViewIndex(i)}
                        className="text-[13px] font-bold text-[#0B132B]/75 text-left"
                      >
                        Round {r.number} · {r.name}
                      </button>
                      <p className="text-[13px] font-black text-[#0B132B]">
                        {r.total.toFixed(2)}
                        <span className="text-[#0B132B]/30 font-bold"> / 10</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-[#0B132B]/[0.06] flex items-center justify-between">
                  <p className="text-sm font-black text-[#0B132B]">TOTAL</p>
                  <p className="text-lg font-black text-[#B8901F] font-rounded">
                    {grandTotal.toFixed(2)}
                    <span className="text-[#0B132B]/30 text-xs font-bold"> / {maxTotal}</span>
                  </p>
                </div>

                {mode === "live" && (
                  <div className="px-4 pb-4">
                    {allLockedForContestant ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 py-2.5">
                        <Check size={13} className="text-emerald-700" strokeWidth={3} />
                        <p className="text-[11px] font-black text-emerald-700">
                          All scores submitted and locked
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-50 border border-amber-100 py-2.5 px-3 text-center">
                        <p className="text-[11px] font-bold text-amber-700">
                          Some scores aren&apos;t submitted yet — tap a round above to submit them.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {mode === "test" && (
                  <div className="px-4 pb-4">
                    <p className="text-center text-[11px] font-bold text-[#0B132B]/40">
                      Practice scores aren&apos;t saved.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {activeContestant && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-[#0B132B]/[0.08] px-4 py-3 flex items-center gap-2"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => setViewIndex(v => Math.max(0, v - 1))}
            disabled={viewIndex === 0}
            className="flex-1 rounded-xl border border-[#0B132B]/15 py-2.5 text-xs font-black text-[#0B132B] disabled:opacity-30"
          >
            ← Previous
          </button>
          {currentRound ? (
            <button
              onClick={() => setViewIndex(v => Math.min(ROUNDS.length, v + 1))}
              className="flex-1 rounded-xl bg-[#0B132B] py-2.5 text-xs font-black text-white"
            >
              {viewIndex === ROUNDS.length - 1 ? "Review Scores →" : "Next Round →"}
            </button>
          ) : (
            <button
              onClick={() => setViewIndex(ROUNDS.length - 1)}
              className="flex-1 rounded-xl bg-[#D4AF37] py-2.5 text-xs font-black text-[#0B132B]"
            >
              ← Back to Rounds
            </button>
          )}
        </div>
      )}
    </div>
  );
}
