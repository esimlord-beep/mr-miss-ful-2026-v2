import { Users, Trophy, Radio, Wallet } from "lucide-react";

export function StatsBar({
  contestantCount,
  categoryCount,
  prizePool,
}: {
  contestantCount: number;
  categoryCount: number;
  prizePool: string;
}) {
  const stats = [
    { label: "Contestants", value: String(contestantCount), icon: Users },
    { label: "Award Categories", value: String(categoryCount), icon: Trophy },
    { label: "Live Voting", value: "Open", icon: Radio },
    { label: "Prize Pool", value: prizePool, icon: Wallet },
  ];

  return (
    <section className="bg-white border-b border-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#0B132B]/[0.04]">
                  <Icon size={18} strokeWidth={1.75} className="text-[#0B132B]/70" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
