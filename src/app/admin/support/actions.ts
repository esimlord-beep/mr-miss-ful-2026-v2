"use server";

import { adminSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markRead(formData: FormData) {
  if (!adminSupabase) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await adminSupabase.from("support_messages").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin/support");
}

export async function markUnread(formData: FormData) {
  if (!adminSupabase) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await adminSupabase.from("support_messages").update({ is_read: false }).eq("id", id);
  revalidatePath("/admin/support");
}

export async function archiveMessage(formData: FormData) {
  if (!adminSupabase) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await adminSupabase.from("support_messages").update({ is_archived: true, is_read: true }).eq("id", id);
  revalidatePath("/admin/support");
}

export async function unarchiveMessage(formData: FormData) {
  if (!adminSupabase) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await adminSupabase.from("support_messages").update({ is_archived: false }).eq("id", id);
  revalidatePath("/admin/support");
}

export async function deleteMessage(formData: FormData) {
  if (!adminSupabase) {
    redirect("/admin/support?error=" + encodeURIComponent("Supabase service role key is not configured."));
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin/support?error=" + encodeURIComponent("Missing message id."));
  }

  const { error } = await adminSupabase.from("support_messages").delete().eq("id", id);
  if (error) {
    redirect("/admin/support?error=" + encodeURIComponent(`Could not delete message: ${error.message}`));
  }

  revalidatePath("/admin/support");
  redirect("/admin/support?deleted=1");
}

export async function replyToMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!to || !body) {
    redirect("/admin/support?error=" + encodeURIComponent("Recipient and message body are required."));
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    redirect("/admin/support?error=" + encodeURIComponent("RESEND_API_KEY is not configured."));
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "FUL SUG Night Support <support@fulsugnight.online>",
      reply_to: "support@fulsugnight.online",
      to: [to],
      subject: subject || "Re: Your message to Mr & Miss FUL 2026 Support",
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b;white-space:pre-wrap;">${body.replace(/\n/g, "<br/>")}</div>`
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    redirect("/admin/support?error=" + encodeURIComponent(`Reply failed to send: ${errorBody}`));
  }

  if (id && adminSupabase) {
    await adminSupabase.from("support_messages").update({ replied_at: new Date().toISOString(), is_read: true }).eq("id", id);
  }

  revalidatePath("/admin/support");
  redirect("/admin/support?replied=1");
}
