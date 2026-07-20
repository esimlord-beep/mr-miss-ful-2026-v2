"use server";

import { adminSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitNomination(formData: FormData) {
  if (!adminSupabase) {
    redirect("/nominate?error=Server not configured");
  }

  const category_id = String(formData.get("category_id") ?? "").trim();
  const nominee_name = String(formData.get("nominee_name") ?? "").trim();
  const nominator_name = String(formData.get("nominator_name") ?? "").trim();
  const nominator_email = String(formData.get("nominator_email") ?? "").trim();
  const nominator_phone = String(formData.get("nominator_phone") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!category_id || !nominee_name || !nominator_name || !nominator_email) {
    redirect("/nominate?error=Please fill in all required fields");
  }

  let photo_url: string | null = null;
  if (photo && photo.size > 0) {
    const ext = photo.name.split(".").pop();
    const filename = `${Date.now()}-nomination.${ext}`;
    const { data, error: uploadError } = await adminSupabase.storage
      .from("contestants")
      .upload(filename, photo, { upsert: true });

    if (uploadError) {
      console.error("Nomination photo upload failed:", uploadError.message);
      redirect("/nominate?error=Photo upload failed. Please try again.");
    }

    if (data) {
      const { data: urlData } = adminSupabase.storage.from("contestants").getPublicUrl(filename);
      photo_url = urlData.publicUrl;
    }
  }

  const { error } = await adminSupabase.from("nomination_submissions").insert({
    category_id,
    nominee_name,
    photo_url,
    nominator_name,
    nominator_email,
    nominator_phone: nominator_phone || null,
    status: "pending",
  });

  if (error) {
    console.error("Nomination submission failed:", error.message, error.details, error.hint);
    redirect(`/nominate?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/nominations");
  redirect("/nominate?submitted=1");
}
