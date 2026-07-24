import { adminSupabase } from "@/lib/supabase";
import { addTicketTier, editTicketTier, deleteTicketTier } from "./actions";
import { Ticket, Plus, Pencil, Trash2, Users2, CheckCircle2 } from "lucide-react";

async function getTiers() {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("ticket_tiers")
    .select("*")
    .order("display_order", { ascending: true });
  return data || [];
}

async function getTicketStats() {
  if (!adminSupabase) return { totalSold: 0, totalRevenue: 0, totalCheckedIn: 0 };
  const { data } = await adminSupabase.from("tickets").select("amount_paid, verified, checked_in");
  if (!data) return { totalSold: 0, totalRevenue: 0, totalCheckedIn: 0 };

  const verified = data.filter((t) => t.verified);
  return {
    totalSold: verified.length,
    totalRevenue: verified.reduce((sum, t) => sum + Number(t.amount_paid), 0),
    totalCheckedIn: data.filter((t) => t.checked_in).length
  };
}

export default async function TicketsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const [tiers, stats] = await Promise.all([getTiers(), getTicketStats()]);
  const editId = params.edit ?? null;
  const editingTier = editId ? tiers.find((t) => t.id === editId) : null;

  return (
    <main className="min-h-screen bg-[#F5F3EE]">
      <section className="border-b border-[#0B132B]/[0.08] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-rounded text-xs font-bold uppercase tracking-[0.22em] text-[#B8901F]">
                Admin Panel
              </p>
              <h1 className="mt-1 font-rounded text-2xl font-extrabold text-[#0B132B]">
                Award Night Tickets
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-[#0B132B]/15 px-4 py-1.5 text-xs font-bold text-[#0B132B] hover:bg-[#0B132B]/[0.03]"
              >
                ← Main Admin
              </a>
              <a
                href="/checkin"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B132B] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0B132B]/90"
              >
                <CheckCircle2 size={13} strokeWidth={2.25} />
                Gate Check-in
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-4 shadow-sm shadow-[#0B132B]/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B132B]/40">Tickets Sold</p>
            <p className="text-2xl font-black text-[#0B132B] mt-1">{stats.totalSold}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-4 shadow-sm shadow-[#0B132B]/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B132B]/40">Revenue</p>
            <p className="text-2xl font-black text-[#0B132B] mt-1">₦{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#0B132B]/[0.08] p-4 shadow-sm shadow-[#0B132B]/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B132B]/40">Checked In</p>
            <p className="text-2xl font-black text-[#0B132B] mt-1">{stats.totalCheckedIn}</p>
          </div>
        </div>

        {params.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}
        {params.saved && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700">
            Saved successfully.
          </div>
        )}

        {/* Add / Edit form */}
        <section className="bg-white rounded-2xl border border-[#0B132B]/[0.08] shadow-sm shadow-[#0B132B]/[0.04] overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: "#0B132B" }}>
            <h2 className="font-rounded font-bold text-white flex items-center gap-2">
              <Ticket size={16} style={{ color: "#D4AF37" }} />
              {editingTier ? `Edit "${editingTier.name}"` : "Add a Ticket Tier"}
            </h2>
          </div>

          <form
            action={editingTier ? editTicketTier : addTicketTier}
            className="p-6 grid gap-4 sm:grid-cols-2"
          >
            {editingTier && <input type="hidden" name="id" value={editingTier.id} />}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                Tier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={editingTier?.name ?? ""}
                placeholder="e.g. Regular, VIP, Table for 5, Table for 10"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">Description (optional)</label>
              <input
                type="text"
                name="description"
                defaultValue={editingTier?.description ?? ""}
                placeholder="What's included with this ticket"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                min="1"
                defaultValue={editingTier?.price ?? ""}
                placeholder="5000"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                Seats per Purchase <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="seats_covered"
                required
                min="1"
                defaultValue={editingTier?.seats_covered ?? 1}
                placeholder="1 for Regular/VIP, 5 or 10 for tables"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
              <p className="mt-1 text-[11px] text-[#0B132B]/40">Use 5 or 10 for table tiers.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                Quantity Available <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity_available"
                required
                min="1"
                defaultValue={editingTier?.quantity_available ?? ""}
                placeholder="e.g. 200"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
              <p className="mt-1 text-[11px] text-[#0B132B]/40">Max number of this tier that can be sold.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">Display Order</label>
              <input
                type="number"
                name="display_order"
                defaultValue={editingTier?.display_order ?? 0}
                placeholder="0"
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              />
              <p className="mt-1 text-[11px] text-[#0B132B]/40">Lower numbers show first.</p>
            </div>

            {editingTier && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingTier.is_active}
                  className="h-4 w-4 rounded border-[#0B132B]/30 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-[#0B132B]/70">
                  Active (visible on the public tickets page)
                </label>
              </div>
            )}

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-bold text-[#0B132B] shadow-md shadow-[#D4AF37]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <Plus size={15} strokeWidth={2.5} />
                {editingTier ? "Save Changes" : "Create Tier"}
              </button>
              {editingTier && (
                <a
                  href="/admin/tickets"
                  className="inline-flex items-center gap-2 rounded-full border border-[#0B132B]/15 px-6 py-2.5 text-sm font-bold text-[#0B132B] hover:bg-[#0B132B]/[0.03]"
                >
                  Cancel
                </a>
              )}
            </div>
          </form>
        </section>

        {/* Existing tiers list */}
        <section className="bg-white rounded-2xl border border-[#0B132B]/[0.08] shadow-sm shadow-[#0B132B]/[0.04] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#0B132B]/[0.08]">
            <h2 className="font-rounded font-bold text-[#0B132B]">Ticket Tiers</h2>
          </div>

          {tiers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#0B132B]/50 font-medium text-sm">No ticket tiers yet. Create one above.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#0B132B]/[0.06]">
              {tiers.map((tier) => {
                const remaining = tier.quantity_available - tier.quantity_sold;
                const soldOut = remaining <= 0;
                return (
                  <div key={tier.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#0B132B]">{tier.name}</p>
                        {!tier.is_active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B132B]/10 text-[#0B132B]/50">
                            Inactive
                          </span>
                        )}
                        {soldOut && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            Sold Out
                          </span>
                        )}
                      </div>
                      {tier.description && (
                        <p className="text-xs text-[#0B132B]/50 mt-0.5">{tier.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#0B132B]/60 font-semibold flex-wrap">
                        <span>₦{Number(tier.price).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <Users2 size={12} strokeWidth={2} />
                          {tier.seats_covered} seat{tier.seats_covered > 1 ? "s" : ""}
                        </span>
                        <span>
                          {tier.quantity_sold}/{tier.quantity_available} sold
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`/admin/tickets?edit=${tier.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#0B132B]/15 px-4 py-2 text-xs font-bold text-[#0B132B] hover:bg-[#0B132B]/[0.03]"
                      >
                        <Pencil size={13} strokeWidth={2} />
                        Edit
                      </a>
                      <form action={deleteTicketTier}>
                        <input type="hidden" name="id" value={tier.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} strokeWidth={2} />
                          Delete
                        </button>
                      </form>
                    </div>
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
