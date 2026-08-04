"use client";

import { useState, useTransition } from "react";
import { createRehearsalSession, createTask, toggleAttendance, toggleTask, addNote } from "./actions";
import { Check, X, Plus, MessageSquarePlus } from "lucide-react";

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

  const isPresent = (contestantId: string, sessionId: string) =>
    attendance.find(a => a.contestant_id === contestantId && a.session_id === sessionId)?.present ?? false;

  const isCompleted = (contestantId: string, taskId: string) =>
    taskRecords.find(t => t.contestant_id === contestantId && t.task_id === taskId)?.completed ?? false;

  const notesFor = (contestantId: string) => notes.filter(n => n.contestant_id === contestantId);

  return (
    <div className="min-h-screen bg-[#F5F3EE] pb-20">
      <div className="bg-[#0B132B] px-4 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-black text-white">Instructor Dashboard</h1>
        <p className="text-white/50 text-xs mt-0.5">Mr & Miss FUL Night 2026</p>

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
              <h2 className="font-bold text-[#0B132B]">Rehearsal Sessions</h2>
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
                className="bg-white rounded-xl p-4 mb-4 space-y-2 border border-[#0B132B]/10"
              >
                <input
                  name="label"
                  required
                  placeholder="e.g. Rehearsal 3"
                  className="w-full rounded-lg border border-[#0B132B]/15 px-3 py-2 text-sm"
                />
                <input
                  name="session_date"
                  type="date"
                  className="w-full rounded-lg border border-[#0B132B]/15 px-3 py-2 text-sm"
                />
                <button type="submit" disabled={isPending} className="w-full rounded-lg bg-[#D4AF37] py-2 text-sm font-bold text-[#0B132B]">
                  Add Session
                </button>
              </form>
            )}

            {sessions.length === 0 ? (
              <p className="text-sm text-[#0B132B]/50">No rehearsal sessions created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl overflow-hidden border border-[#0B132B]/10">
                  <thead>
                    <tr className="bg-[#0B132B]/[0.03]">
                      <th className="text-left px-3 py-2 font-bold text-[#0B132B] sticky left-0 bg-[#F8F7F4]">Contestant</th>
                      {sessions.map(s => (
                        <th key={s.id} className="px-3 py-2 font-bold text-[#0B132B] whitespace-nowrap text-xs">{s.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contestants.map(c => (
                      <tr key={c.id} className="border-t border-[#0B132B]/[0.06]">
                        <td className="px-3 py-2 font-semibold text-[#0B132B] sticky left-0 bg-white whitespace-nowrap">
                          #{c.contestant_number} {c.name}
                        </td>
                        {sessions.map(s => {
                          const present = isPresent(c.id, s.id);
                          return (
                            <td key={s.id} className="px-3 py-2 text-center">
                              <button
                                onClick={() =>
                                  startTransition(() => toggleAttendance(c.id, s.id, !present))
                                }
                                disabled={isPending}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition ${
                                  present ? "bg-emerald-500 text-white" : "bg-[#0B132B]/10 text-[#0B132B]/30"
                                }`}
                              >
                                {present ? <Check size={16} /> : <X size={14} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#0B132B]">Tasks</h2>
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
                className="bg-white rounded-xl p-4 mb-4 space-y-2 border border-[#0B132B]/10"
              >
                <input
                  name="label"
                  required
                  placeholder="e.g. Social media post"
                  className="w-full rounded-lg border border-[#0B132B]/15 px-3 py-2 text-sm"
                />
                <input
                  name="task_date"
                  type="date"
                  className="w-full rounded-lg border border-[#0B132B]/15 px-3 py-2 text-sm"
                />
                <button type="submit" disabled={isPending} className="w-full rounded-lg bg-[#D4AF37] py-2 text-sm font-bold text-[#0B132B]">
                  Add Task
                </button>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-sm text-[#0B132B]/50">No tasks created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl overflow-hidden border border-[#0B132B]/10">
                  <thead>
                    <tr className="bg-[#0B132B]/[0.03]">
                      <th className="text-left px-3 py-2 font-bold text-[#0B132B] sticky left-0 bg-[#F8F7F4]">Contestant</th>
                      {tasks.map(t => (
                        <th key={t.id} className="px-3 py-2 font-bold text-[#0B132B] whitespace-nowrap text-xs">{t.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contestants.map(c => (
                      <tr key={c.id} className="border-t border-[#0B132B]/[0.06]">
                        <td className="px-3 py-2 font-semibold text-[#0B132B] sticky left-0 bg-white whitespace-nowrap">
                          #{c.contestant_number} {c.name}
                        </td>
                        {tasks.map(t => {
                          const completed = isCompleted(c.id, t.id);
                          return (
                            <td key={t.id} className="px-3 py-2 text-center">
                              <button
                                onClick={() =>
                                  startTransition(() => toggleTask(c.id, t.id, !completed))
                                }
                                disabled={isPending}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition ${
                                  completed ? "bg-emerald-500 text-white" : "bg-[#0B132B]/10 text-[#0B132B]/30"
                                }`}
                              >
                                {completed ? <Check size={16} /> : <X size={14} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <h2 className="font-bold text-[#0B132B] mb-2">Contestant Notes</h2>
            {contestants.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-4 border border-[#0B132B]/10">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#0B132B] text-sm">#{c.contestant_number} {c.name}</p>
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
                      className="w-full rounded-lg border border-[#0B132B]/15 px-3 py-2 text-sm"
                    />
                    <button type="submit" disabled={isPending} className="rounded-lg bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-[#0B132B]">
                      Save Note
                    </button>
                  </form>
                )}

                {notesFor(c.id).length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {notesFor(c.id).map(n => (
                      <li key={n.id} className="text-xs text-[#0B132B]/60 border-l-2 border-[#D4AF37]/40 pl-2">
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
