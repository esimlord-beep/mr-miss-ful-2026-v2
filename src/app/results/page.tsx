import { adminSupabase } from "@/lib/supabase";
import { Crown, Award } from "lucide-react";

export const dynamic = "force-dynamic";

type ContestantInfo = {
  id: string;
  name: string;
  contestant_number: string;
  department: string | null;
  photo_url: string | null;
  votes: number;
};

type Declaration = {
  category_label: string;
  declared_winner_id: string | null;
  runner_up_1_id: string | null;
  runner_up_2_id: string | null;
  runner_up_3_id: string | null;
  final_score_override: number | null;
  runner_up_1_score_override: number | null;
  runner_up_2_score_override: number | null;
  runner_up_3_score_override: number | null;
  confirmed_at: string | null;
};

type Placement = {
  label: string;
  isWinner: boolean;
  contestant: ContestantInfo | null;
  score: number | null;
};

async function getData() {
  if (!adminSupabase) {
    return {
      declarations: [] as Declaration[],
      contestants: new Map<string, ContestantInfo>(),
      finalScores: new Map<string, number>()
    };
  }

  const [{ data: declData }, { data: contestantData }, { data: scoreData }] = await Promise.all([
    adminSupabase
      .from("winner_declarations")
      .select(
        "category_label, declared_winner_id, runner_up_1_id, runner_up_2_id, runner_up_3_id, final_score_override, runner_up_1_score_override, runner_up_2_score_override, runner_up_3_score_override, confirmed_at"
      )
      .not("confirmed_at", "is", null),
    adminSupabase
      .from("contestants")
      .select("id, name, contestant_number, department, photo_url, votes"),
    adminSupabase.from("contestant_final_scores").select("contestant_id, final_score")
  ]);

  const contestants = new Map<string, ContestantInfo>();
  (contestantData ?? []).forEach(c => {
    contestants.set(c.id, {
      id: c.id,
      name: c.name,
      contestant_number: c.contestant_number,
      department: c.department,
      photo_url: c.photo_url,
      votes: c.votes ?? 0
    });
  });

  const finalScores = new Map<string, number>();
  (scoreData ?? []).forEach(s => {
    finalScores.set(s.contestant_id, Number(s.final_score));
  });

  return { declarations: declData ?? [], contestants, finalScores };
}

function buildPlacements(
  declaration: Declaration | undefined,
  contestants: Map<string, ContestantInfo>,
  finalScores: Map<string, number>
): Placement[] | null {
  if (!declaration?.confirmed_at || !declaration.declared_winner_id) return null;

  const effectiveScore = (id: string | null, override: number | null): number | null => {
    if (!id) return null;
    if (override !== null && override !== undefined) return override;
    return finalScores.get(id) ?? null;
  };

  return [
    {
      label: "Winner",
      isWinner: true,
      contestant: contestants.get(declaration.declared_winner_id) ?? null,
      score: effectiveScore(declaration.declared_winner_id, declaration.final_score_override)
    },
    {
      label: "1st Runner-up",
      isWinner: false,
      contestant: declaration.runner_up_1_id ? contestants.get(declaration.runner_up_1_id) ?? null : null,
      score: effectiveScore(declaration.runner_up_1_id, declaration.runner_up_1_score_override)
    },
    {
      label: "2nd Runner-up",
      isWinner: false,
      contestant: declaration.runner_up_2_id ? contestants.get(declaration.runner_up_2_id) ?? null : null,
      score: effectiveScore(declaration.runner_up_2_id, declaration.runner_up_2_score_override)
    },
    {
      label: "3rd Runner-up",
      isWinner: false,
      contestant: declaration.runner_up_3_id ? contestants.get(declaration.runner_up_3_id) ?? null : null,
      score: effectiveScore(declaration.runner_up_3_id, declaration.runner_up_3_score_override)
    }
  ];
}

function Portrait({ contestant, size }: { contestant: ContestantInfo; size: "lg" | "sm" }) {
  const dim = size === "lg" ? "w-32 h-32 sm:w-40 sm:h-40" : "w-20 h-20 sm:w-24 sm:h-24";
  const ring = size === "lg" ? "ring-[3px] ring-[#D4AF37]" : "ring-2 ring-[#D4AF37]/60";

  return (
    <div className={`relative ${dim} shrink-0`}>
      <div className={`w-full h-full rounded-full overflow-hidden bg-[#20180F] ${ring} ring-offset-4 ring-offset-[#FAF3E3]`}>
        {contestant.photo_url ? (
          <img src={contestant.photo_url} alt={contestant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/30">
            <Award size={size === "lg" ? 40 : 26} />
          </div>
        )}
      </div>
    </div>
  );
}

function WinnerCard({ placement }: { placement: Placement }) {
  const { contestant, score } = placement;
  if (!contestant) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 text-[#D4AF37] mb-3">
        <Crown size={20} fill="#D4AF37" strokeWidth={1} />
        <p className="text-xs font-bold uppercase tracking-[0.25em]">Winner</p>
        <Crown size={20} fill="#D4AF37" strokeWidth={1} />
      </div>
      <Portrait contestant={contestant} size="lg" />
      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1710] mt-5">
        {contestant.name}
      </p>
      <p className="text-xs font-semibold text-[#8A7D63] mt-1 tracking-wide">
        #{contestant.contestant_number}{contestant.department ? ` · ${contestant.department}` : ""}
      </p>
      {score !== null && (
        <p className="mt-4 inline-flex items-center rounded-full bg-[#1C1710] px-5 py-1.5 text-sm font-bold text-[#D4AF37]">
          {score.toFixed(1)}%
        </p>
      )}
      <p className="text-xs font-semibold text-[#8A7D63] mt-2">
        {contestant.votes.toLocaleString()} votes
      </p>
    </div>
  );
}

function RunnerUpCard({ placement, ordinal }: { placement: Placement; ordinal: number }) {
  const { label, contestant, score } = placement;
  if (!contestant) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <Portrait contestant={contestant} size="sm" />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1C1710] text-[#D4AF37] text-[11px] font-bold flex items-center justify-center ring-2 ring-[#FAF3E3]">
          {ordinal}
        </span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B8901F] mt-3">
        {label}
      </p>
      <p className="font-serif text-base sm:text-lg font-bold text-[#1C1710] mt-1 leading-snug">
        {contestant.name}
      </p>
      <p className="text-[11px] font-semibold text-[#8A7D63] mt-0.5">
        #{contestant.contestant_number}
      </p>
      {score !== null && (
        <p className="mt-2 text-xs font-bold text-[#1C1710]/70">
          {score.toFixed(1)}%
        </p>
      )}
      <p className="text-[11px] font-semibold text-[#8A7D63] mt-0.5">
        {contestant.votes.toLocaleString()} votes
      </p>
    </div>
  );
}

export default async function ResultsPage() {
  const { declarations, contestants, finalScores } = await getData();

  const categories = [
    { label: "Mr FUL 2026" },
    { label: "Miss FUL 2026" }
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E3]">
      <div className="bg-[#1C1710] px-4 py-14 sm:py-16 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
          Mr & Miss FUL Night 2026
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF3E3] mt-3">
          Winners & Runners-up
        </h1>
        <div className="w-16 h-px bg-[#D4AF37]/50 mx-auto mt-6" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20 space-y-20">
        {categories.map(cat => {
          const declaration = declarations.find(d => d.category_label === cat.label);
          const placements = buildPlacements(declaration, contestants, finalScores);

          return (
            <div key={cat.label}>
              <div className="text-center mb-10">
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1710]">
                  {cat.label}
                </p>
                <div className="w-10 h-px bg-[#D4AF37] mx-auto mt-3" />
              </div>

              {!placements ? (
                <div className="bg-white/60 rounded-2xl border border-[#D4AF37]/20 px-6 py-14 text-center">
                  <p className="text-sm font-semibold text-[#8A7D63]">
                    Results will be announced soon.
                  </p>
                </div>
              ) : (
                <div>
                  {placements[0].contestant && (
                    <div className="mb-14">
                      <WinnerCard placement={placements[0]} />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 max-w-2xl mx-auto">
                    {placements.slice(1).map((p, i) => (
                      <RunnerUpCard key={i} placement={p} ordinal={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
