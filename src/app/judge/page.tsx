import { adminSupabase } from "@/lib/supabase";
import { JudgeDashboard } from "./judge-dashboard";

export const dynamic = "force-dynamic";

export default async function JudgePage() {
  if (!adminSupabase) {
    return <div className="p-8 text-center text-red-600">Supabase is not configured.</div>;
  }

  const { data: contestants } = await adminSupabase
    .from("contestants")
    .select("id, contestant_number, name, department")
    .order("contestant_number");

  return <JudgeDashboard contestants={contestants ?? []} />;
}
