import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";
import { sendAllJudgesDoneEmail } from "@/lib/email";

// Must match ALL_CRITERIA.length in judge-dashboard.tsx: 4 rounds × 4 sub-criteria each.
const CRITERIA_PER_CONTESTANT = 16;

const ADMIN_NOTIFICATION_EMAIL = "esimlord09@gmail.com";
const NOTIFICATION_KEY = "all_judges_done";

export async function POST() {
  if (!adminSupabase) {
    return NextResponse.json({ notified: false }, { status: 500 });
  }

  const [{ data: judges }, { data: contestants }, { data: scores }] = await Promise.all([
    adminSupabase.from("judges").select("id"),
    adminSupabase.from("contestants").select("id"),
    adminSupabase.from("judge_scores").select("judge_id")
  ]);

  const judgeList = judges ?? [];
  const contestantCount = (contestants ?? []).length;

  if (judgeList.length === 0 || contestantCount === 0) {
    return NextResponse.json({ notified: false, allDone: false });
  }

  const countByJudge = new Map<string, number>();
  (scores ?? []).forEach(s => {
    countByJudge.set(s.judge_id, (countByJudge.get(s.judge_id) ?? 0) + 1);
  });

  const requiredPerJudge = contestantCount * CRITERIA_PER_CONTESTANT;
  const allDone = judgeList.every(j => (countByJudge.get(j.id) ?? 0) >= requiredPerJudge);

  if (!allDone) {
    return NextResponse.json({ notified: false, allDone: false });
  }

  // Already notified for this completion? Don't send twice.
  const { data: existing } = await adminSupabase
    .from("admin_notifications")
    .select("key")
    .eq("key", NOTIFICATION_KEY)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ notified: false, allDone: true, alreadySent: true });
  }

  const { error: insertError } = await adminSupabase
    .from("admin_notifications")
    .insert({ key: NOTIFICATION_KEY });

  // If another request beat us to the insert (race), the unique constraint
  // will fail — just skip sending in that case rather than double-emailing.
  if (insertError) {
    return NextResponse.json({ notified: false, allDone: true, raced: true });
  }

  await sendAllJudgesDoneEmail({ to: ADMIN_NOTIFICATION_EMAIL });

  return NextResponse.json({ notified: true, allDone: true });
}
