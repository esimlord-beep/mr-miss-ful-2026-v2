"use server";

import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createRehearsalSession(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const label = String(formData.get("label") ?? "").trim();
  const sessionDate = String(formData.get("session_date") ?? "").trim();

  if (!label) throw new Error("Session label is required.");

  const { error } = await adminSupabase.from("rehearsal_sessions").insert({
    label,
    session_date: sessionDate || null
  });

  if (error) throw new Error(`Could not create session: ${error.message}`);

  revalidatePath("/instructor");
}

export async function createTask(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const label = String(formData.get("label") ?? "").trim();
  const taskDate = String(formData.get("task_date") ?? "").trim();

  if (!label) throw new Error("Task label is required.");

  const { error } = await adminSupabase.from("instructor_tasks").insert({
    label,
    task_date: taskDate || null
  });

  if (error) throw new Error(`Could not create task: ${error.message}`);

  revalidatePath("/instructor");
}

export async function toggleAttendance(contestantId: string, sessionId: string, present: boolean) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const { error } = await adminSupabase
    .from("attendance_records")
    .upsert(
      { contestant_id: contestantId, session_id: sessionId, present, marked_at: new Date().toISOString() },
      { onConflict: "contestant_id,session_id" }
    );

  if (error) throw new Error(`Could not update attendance: ${error.message}`);

  revalidatePath("/instructor");
}

export async function toggleTask(contestantId: string, taskId: string, completed: boolean) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const { error } = await adminSupabase
    .from("task_records")
    .upsert(
      { contestant_id: contestantId, task_id: taskId, completed, marked_at: new Date().toISOString() },
      { onConflict: "contestant_id,task_id" }
    );

  if (error) throw new Error(`Could not update task: ${error.message}`);

  revalidatePath("/instructor");
}

export async function addNote(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const contestantId = String(formData.get("contestant_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!contestantId || !note) throw new Error("Contestant and note text are required.");

  const { error } = await adminSupabase.from("instructor_notes").insert({
    contestant_id: contestantId,
    note
  });

  if (error) throw new Error(`Could not save note: ${error.message}`);

  revalidatePath("/instructor");
}

export async function setRemarksScore(contestantId: string, score: number) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  if (score < 0 || score > 5) throw new Error("Remarks score must be between 0 and 5.");

  const { error } = await adminSupabase
    .from("instructor_remarks_scores")
    .upsert(
      { contestant_id: contestantId, score, updated_at: new Date().toISOString() },
      { onConflict: "contestant_id" }
    );

  if (error) throw new Error(`Could not save remarks score: ${error.message}`);

  revalidatePath("/instructor");
}
