"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function gateLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const gatePassword = process.env.GATE_CHECKIN_PASSWORD;

  if (!gatePassword) {
    redirect("/checkin/login?error=" + encodeURIComponent("Gate password is not configured. Contact the site admin."));
  }

  if (password !== gatePassword) {
    redirect("/checkin/login?error=" + encodeURIComponent("Incorrect password."));
  }

  const cookieStore = await cookies();
  cookieStore.set("gate-access-token", gatePassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours — re-enter password the next event day
  });

  redirect("/checkin");
}
