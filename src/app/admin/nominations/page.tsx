import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getPendingNominations() {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("nomination_submissions")
    .select("*, award_categories(name, group_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return data || [];
}

async function getReviewedNominations() {
  if (!adminSupabase) return [];
  const { data } = await adminSupabase
    .from("nomination_submissions")
    .select("*, award_categories(name, group_name)")
    .neq("status", "pending")
    .order("reviewed_at", { ascending: false })
    .limit(20);
  return data || [];
}

async function approveNomination(formData: FormData) {
  "use server";
  if (!adminSupabase) return;
  const id = String(formData.get("id"));

  const { data: submission, error: fetchError } = await adminSupabase
    .from("nomination_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !submission) {
    redirect(`/admin/nominations?error=${encodeURIComponent(fetchError?.message ?? "Submission not found")}`);
    return;
  }

  const { data: existing } = await adminSupabase
    .from("award_nominees")
    .select("nominee_number")
    .eq("category_id", submission.category_id)
    .order("nominee_number", { ascending: false })
    .limit(1);

  const nextNumber = existing && existing.length > 0 && existing[0].nominee_number
    ? existing[0].nominee_number + 1
    : 1;

  const { error: insertError } = await adminSupabase.from("award_nominees").insert({
    category_id: submission.category_id,
    name: submission.nominee_name,
    photo_url: submission.photo_url,
    nominee_number: nextNumber,
  });

  if (insertError) {
    console.error("Promote nomination failed:", insertError.message);
    redirect(`/admin/nominations?error=${encodeURIComponent(insertError.message)}`);
    return;
  }

  await adminSupabase
    .from("nomination_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/nominations");
  revalidatePath("/admin/awards");
  revalidatePath("/awards");
  redirect("/admin/nominations?saved=1");
}

async function rejectNomination(formData: FormData) {
  "use server";
  if (!adminSupabase) return;
  const id = String(formData.get("id"));

  const { error } = await adminSupabase
    .from("nomination_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    redirect(`/admin/nominations?error=${encodeURIComponent(error.message)}`);
    return;
  }

  revalidatePath("/admin/nominations");
  redirect("/admin/nominations?saved=1");
}

export default async function NominationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [pending, reviewed] = await Promise.all([
    getPendingNominations(),
    getReviewedNominations(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">Admin Panel</p>
            <h1 className="text-2xl font-black text-slate-900">
              Nominations{" "}
              {pending.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-black text-white align-middle">
                  {pending.length} pending
                </span>
              )}
            </h1>
          </div>
          <a href="/admin/awards" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50">
            ← Awards Admin
          </a>
        </div>

        {params.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center text-sm font-bold text-red-700">
            ❌ {params.error}
          </div>
        )}

        {params.saved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center text-sm font-bold text-green-700">
            ✅ Saved successfully!
          </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="font-black text-white">Pending Review</h2>
          </div>
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium text-sm">No pending nominations right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map((nom: any) => (
                <div key={nom.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {nom.photo_url ? (
                      <img src={nom.photo_url} alt={nom.nominee_name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0">
                        No photo
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        {nom.award_categories?.group_name ? `${nom.award_categories.group_name} · ` : ""}
                        {nom.award_categories?.name ?? "Unknown category"}
                      </p>
                      <p className="font-black text-slate-900">{nom.nominee_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nominated by {nom.nominator_name} · {nom.nominator_email}
                        {nom.nominator_phone ? ` · ${nom.nominator_phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveNomination}>
                      <input type="hidden" name="id" value={nom.id} />
                      <button type="submit" className="rounded-full bg-green-600 px-4 py-2 text-xs font-black text-white hover:bg-green-700">
                        Approve
                      </button>
                    </form>
                    <form action={rejectNomination}>
                      <input type="hidden" name="id" value={nom.id} />
                      <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {reviewed.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900">Recently Reviewed</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {reviewed.map((nom: any) => (
                <div key={nom.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{nom.nominee_name}</p>
                    <p className="text-xs text-slate-400">
                      {nom.award_categories?.name ?? "Unknown category"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      nom.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {nom.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
