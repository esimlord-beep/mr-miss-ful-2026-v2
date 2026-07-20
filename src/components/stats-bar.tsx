"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Trophy, Vote, Wallet } from "lucide-react";

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let frame: number;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({
  icon: Icon,
  value,
  label,
  active,
  isCurrency,
}: {
  icon: any;
  value: number;
  label: string;
  active: boolean;
  isCurrency?: boolean;
}) {
  const count = useCountUp(value, active);
  const display = isCurrency
    ? `₦${count.toLocaleString()}`
    : count.toLocaleString();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/10">
        <Icon size={19} strokeWidth={1.75} className="text-[#D4AF37]" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
        {display}
      </p>
      <p className="mt-1 text-[11px] font-medium text-white/45 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function StatsBar({
  contestantCount,
  categoryCount,
  votesCast,
  prizePoolAmount,
}: {
  contestantCount: number;
  categoryCount: number;
  votesCast: number;
  prizePoolAmount: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0B132B] border-t border-white/5">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-9 gap-x-4">
          <StatCard icon={Crown} value={contestantCount} label="Contestants" active={active} />
          <StatCard icon={Trophy} value={categoryCount} label="Award Categories" active={active} />
          <StatCard icon={Vote} value={votesCast} label="Votes Cast" active={active} />
          <StatCard icon={Wallet} value={prizePoolAmount} label="Prize Pool" active={active} isCurrency />
        </div>
      </div>
    </section>
  );
}
