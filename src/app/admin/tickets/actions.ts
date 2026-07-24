"use server";

import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTicketTier(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const seatsCovered = Number(formData.get("seats_covered") ?? 1);
  const quantityAvailable = Number(formData.get("quantity_available") ?? 0);
  const displayOrder = Number(formData.get("display_order") ?? 0);

  if (!name || price <= 0 || seatsCovered <= 0 || quantityAvailable <= 0) {
    redirect("/admin/tickets?error=" + encodeURIComponent("All fields are required and must be greater than zero."));
  }

  const { error } = await adminSupabase.from("ticket_tiers").insert({
    name,
    description: description || null,
    price,
    seats_covered: seatsCovered,
    quantity_available: quantityAvailable,
    display_order: displayOrder
  });

  if (error) {
    redirect("/admin/tickets?error=" + encodeURIComponent(`Could not create tier: ${error.message}`));
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
  redirect("/admin/tickets?saved=1");
}

export async function editTicketTier(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const seatsCovered = Number(formData.get("seats_covered") ?? 1);
  const quantityAvailable = Number(formData.get("quantity_available") ?? 0);
  const displayOrder = Number(formData.get("display_order") ?? 0);
  const isActive = formData.get("is_active") === "on";

  if (!id || !name || price <= 0 || seatsCovered <= 0 || quantityAvailable <= 0) {
    redirect("/admin/tickets?error=" + encodeURIComponent("All fields are required and must be greater than zero."));
  }

  // Guard: never let quantity_available drop below what's already sold.
  const { data: existing } = await adminSupabase
    .from("ticket_tiers")
    .select("quantity_sold")
    .eq("id", id)
    .maybeSingle();

  if (existing && quantityAvailable < existing.quantity_sold) {
    redirect(
      "/admin/tickets?error=" +
        encodeURIComponent(
          `Cannot set quantity below ${existing.quantity_sold} — that many have already been sold.`
        )
    );
  }

  const { error } = await adminSupabase
    .from("ticket_tiers")
    .update({
      name,
      description: description || null,
      price,
      seats_covered: seatsCovered,
      quantity_available: quantityAvailable,
      display_order: displayOrder,
      is_active: isActive
    })
    .eq("id", id);

  if (error) {
    redirect("/admin/tickets?error=" + encodeURIComponent(`Could not update tier: ${error.message}`));
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
  redirect("/admin/tickets?saved=1");
}

export async function deleteTicketTier(formData: FormData) {
  if (!adminSupabase) throw new Error("Supabase service role key is not configured.");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/tickets?error=" + encodeURIComponent("Missing tier id."));

  // Guard: don't allow deleting a tier that already has tickets sold against it.
  const { data: existing } = await adminSupabase
    .from("ticket_tiers")
    .select("quantity_sold, name")
    .eq("id", id)
    .maybeSingle();

  if (existing && existing.quantity_sold > 0) {
    redirect(
      "/admin/tickets?error=" +
        encodeURIComponent(
          `Cannot delete "${existing.name}" — ${existing.quantity_sold} ticket(s) already sold. Deactivate it instead.`
        )
    );
  }

  const { error } = await adminSupabase.from("ticket_tiers").delete().eq("id", id);
  if (error) {
    redirect("/admin/tickets?error=" + encodeURIComponent(`Could not delete tier: ${error.message}`));
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
  redirect("/admin/tickets?saved=1");
}
