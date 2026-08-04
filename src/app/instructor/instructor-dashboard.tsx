"use client";

import { useState, useTransition } from "react";
import { createRehearsalSession, createTask, toggleAttendance, toggleTask, addNote } from "./actions";
import { Plus, MessageSquarePlus } from "lucide-react";

type Contestant = { id: string; contestant_number: string; name: string; department: string };
type Session = { id: string; label: string; session_date: string | null };
type Task = { id: string; label: string; task_date: string | null };
type AttendanceRecord = { contestant_id: string; session_id: string; present: boolean };
type TaskRecord = { contestant_id: string; task_id: string; completed: boolean };
type Note = { id: string; contestant_id: string; note: string; created_at: string };

export function InstructorDashboard({
  contestants,
  sessions,
  tasks,
  attendance,
  taskRecords,
  notes
}: {
  contestants: Contestant[];
  sessions: Session[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  taskRecords: TaskRecord[];
  notes: Note[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "notes">("attendance");
  const [noteContestantId, setNoteContestantId] = useState<string | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id ?? "");

  const isPresent = (contestantId: string, sessionId: string) =>
    attendance.find(a => a.contestant_id === contestantId && a.session_id === sessionId)?.present ?? false;

  const isCompleted = (contestantId: string, taskId: string) =>
    taskRecords.find(t => t.contestant_id === contestantId && t.task_id === taskId)?.completed ?? false;

  const notesFor = (contestantId: string) => notes.filter(n => n.contestant_id === contestantId);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#0B132B] pb-20">
      <div className="bg-[#0B132B] px-4 py-5 sticky top-0 z-10">
        <h1 className="font-rounded text-xl font-black text-white">Instructor Dashboard</h1>
        <p className="text-white/50 text-xs mt-0.5 font-medium">Mr & Miss FUL Night 2026</p>

        <div className="flex gap-2 mt-4">
          {(["attendance", "tasks", "notes"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition ${
                activeTab === tab ? "bg-[#D4AF37] text-[#0B132B]" : "bg-white/10 text-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {activeTab === "attendance" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-rounded font-bold text-[#0B132B]">Rehearsal Sessions</h2>
              <button
                onClick={() => setShowAddSession(v => !v)}
                className="flex items-center gap-1 text-xs font-bold text-[#B8901F]"
              >
                <Plus size={14} /> New Session
              </button>
            </div>

            {showAddSession && (
              <form
                action={formData => {
                  startTransition(async () => {
                    await createRehearsalSession(formData);
                    setShowAddSession(false);
                  });
                }}
                className="bg-white rounded-2xl p-4 mb-4 space-y-2 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
              >
                <input
                  name="label"
                  required
                  placeholder="e.g. Rehearsal 3"
                  className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
                />
                <input
                  name="session_date"
                  type="date"
                  className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button type="submit" disabled={isPending} className="w-full rounded-full bg-[#D4AF37] py-2.5 text-sm font-black text-[#0B132B] transition disabled:opacity-60">
                  Add Session
                </button>
              </form>
            )}

            {sessions.length === 0 ? (
              <p className="text-sm text-[#0B132B]/50 font-medium">No rehearsal sessions created yet.</p>
            ) : (
              <>
                <select
                  value={selectedSessionId}
                  onChange={e => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-3 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37] mb-4"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.label}{s.session_date ? ` — ${s.session_date}` : ""}</option>
                  ))}
                </select>

                <div className="space-y-2">
                  {contestants.map(c => {
                    const present = isPresent(c.id, selectedSessionId);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between bg-white rounded-2xl p-3 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
                      >
                        <p className="font-semibold text-[#0B132B] text-sm">#{c.contestant_number} {c.name}</p>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => startTransition(() => toggleAttendance(c.id, selectedSessionId, true))}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              present ? "bg-[#D4AF37] text-[#0B132B]" : "bg-[#0B132B]/[0.05] text-[#0B132B]/40"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => startTransition(() => toggleAttendance(c.id, selectedSessionId, false))}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              !present ? "bg-[#0B132B] text-white" : "bg-[#0B132B]/[0.05] text-[#0B132B]/40"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-rounded font-bold text-[#0B132B]">Tasks</h2>
              <button
                onClick={() => setShowAddTask(v => !v)}
                className="flex items-center gap-1 text-xs font-bold text-[#B8901F]"
              >
                <Plus size={14} /> New Task
              </button>
            </div>

            {showAddTask && (
              <form
                action={formData => {
                  startTransition(async () => {
                    await createTask(formData);
                    setShowAddTask(false);
                  });
                }}
                className="bg-white rounded-2xl p-4 mb-4 space-y-2 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
              >
                <input
                  name="label"
                  required
                  placeholder="e.g. Social media post"
                  className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
                />
                <input
                  name="task_date"
                  type="date"
                  className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button type="submit" disabled={isPending} className="w-full rounded-full bg-[#D4AF37] py-2.5 text-sm font-black text-[#0B132B] transition disabled:opacity-60">
                  Add Task
                </button>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-sm text-[#0B132B]/50 font-medium">No tasks created yet.</p>
            ) : (
              <>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-3 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37] mb-4"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.label}{t.task_date ? ` — ${t.task_date}` : ""}</option>
                  ))}
                </select>

                <div className="space-y-2">
                  {contestants.map(c => {
                    const completed = isCompleted(c.id, selectedTaskId);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between bg-white rounded-2xl p-3 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
                      >
                        <p className="font-semibold text-[#0B132B] text-sm">#{c.contestant_number} {c.name}</p>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => startTransition(() => toggleTask(c.id, selectedTaskId, true))}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              completed ? "bg-[#D4AF37] text-[#0B132B]" : "bg-[#0B132B]/[0.05] text-[#0B132B]/40"
                            }`}
                          >
                            Done
                          </button>
                          <button
                            onClick={() => startTransition(() => toggleTask(c.id, selectedTaskId, false))}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              !completed ? "bg-[#0B132B] text-white" : "bg-[#0B132B]/[0.05] text-[#0B132B]/40"
                            }`}
                          >
                            Not Done
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <h2 className="font-rounded font-bold text-[#0B132B] mb-2">Contestant Notes</h2>
            {contestants.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]">
                <div className="flex items-center justify-between">
                  <p className="font-rounded font-bold text-[#0B132B] text-sm">#{c.contestant_number} {c.name}</p>
                  <button
                    onClick={() => setNoteContestantId(noteContestantId === c.id ? null : c.id)}
                    className="flex items-center gap-1 text-xs font-bold text-[#B8901F]"
                  >
                    <MessageSquarePlus size={14} /> Add Note
                  </button>
                </div>

                {noteContestantId === c.id && (
                  <form
                    action={formData => {
                      startTransition(async () => {
                        await addNote(formData);
                        setNoteContestantId(null);
                      });
                    }}
                    className="mt-3 space-y-2"
                  >
                    <input type="hidden" name="contestant_id" value={c.id} />
                    <textarea
                      name="note"
                      required
                      rows={2}
                      placeholder="Write a note..."
                      className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2 text-sm text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
                    />
                    <button type="submit" disabled={isPending} className="rounded-full bg-[#D4AF37] px-4 py-1.5 text-xs font-black text-[#0B132B]">
                      Save Note
                    </button>
                  </form>
                )}

                {notesFor(c.id).length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {notesFor(c.id).map(n => (
                      <li key={n.id} className="text-xs text-[#0B132B]/55 border-l-2 border-[#D4AF37]/40 pl-2 font-medium">
                        {n.note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
