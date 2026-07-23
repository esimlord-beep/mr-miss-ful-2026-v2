import { browserSupabase } from "@/lib/supabase";
import { submitNomination } from "@/app/nominate/actions";
import { SubmitButton } from "./submit-button";
import { CheckCircle2, Trophy } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

async function getActiveCategories() {
  if (!browserSupabase) return [];
  const { data } = await browserSupabase
    .from("award_categories")
    .select("id, name, group_name")
    .order("group_name", { ascending: true })
    .order("category_number", { ascending: true });
  return data || [];
}

export default async function NominatePage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const categories = await getActiveCategories();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <RevealOnScroll>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F3EE] pt-16 pb-12 px-5 text-center">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#D4AF37]/[0.12] blur-3xl" />
        <div className="relative mx-auto max-w-lg">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/10">
            <Trophy size={20} strokeWidth={1.75} className="text-[#B8901F]" />
          </div>
          <h1 className="font-rounded text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            Nominate for FUL Awards 2026
          </h1>
          <p className="mt-2 text-[14px] sm:text-[15px] text-[#0B132B]/55 font-medium">
            Know someone who deserves recognition? Submit their name below. Approved nominations
            will appear on the official awards page for voting.
          </p>
        </div>
      </section>
      </RevealOnScroll>

      <div className="mx-auto max-w-lg px-5 py-10">
        {params.submitted && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Nomination submitted!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Our team will review it before it appears on the awards page.
              </p>
            </div>
          </div>
        )}

        {params.error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}

        {categories.length === 0 ? (
          <RevealOnScroll>
          <div className="text-center py-12 bg-white rounded-2xl border border-[#0B132B]/[0.08] shadow-sm shadow-[#0B132B]/[0.04]">
            <p className="text-[#0B132B]/50 font-medium text-sm">
              Nominations are not open right now. Please check back later.
            </p>
          </div>
          </RevealOnScroll>
        ) : (
          <RevealOnScroll>
          <form
            action={submitNomination}
            encType="multipart/form-data"
            className="bg-white rounded-2xl border border-[#0B132B]/[0.08] shadow-sm shadow-[#0B132B]/[0.04] p-6 space-y-5"
          >
            <div>
              <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                Award Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                required
                className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="" disabled selected>
                  Select a category
                </option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.group_name ? `${cat.group_name}: ` : ""}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1 border-t border-[#0B132B]/[0.08]">
              <p className="font-rounded text-xs font-bold uppercase tracking-wider text-[#0B132B]/35 mb-3">
                Who are you nominating?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                    Nominee's Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nominee_name"
                    required
                    placeholder="e.g. Amaka Nwosu"
                    className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors placeholder:text-[#0B132B]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                    Nominee's Photo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="w-full text-sm font-semibold text-[#0B132B]/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#D4AF37]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#0B132B] file:cursor-pointer hover:file:bg-[#D4AF37]/15"
                  />
                  <p className="mt-1.5 text-[11px] text-[#0B132B]/40">
                    A clear photo of the person you're nominating.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-[#0B132B]/[0.08]">
              <p className="font-rounded text-xs font-bold uppercase tracking-wider text-[#0B132B]/35 mb-3">
                Your Details
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nominator_name"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors placeholder:text-[#0B132B]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="nominator_email"
                    required
                    placeholder="johndoe@gmail.com"
                    className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors placeholder:text-[#0B132B]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B132B]/70 mb-1.5">
                    Your Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    name="nominator_phone"
                    placeholder="08012345678"
                    className="w-full rounded-xl border border-[#0B132B]/15 px-3 py-2.5 text-sm font-semibold text-[#0B132B] outline-none focus:border-[#D4AF37] transition-colors placeholder:text-[#0B132B]/30"
                  />
                </div>
              </div>
            </div>

            <SubmitButton />
          </form>
          </RevealOnScroll>
        )}
      </div>
    </div>
  );
}
