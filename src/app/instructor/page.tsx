import { adminSupabase } from "@/lib/supabase";
import { InstructorDashboard } from "./instructor-dashboard";

export const dynamic = "force-dynamic";

export default async function InstructorPage() {
  if (!adminSupabase) {
    return <div className="p-8 text-center text-red-600">Supabase is not configured.</div>;
  }

  const [{ data: contestants }, { data: sessions }, { data: tasks }, { data: attendance }, { data: taskRecords }, { data: notes }] =
    await Promise.all([
      adminSupabase.from("contestants").select("id, contestant_number, name, department").order("contestant_number"),
      adminSupabase.from("rehearsal_sessions").select("id, label, session_date").order("created_at"),
      adminSupabase.from("instructor_tasks").select("id, label, task_date").order("created_at"),
      adminSupabase.from("attendance_records").select("contestant_id, session_id, present"),
      adminSupabase.from("task_records").select("contestant_id, task_id, completed"),
      adminSupabase.from("instructor_notes").select("id, contestant_id, note, created_at").order("created_at", { ascending: false })
    ]);

  return (
    <InstructorDashboard
      contestants={contestants ?? []}
      sessions={sessions ?? []}
      tasks={tasks ?? []}
      attendance={attendance ?? []}
      taskRecords={taskRecords ?? []}
      notes={notes ?? []}
    />
  );
}
