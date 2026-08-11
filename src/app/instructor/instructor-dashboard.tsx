"use client";

import { useState, useTransition } from "react";
import { createRehearsalSession, createTask, toggleAttendance, toggleTask, addNote, setRemarksScore } from "./actions";
import { Plus, MessageSquarePlus, Check, X } from "lucide-react";

type Contestant = { id: string; contestant_number: string; name: string; department: string };
type Session = { id: string; label: string; session_date: string | null };
type Task = { id: string; label: string; task_date: string | null };
type AttendanceRecord = { contestant_id: string; session_id: string; present: boolean };
type TaskRecord = { contestant_id: string; task_id: string; completed: boolean };
type Note = { id: string; contestant_id: string; note: string; created_at: string };
type RemarksScore = { contestant_id: string; score: number };

export function InstructorDashboard({
  contestants,
  sessions,
  tasks,
  attendance,
  taskRecords,
  notes,
  remarksScores
}: {
  contestants: Contestant[];
  sessions: Session[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  taskRecords: TaskRecord[];
  notes: Note[];
  remarksScores: RemarksScore[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "remarks" | "notes">("attendance");
  const [noteContestantId, setNoteContestantId] = useState<string | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id ?? "");
  const [remarksDraft, setRemarksDraft] = useState<Record<string, number>>(
    Object.fromEntries(remarksScores.map(r => [r.contestant_id, r.score]))
  );
  const [savedContestantId, setSavedContestantId] = useState<string | null>(null);

  const remarksFor = (contestantId: string) => remarksDraft[contestantId] ?? 0;

  const isPresent = (contestantId: string, sessionId: string) =>
    attendance.find(a => a.contestant_id === contestantId && a.session_id === sessionId)?.present ?? false;

  const isCompleted = (contestantId: string, taskId: string) =>
    taskRecords.find(t => t.contestant_id === contestantId && t.task_id === taskId)?.completed ?? false;

  const notesFor = (contestantId: string) => notes.filter(n => n.contestant_id === contestantId);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#0B132B] pb-20">
      <div className="bg-[#0B132B] px-4 pt-4 pb-3 sticky top-0 z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Instructor</p>
        <h1 className="font-rounded text-lg font-black text-white leading-tight">Dashboard</h1>
        <p className="text-white/45 text-[11px] font-medium mt-0.5">Mr & Miss FUL Night 2026</p>

        <div className="flex items-center bg-white/10 rounded-full p-0.5 mt-3">
          {(["attendance", "tasks", "remarks", "notes"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-bold capitalize transition ${
                activeTab === tab ? "bg-[#D4AF37] text-[#0B132B]" : "text-white/55"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6">
        {activeTab === "attendance" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-rounded text-sm font-black text-[#0B132B]">Rehearsal Sessions</h2>
                <p className="text-[11px] text-[#0B132B]/45 font-medium">Track attendance for each rehearsal</p>
              </div>
              <button
                onClick={() => setShowAddSession(v => !v)}
                className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-[#0B132B] bg-[#D4AF37] px-3 py-1.5 rounded-full"
              >
                <Plus size={12} /> New
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
                className="bg-white rounded-2xl p-4 mb-3 space-y-2 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
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
                  className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-2.5 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37] mb-2.5"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.label}{s.session_date ? ` — ${s.session_date}` : ""}</option>
                  ))}
                </select>

                {(() => {
                  const presentCount = contestants.filter(c => isPresent(c.id, selectedSessionId)).length;
                  const totalCount = contestants.length;
                  return (
                    <div className="flex items-center justify-center gap-4 bg-white rounded-xl px-4 py-2 mb-3 border border-[#0B132B]/[0.06]">
                      <p className="text-xs font-bold text-[#0B132B]">
                        <span className="text-[#D4AF37]">{presentCount}</span> Present
                      </p>
                      <span className="text-[#0B132B]/15">·</span>
                      <p className="text-xs font-bold text-[#0B132B]">
                        <span className="text-[#0B132B]/60">{totalCount - presentCount}</span> Absent
                      </p>
                      <span className="text-[#0B132B]/15">·</span>
                      <p className="text-xs font-bold text-[#0B132B]/45">{totalCount} Total</p>
                    </div>
                  );
                })()}

                <div className="space-y-1.5">
                  {contestants.map(c => {
                    const present = isPresent(c.id, selectedSessionId);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border border-[#0B132B]/[0.06]"
                      >
                        <p className="font-semibold text-[#0B132B] text-xs leading-snug min-w-0 break-words">
                          <span className="text-[#0B132B]/40 font-bold">{c.contestant_number}</span> {c.name}
                        </p>

                        <div
                          role="group"
                          aria-label={`Attendance for ${c.name}`}
                          className="flex shrink-0 rounded-full border border-[#0B132B]/10 bg-[#0B132B]/[0.03] p-0.5"
                        >
                          <button
                            type="button"
                            aria-pressed={present}
                            onClick={() => startTransition(() => toggleAttendance(c.id, selectedSessionId, true))}
                            disabled={isPending}
                            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4AF37] ${
                              present
                                ? "bg-[#D4AF37] text-[#0B132B] shadow-sm"
                                : "text-[#0B132B]/40 hover:text-[#0B132B]/60"
                            }`}
                          >
                            {present && <Check size={12} strokeWidth={3} />}
                            Present
                          </button>
                          <button
                            type="button"
                            aria-pressed={!present}
                            onClick={() => startTransition(() => toggleAttendance(c.id, selectedSessionId, false))}
                            disabled={isPending}
                            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0B132B] ${
                              !present
                                ? "bg-[#0B132B] text-white shadow-sm"
                                : "text-[#0B132B]/40 hover:text-[#0B132B]/60"
                            }`}
                          >
                            {!present && <X size={12} strokeWidth={3} />}
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
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-rounded text-sm font-black text-[#0B132B]">Tasks</h2>
                <p className="text-[11px] text-[#0B132B]/45 font-medium">Track task completion per contestant</p>
              </div>
              <button
                onClick={() => setShowAddTask(v => !v)}
                className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-[#0B132B] bg-[#D4AF37] px-3 py-1.5 rounded-full"
              >
                <Plus size={12} /> New
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
                className="bg-white rounded-2xl p-4 mb-3 space-y-2 border border-[#0B132B]/[0.06] shadow-sm shadow-[#0B132B]/[0.04]"
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
                  className="w-full rounded-xl border border-[#0B132B]/15 bg-white px-3 py-2.5 text-sm font-bold text-[#0B132B] outline-none focus:border-[#D4AF37] mb-2.5"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.label}{t.task_date ? ` — ${t.task_date}` : ""}</option>
                  ))}
                </select>

                {(() => {
                  const doneCount = contestants.filter(c => isCompleted(c.id, selectedTaskId)).length;
                  const totalCount = contestants.length;
                  return (
                    <div className="flex items-center justify-center gap-4 bg-white rounded-xl px-4 py-2 mb-3 border border-[#0B132B]/[0.06]">
                      <p className="text-xs font-bold text-[#0B132B]">
                        <span className="text-[#D4AF37]">{doneCount}</span> Done
                      </p>
                      <span className="text-[#0B132B]/15">·</span>
                      <p className="text-xs font-bold text-[#0B132B]">
                        <span className="text-[#0B132B]/60">{totalCount - doneCount}</span> Not Done
                      </p>
                      <span className="text-[#0B132B]/15">·</span>
                      <p className="text-xs font-bold text-[#0B132B]/45">{totalCount} Total</p>
                    </div>
                  );
                })()}

                <div className="space-y-1.5">
                  {contestants.map(c => {
                    const completed = isCompleted(c.id, selectedTaskId);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-[#0B132B]/[0.06]"
                      >
                        <p className="font-semibold text-[#0B132B] text-xs leading-snug min-w-0">
                          <span className="text-[#0B132B]/40 font-bold">{c.contestant_number}</span> {c.name}
                        </p>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startTransition(() => toggleTask(c.id, selectedTaskId, true))}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              completed ? "bg-[#D4AF37] text-[#0B132B]" : "bg-[#0B132B]/[0.04] text-[#0B132B]/35"
                            }`}
                          >
                            Done
                          </button>
                          <button
                            onClick={() => startTransition(() => toggleTask(c.id, selectedTaskId, false))}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              !completed ? "bg-[#0B132B] text-white" : "bg-[#0B132B]/[0.04] text-[#0B132B]/35"
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

        {activeTab === "remarks" && (
          <div>
            <div className="mb-3">
              <h2 className="font-rounded text-sm font-black text-[#0B132B]">Instructor Remarks Score</h2>
              <p className="text-[11px] text-[#0B132B]/45 font-medium">Rate each contestant out of 5</p>
            </div>

            <div className="space-y-1.5">
              {contestants.map(c => {
                const value = remarksFor(c.id);
                const saved = remarksScores.find(r => r.contestant_id === c.id)?.score ?? 0;
                const isDirty = value !== saved;
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl px-3 py-2.5 border border-[#0B132B]/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <p className="font-semibold text-[#0B132B] text-xs leading-snug min-w-0 break-words">
                        <span className="text-[#0B132B]/40 font-bold">{c.contestant_number}</span> {c.name}
                      </p>
                      <p className="shrink-0 text-sm font-black text-[#B8901F]">
                        {value.toFixed(1)}<span className="text-[#0B132B]/30 font-bold text-xs"> / 5</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={value}
                        onChange={e =>
                          setRemarksDraft(prev => ({ ...prev, [c.id]: Number(e.target.value) }))
                        }
                        className="judge-slider flex-1"
                        style={{ "--slider-fill": `${(value / 5) * 100}%` } as React.CSSProperties}
                      />
                      <button
                        type="button"
                        disabled={!isDirty || isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await setRemarksScore(c.id, value);
                            setSavedContestantId(c.id);
                            setTimeout(() => setSavedContestantId(id => (id === c.id ? null : id)), 1500);
                          });
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                          isDirty
                            ? "bg-[#D4AF37] text-[#0B132B]"
                            : "bg-[#0B132B]/[0.04] text-[#0B132B]/30"
                        }`}
                      >
                        {savedContestantId === c.id ? <Check size={12} /> : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-1.5">
            <div className="mb-2">
              <h2 className="font-rounded text-sm font-black text-[#0B132B]">Contestant Notes</h2>
              <p className="text-[11px] text-[#0B132B]/45 font-medium">Free-text observations per contestant</p>
            </div>
            {contestants.map(c => (
              <div key={c.id} className="bg-white rounded-xl px-3 py-2.5 border border-[#0B132B]/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#0B132B] text-xs min-w-0">
                    <span className="text-[#0B132B]/40 font-bold">{c.contestant_number}</span> {c.name}
                  </p>
                  <button
                    onClick={() => setNoteContestantId(noteContestantId === c.id ? null : c.id)}
                    className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-[#B8901F]"
                  >
                    <MessageSquarePlus size={12} /> Note
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
                    className="mt-2 space-y-2"
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
                  <ul className="mt-2 space-y-1">
                    {notesFor(c.id).map(n => (
                      <li key={n.id} className="text-[11px] text-[#0B132B]/55 border-l-2 border-[#D4AF37]/40 pl-2 font-medium">
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
