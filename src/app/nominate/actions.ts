"use server";

import { adminSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

const BUCKET = "contestants";
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1280;
const JPEG_QUALITY = 75;

async function compressImage(arrayBuffer: ArrayBuffer): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const inputBuffer = Buffer.from(arrayBuffer);

  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return { buffer: outputBuffer, contentType: "image/jpeg", extension: "jpg" };
}

export async function submitNomination(formData: FormData) {
  if (!adminSupabase) {
    redirect("/nominate?error=Server not configured");
    return;
  }

  const category_id = String(formData.get("category_id") ?? "").trim();
  const nominee_name = String(formData.get("nominee_name") ?? "").trim();
  const nominator_name = String(formData.get("nominator_name") ?? "").trim();
  const nominator_email = String(formData.get("nominator_email") ?? "").trim();
  const nominator_phone = String(formData.get("nominator_phone") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!category_id || !nominee_name || !nominator_name || !nominator_email) {
    redirect("/nominate?error=Please fill in all required fields");
    return;
  }

  let photo_url: string | null = null;
  if (photo && photo.size > 0) {
    try {
      const arrayBuffer = await photo.arrayBuffer();
      const { buffer, contentType, extension } = await compressImage(arrayBuffer);

      const safeBase = nominee_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const filename = `${Date.now()}-${safeBase}.${extension}`;

      const { data, error: uploadError } = await adminSupabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType, upsert: false });

      if (uploadError) {
        console.error("Nomination photo upload failed:", uploadError.message);
        redirect("/nominate?error=Photo upload failed. Please try again.");
        return;
      }

      if (data) {
        const { data: urlData } = adminSupabase.storage.from(BUCKET).getPublicUrl(filename);
        photo_url = urlData.publicUrl;
      }
    } catch (err) {
      console.error("Nomination photo compression/upload failed:", err);
      redirect("/nominate?error=Photo upload failed. Please try again.");
      return;
    }
  }

  // Check if this exact nominee has already been nominated for this category
  const { data: existingMatches, error: lookupError } = await adminSupabase
    .from("nomination_submissions")
    .select("id, nomination_count")
    .eq("category_id", category_id)
    .ilike("nominee_name", nominee_name)
    .neq("status", "rejected")
    .order("created_at", { ascending: true });

  if (lookupError) {
    console.error("Nomination lookup failed:", lookupError.message, lookupError.details, lookupError.hint);
    redirect(`/nominate?error=${encodeURIComponent(lookupError.message)}`);
    return;
  }

  const existingNomination = existingMatches && existingMatches.length > 0 ? existingMatches[0] : null;

  if (existingNomination) {
    const { error: updateError } = await adminSupabase
      .from("nomination_submissions")
      .update({ nomination_count: (existingNomination.nomination_count ?? 1) + 1 })
      .eq("id", existingNomination.id);

    if (updateError) {
      console.error("Nomination count update failed:", updateError.message, updateError.details, updateError.hint);
      redirect(`/nominate?error=${encodeURIComponent(updateError.message)}`);
      return;
    }

    revalidatePath("/admin/nominations");
    redirect("/nominate?submitted=1");
    return;
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
    return;
  }

  revalidatePath("/admin/nominations");
  redirect("/nominate?submitted=1");
}
