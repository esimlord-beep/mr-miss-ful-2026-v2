import { adminSupabase } from "@/lib/supabase";

export async function sendVoteConfirmationEmail({
  to,
  payerName,
  votedFor,
  voteQuantity,
  amountPaid,
  reference,
  type,
  provider
}: {
  to: string;
  payerName: string;
  votedFor: string;
  voteQuantity: number;
  amountPaid: number;
  reference: string;
  type: "main" | "award";
  provider?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing — email not sent.");
    return;
  }

  const eventLabel = type === "award" ? "FUL Awards 2026" : "Mr & Miss FUL 2026";
  const providerLabel = provider === "flutterwave" ? "Flutterwave" : "Paystack";

  const now = new Date();
  const dateTime = now.toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos"
  });

  let logoUrl: string | null = null;
  if (adminSupabase) {
    const { data: settings } = await adminSupabase
      .from("settings")
      .select("primary_logo")
      .limit(1)
      .maybeSingle();
    logoUrl = settings?.primary_logo ?? null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "FUL SUG Night <noreply@fulsugnight.online>",
      reply_to: "support@fulsugnight.online",
      to: [to],
      subject: `Vote confirmed for ${votedFor}: ${eventLabel}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#FAF9F6;">

          <div style="background:#FAF9F6;padding:28px 24px;text-align:center;border-bottom:3px solid #D4AF37;">
            ${logoUrl ? `<img src="${logoUrl}" alt="${eventLabel}" style="height:44px;width:auto;margin-bottom:10px;" />` : ""}
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#B8901F;margin:0;">
              ${eventLabel}
            </p>
          </div>

          <div style="padding:28px 24px;">

            <h1 style="font-size:20px;font-weight:800;margin:0 0 16px;color:#0B132B;">
              Your vote has been recorded
            </h1>

            <p style="margin:0 0 16px;color:#0B132B;font-size:14px;">
              Hi ${payerName},
            </p>

            <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
              Thank you for voting. Your payment was successful and your votes have been added. Here are the details of your transaction:
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Voted for</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${votedFor}</td>
              </tr>

              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Votes purchased</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${voteQuantity}</td>
              </tr>

              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Amount paid</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">₦${amountPaid.toLocaleString()}</td>
              </tr>

              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Payment method</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${providerLabel}</td>
              </tr>

              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;">Reference</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;font-size:11px;color:#0B132B;">${reference}</td>
              </tr>

              <tr>
                <td style="padding:10px 0;color:#64748b;">Date and time</td>
                <td style="padding:10px 0;font-weight:700;text-align:right;color:#0B132B;">${dateTime}</td>
              </tr>
            </table>

            <div style="background:#F5F3EE;border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="font-size:13px;font-weight:700;color:#0B132B;margin:0 0 6px;">
                Questions about this transaction?
              </p>

              <p style="font-size:13px;color:#64748b;margin:0 0 8px;line-height:1.5;">
                Reply to this email or reach our support team directly, and please include your reference number above.
              </p>

              <p style="font-size:13px;margin:0;">
                <a href="mailto:support@fulsugnight.online" style="color:#B8901F;font-weight:700;text-decoration:none;">
                  support@fulsugnight.online
                </a>
                &nbsp;·&nbsp;
                <a href="https://wa.me/2348105789086" style="color:#B8901F;font-weight:700;text-decoration:none;">
                  WhatsApp support
                </a>
              </p>
            </div>

   <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

<div style="text-align:center;padding:8px 0 0;">

  <p style="font-size:12px;color:#94a3b8;line-height:1.7;margin:0;">
    This is an automated confirmation email. Please keep it for your records.
  </p>

  <p style="font-size:12px;color:#94a3b8;line-height:1.7;margin:8px 0 0;">
    © 2026 Mr &amp; Miss FUL. All rights reserved.
  </p>

  <p style="font-size:13px;color:#64748b;margin:18px 0 0;">
    Designed with
    <span style="color:#ef4444;">❤️</span>
    by
    <a href="https://instagram.com/esimwebstudio"
       target="_blank"
       style="color:#D4AF37;font-weight:700;text-decoration:none;">
      Esim Web Studio
    </a>
  </p>

</div>

</div>

          </div>
        </div>
      `
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend API error:", response.status, errorBody);
  } else {
    console.log("Confirmation email sent successfully to:", to);
  }
}
