import { BarChart3, Settings, Trophy, Users, Wallet, Crown } from "lucide-react";
import { getContestants } from "@/lib/contestants";
import { adminSupabase } from "@/lib/supabase";
import { addContestant, editContestant, deleteContestant, saveSettings, changePassword } from "@/app/admin/actions";

async function getSettings() {
  if (!adminSupabase) return {};
  const { data } = await adminSupabase.from("settings").select("*").maybeSingle();
  if (!data) return {};
  return data;
}

async function getRevenue() {
  if (!adminSupabase) return 0;
  const { data } = await adminSupabase.from("payments").select("amount_paid").eq("processed", true);
  if (!data) return 0;
  return data.reduce((sum: number, p: { amount_paid: number }) => sum + p.amount_paid, 0);
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; pwinfo?: string; edit?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [contestants, settings, revenue] = await Promise.all([
    getContestants(),
    getSettings(),
    getRevenue()
  ]);

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
  const ranked = [...contestants].sort((a, b) => b.votes - a.votes);
  const votePrice = Number(settings.vote_price ?? 200);
  const editId = params.edit ?? null;
  const editContestantData = editId ? contestants.find(c => c.id === editId) : null;

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-600">Admin Panel</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Mr & Miss FUL 2026</h1>
              <a href="/admin/awards" className="inline-flex items-center gap-2 mt-2 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black text-white hover:bg-amber-600">
                🏆 Manage Awards
              </a>
            </div>
            <form action="/api/admin/logout" method="POST">
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
                Log out
              </button>
            </form>
          </div>
        </div>
      </section>

      {params.saved && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center text-sm font-bold text-green-700">
          ✅ Settings saved successfully!
        </div>
      )}

      {params.pwinfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700">
          To change your password, update ADMIN_PASSWORD in Vercel → Settings → Environment Variables, then redeploy.
        </div>
      )}

      {params.error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-center text-sm font-bold text-red-700">
          ❌ {params.error}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Votes", value: totalVotes.toLocaleString(), Icon: Trophy },
            { label: "Revenue", value: `₦${revenue.toLocaleString()}`, Icon: Wallet },
            { label: "Contestants", value: contestants.length.toString(), Icon: Users },
            { label: "Vote Price", value: `₦${votePrice}`, Icon: BarChart3 }
          ].map(({ label, value, Icon }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="text-blue-700" size={20} />
              <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-yellow-500" size={20} />
            <h2 className="text-lg font-black text-slate-900">Live Leaderboard</h2>
          </div>
          <div className="space-y-2">
            {ranked.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-400"}`}>#{i + 1}</span>
                  <div>
                    <p className="font-black text-slate-900">{c.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{c.category} · {c.department}</p>
                  </div>
                </div>
                <p className="text-lg font-black text-blue-700">{c.votes.toLocaleString()}</p>
              </div>
            ))}
            {ranked.length === 0 && <p className="text-sm text-slate-400 font-semibold">No contestants yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-5">
            {editContestantData ? `Edit — ${editContestantData.name}` : "Add Contestant"}
          </h2>
          <form action={editContestantData ? editContestant : addContestant} encType="multipart/form-data" className="space-y-4">
            {editContestantData && <input type="hidden" name="id" value={editContestantData.id} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Full Name</label>
                <input name="name" required defaultValue={editContestantData?.name ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="e.g. Amaka Nwosu" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Category</label>
                <select name="category" required defaultValue={editContestantData?.category ?? "Miss FUL"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500">
                  <option value="Mr FUL">Mr FUL</option>
                  <option value="Miss FUL">Miss FUL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Department</label>
                <input name="department" required defaultValue={editContestantData?.department ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="e.g. Mass Communication" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Faculty</label>
                <input name="faculty" required defaultValue={editContestantData?.faculty ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="e.g. Social Sciences" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Short Bio (optional)</label>
              <textarea name="bio" rows={2} defaultValue={editContestantData?.bio ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="A sentence or two about them" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">
                Photo {editContestantData ? "(leave empty to keep current)" : "(required)"}
              </label>
              <input type="file" name="photo" accept="image/*" className="w-full text-sm font-semibold" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-blue-700 px-6 py-3 text-sm font-black text-white hover:bg-blue-900">
                {editContestantData ? "Save Changes" : "Add Contestant"}
              </button>
              {editContestantData && (
                <a href="/admin" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">
                  Cancel
                </a>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-5">All Contestants</h2>
          <div className="space-y-3">
            {ranked.length === 0 && <p className="text-sm text-slate-400 font-semibold">No contestants added yet.</p>}
            {ranked.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-black text-blue-700">#{i + 1} · {c.contestant_number} · {c.category}</p>
                  <p className="font-black text-slate-900">{c.name}</p>
                  <p className="text-sm font-semibold text-slate-500">{c.department}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-lg font-black tabular-nums text-blue-700">{c.votes.toLocaleString()}</p>
                  <a href={`/admin?edit=${c.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-100">
                    Edit
                  </a>
                  <form action={deleteContestant}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="text-slate-500" size={20} />
            <h2 className="text-lg font-black text-slate-900">Site Settings</h2>
          </div>
          <form action={saveSettings} encType="multipart/form-data" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Site Title</label>
                <input name="site_title" defaultValue={settings.site_title ?? "Mr & Miss FUL 2026"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Vote Price (₦)</label>
                <input name="vote_price" type="number" defaultValue={settings.vote_price ?? "200"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Main Voting Status</label>
                <select name="voting_status" defaultValue={settings.voting_status ?? "open"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500">
                  <option value="open">Open — voting is live</option>
                  <option value="closed">Closed — voting is ended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Awards Voting Status</label>
                <select name="awards_voting_status" defaultValue={settings.awards_voting_status ?? "open"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500">
                  <option value="open">Open — awards voting is live</option>
                  <option value="closed">Closed — awards voting is ended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Voting End Date</label>
                <input name="voting_end" type="datetime-local" defaultValue={settings.voting_end_date ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Hero Banner Image</label>
              <input type="file" name="logo" accept="image/*" className="w-full text-sm font-semibold" />
              {settings.primary_logo ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={settings.primary_logo} alt="Current hero banner" className="h-16 w-28 rounded-lg object-cover border border-slate-200" />
                  <p className="text-xs text-green-600 font-bold">✅ Hero banner set. Upload a new file to replace it.</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400 font-semibold">No hero banner uploaded yet.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Secondary Logo (optional)</label>
                <input type="file" name="logo_secondary" accept="image/*" className="w-full text-sm font-semibold" />
                {settings.secondary_logo && (
                  <p className="mt-1 text-xs text-green-600 font-bold">✅ Secondary logo configured.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Hero Description</label>
              <textarea name="hero_description" rows={2} defaultValue={settings.hero_description ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="Text shown under the title on the homepage" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Footer Text</label>
              <input name="footer_text" defaultValue={settings.footer_text ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="e.g. Copyright ©️ 2026 Mr & Miss FUL 2026. All Rights Reserved." />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Awards Page Title</label>
              <input name="awards_title" defaultValue={settings.awards_title ?? "FUL Awards 2026"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Awards Page Description</label>
              <textarea name="awards_description" rows={2} defaultValue={settings.awards_description ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" placeholder="Text shown under the awards page title" />
            </div>
            <button type="submit" className="rounded-full bg-blue-700 px-6 py-3 text-sm font-black text-white hover:bg-blue-900">
              Save Settings
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-5">Change Admin Password</h2>
          <form action={changePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Current Password</label>
              <input type="password" name="current_password" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">New Password</label>
              <input type="password" name="new_password" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400 mb-1">Confirm New Password</label>
              <input type="password" name="confirm_password" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="rounded-full bg-slate-800 px-6 py-3 text-sm font-black text-white hover:bg-slate-900">
              Change Password
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}
