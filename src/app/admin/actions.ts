"use server";

import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BUCKET = "contestants";

async function uploadPhoto(photo: File, name: string): Promise<string> {
 if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

 const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
 const safeBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
 const path = `${Date.now()}-${safeBase}.${extension}`;
 const arrayBuffer = await photo.arrayBuffer();

 const { error: uploadError } = await adminSupabase.storage
   .from(BUCKET)
   .upload(path, arrayBuffer, { contentType: photo.type, upsert: false });

 if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

 const { data } = adminSupabase.storage.from(BUCKET).getPublicUrl(path);
 return data.publicUrl;
}

export async function addContestant(formData: FormData) {
 if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

 const name = String(formData.get("name") ?? "").trim();
 const category = String(formData.get("category") ?? "").trim();
 const department = String(formData.get("department") ?? "").trim();
 const faculty = String(formData.get("faculty") ?? "").trim();
 const bio = String(formData.get("bio") ?? "").trim();
 const photo = formData.get("photo") as File | null;

 if (!name || !category || !department || !faculty) {
   throw new Error("Name, category, department, and faculty are required.");
 }
 if (!photo || photo.size === 0) {
   throw new Error("A photo is required.");
 }

 const photoUrl = await uploadPhoto(photo, name);

 const { count } = await adminSupabase.from("contestants").select("id", { count: "exact", head: true });
 const nextNumber = String((count ?? 0) + 1).padStart(3, "0");

 const { error } = await adminSupabase.from("contestants").insert({
   contestant_number: nextNumber,
   name,
   category,
   department,
   faculty,
   bio: bio || "—",
   photo_url: photoUrl,
   votes: 0
 });

 if (error) throw new Error(`Could not save contestant: ${error.message}`);

 revalidatePath("/");
 revalidatePath("/admin");
 redirect("/admin");
}

export async function editContestant(formData: FormData) {
 if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

 const id = String(formData.get("id") ?? "");
 const name = String(formData.get("name") ?? "").trim();
 const category = String(formData.get("category") ?? "").trim();
 const department = String(formData.get("department") ?? "").trim();
 const faculty = String(formData.get("faculty") ?? "").trim();
 const bio = String(formData.get("bio") ?? "").trim();
 const photo = formData.get("photo") as File | null;

 if (!id || !name || !category || !department || !faculty) {
   throw new Error("All fields are required.");
 }

 const updates: Record<string, string> = { name, category, department, faculty, bio: bio || "—" };

 if (photo && photo.size > 0) {
   updates.photo_url = await uploadPhoto(photo, name);
 }

 const { error } = await adminSupabase.from("contestants").update(updates).eq("id", id);
 if (error) throw new Error(`Could not update contestant: ${error.message}`);

 revalidatePath("/");
 revalidatePath("/admin");
 redirect("/admin");
}

export async function deleteContestant(formData: FormData) {
 if (!adminSupabase) {
   redirect("/admin?error=" + encodeURIComponent("Supabase service role key is not configured."));
 }

 const id = String(formData.get("id") ?? "");
 if (!id) {
   redirect("/admin?error=" + encodeURIComponent("Missing contestant id."));
 }

 const { error } = await adminSupabase.from("contestants").delete().eq("id", id);
 if (error) {
   redirect("/admin?error=" + encodeURIComponent(`Could not delete contestant: ${error.message}`));
 }

 revalidatePath("/admin");
 revalidatePath("/");
 redirect("/admin");
}

export async function saveSettings(formData: FormData) {
 if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

 const updates: Record<string, unknown> = {};
 const siteTitle = String(formData.get("site_title") ?? "").trim();
 const votePrice = String(formData.get("vote_price") ?? "").trim();
 const votingStatus = String(formData.get("voting_status") ?? "").trim();
 const awardsVotingStatus = String(formData.get("awards_voting_status") ?? "").trim();
 const votingEnd = String(formData.get("voting_end") ?? "").trim();
 const heroDescription = String(formData.get("hero_description") ?? "").trim();
 const footerText = String(formData.get("footer_text") ?? "").trim();
 const awardsTitle = String(formData.get("awards_title") ?? "").trim();
 const awardsDescription = String(formData.get("awards_description") ?? "").trim();

 if (siteTitle) updates.site_title = siteTitle;
 if (votePrice) updates.vote_price = Number(votePrice);
 if (votingStatus) updates.voting_status = votingStatus;
 if (awardsVotingStatus) updates.awards_voting_status = awardsVotingStatus;
 if (votingEnd) updates.voting_end_date = votingEnd;
 if (heroDescription) updates.hero_description = heroDescription;
 if (footerText) updates.footer_text = footerText;
 if (awardsTitle) updates.awards_title = awardsTitle;
 if (awardsDescription) updates.awards_description = awardsDescription;

 const logo = formData.get("logo") as File | null;
 if (logo && logo.size > 0) {
   updates.primary_logo = await uploadPhoto(logo, "hero-banner");
 }

 const logoSecondary = formData.get("logo_secondary") as File | null;
 if (logoSecondary && logoSecondary.size > 0) {
   updates.secondary_logo = await uploadPhoto(logoSecondary, "secondary-logo");
 }

 const { data: existing } = await adminSupabase.from("settings").select("id").limit(1).maybeSingle();

 if (existing?.id) {
   const { error } = await adminSupabase.from("settings").update(updates).eq("id", existing.id);
   if (error) throw new Error(`Could not save settings: ${error.message}`);
 } else {
   const { error } = await adminSupabase.from("settings").insert(updates);
   if (error) throw new Error(`Could not save settings: ${error.message}`);
 }

 revalidatePath("/admin");
 revalidatePath("/");
 revalidatePath("/awards");
 redirect("/admin?saved=1");
}

export async function changePassword(formData: FormData) {
 return;
}
