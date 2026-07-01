import { Inbox, Mail, MailOpen, Archive, ArchiveRestore, Trash2, Reply } from "lucide-react";
import { adminSupabase } from "@/lib/supabase";
import { markRead, markUnread, archiveMessage, unarchiveMessage, deleteMessage, replyToMessage } from "@/app/admin/support/actions";

type SupportMessage = {
  id: string;
  sender_name: string | null;
  sender_email: string;
  recipient_email: string | null;
  subject: string | null;
  message: string | null;
  message_id: string | null;
  is_read: boolean;
  is_archived: boolean;
  replied_at: string | null;
  created_at: string;
};

async function getMessages(view: "inbox" | "archived"): Promise<SupportMessage[]> {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("support_messages")
    .select("*")
    .eq("is_archived", view === "archived")
    .order("created_at", { ascending: false });
  return data || [];
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SupportPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; open?: string; error?: string; deleted?: string; replied?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "archived" ? "archived" : "inbox";
  const messages = await getMessages(view);
  const openId = params.open ?? null;
  const openMessage = openId ? messages.find(m => m.id === openId) ?? null : null;
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-600">Admin Panel</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Support Inbox</h1>
              <a href="/admin" className="inline-flex items-center gap-2 mt-2 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50">
                ← Back to Admin
              </a>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/support?view=inbox"
                className={`rounded-full px-4 py-2 text-sm font-black ${view === "inbox" ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                Inbox {unreadCount > 0 && view === "inbox" ? `(${unreadCount})` : ""}
              </a>
              <a
                href="/admin/support?view=archived"
                className={`rounded-full px-4 py-2 text-sm font-black ${view === "archived" ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                Archived
              </a>
            </div>
          </div>
        </div>
      </section>

      {params.error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-center text-sm font-bold text-red-700">
          ❌ {params.error}
        </div>
      )}
      {params.deleted && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center text-sm font-bold text-green-700">
          ✅ Message deleted.
        </div>
      )}
      {params.replied && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center text-sm font-bold text-green-700">
          ✅ Reply sent.
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {!adminSupabase && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
            Supabase service role key is not configured, so messages can't be loaded.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Inbox className="text-blue-700" size={20} />
            <h2 className="text-lg font-black text-slate-900">
              {view === "archived" ? "Archived Messages" : "Inbound Messages"}
            </h2>
            <span className="ml-auto text-xs font-bold text-slate-400">{messages.length} total</span>
          </div>

          {messages.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-semibold text-slate-400">
              {view === "archived" ? "No archived messages." : "No support messages yet."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {messages.map((m) => {
                const isOpen = openMessage?.id === m.id;
                return (
                  <div key={m.id}>
                    <a
                      href={`/admin/support?view=${view}${isOpen ? "" : `&open=${m.id}`}`}
                      className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors ${!m.is_read ? "bg-blue-50/40" : ""}`}
                    >
                      <span className="mt-1 shrink-0">
                        {m.is_read ? <MailOpen className="text-slate-300" size={18} /> : <Mail className="text-blue-600" size={18} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`truncate ${!m.is_read ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
                            {m.sender_name ? `${m.sender_name} · ` : ""}{m.sender_email}
                          </p>
                          <span className="shrink-0 text-xs font-semibold text-slate-400">{timeAgo(m.created_at)}</span>
                        </div>
                        <p className={`truncate text-sm ${!m.is_read ? "font-bold text-slate-800" : "font-semibold text-slate-500"}`}>
                          {m.subject || "(No Subject)"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {(m.message || "").replace(/\s+/g, " ").slice(0, 120)}
                        </p>
                        {m.replied_at && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-green-600">
                            <Reply size={12} /> Replied
                          </span>
                        )}
                      </div>
                    </a>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                            <p className="font-black text-slate-900">{m.subject || "(No Subject)"}</p>
                            <p className="text-xs font-semibold text-slate-400">{new Date(m.created_at).toLocaleString("en-GB")}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-500 mb-3">
                            From {m.sender_name ? `${m.sender_name} ` : ""}&lt;{m.sender_email}&gt;
                            {m.recipient_email ? ` · to ${m.recipient_email}` : ""}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-slate-700">{m.message || "(No content)"}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <form action={m.is_read ? markUnread : markRead}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-100">
                              {m.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                              {m.is_read ? "Mark Unread" : "Mark Read"}
                            </button>
                          </form>

                          <form action={view === "archived" ? unarchiveMessage : archiveMessage}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-100">
                              {view === "archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                              {view === "archived" ? "Unarchive" : "Archive"}
                            </button>
                          </form>

                          <form action={deleteMessage}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-50">
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </form>
                        </div>

                        <form action={replyToMessage} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                          <input type="hidden" name="id" value={m.id} />
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Reply</p>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">To</label>
                            <input name="to" defaultValue={m.sender_email} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Subject</label>
                            <input
                              name="subject"
                              defaultValue={m.subject ? (m.subject.toLowerCase().startsWith("re:") ? m.subject : `Re: ${m.subject}`) : "Re: Your message to Mr & Miss FUL 2026 Support"}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Message</label>
                            <textarea name="body" required rows={5} placeholder="Type your reply…" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                          </div>
                          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-900">
                            <Reply size={16} />
                            Send Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
