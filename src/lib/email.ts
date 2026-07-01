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
      subject: `Vote Confirmed — ${eventLabel}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b;">

          <p style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#d97706;margin-bottom:4px;">
            ${eventLabel}
          </p>

          <h1 style="font-size:24px;font-weight:900;margin:0 0 16px;">
            🎉 Your Vote is Confirmed!
          </h1>

          <p style="margin-bottom:16px;">
            Hi <strong>${payerName}</strong>,
          </p>

          <p style="margin-bottom:20px;">
            Thank you for voting! Here's a summary of your transaction:
          </p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 0;color:#64748b;">Voted For</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;">${votedFor}</td>
            </tr>

            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 0;color:#64748b;">Votes Purchased</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;">${voteQuantity}</td>
            </tr>

            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 0;color:#64748b;">Amount Paid</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;">₦${amountPaid.toLocaleString()}</td>
            </tr>

            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 0;color:#64748b;">Payment Method</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;">${providerLabel}</td>
            </tr>

            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px 0;color:#64748b;">Transaction Reference</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;font-size:12px;">${reference}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#64748b;">Date & Time</td>
              <td style="padding:10px 0;font-weight:700;text-align:right;">${dateTime}</td>
            </tr>
          </table>

          <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 6px;">
              Need Help?
            </p>

            <p style="font-size:13px;color:#64748b;margin:0;">
              If you have any questions regarding your payment or votes, simply reply to this email or contact our support team below.
            </p>

            <p style="font-size:13px;margin:8px 0 0;">
              <a href="mailto:support@fulsugnight.online" style="color:#d97706;font-weight:700;">
                support@fulsugnight.online
              </a>

              &nbsp;·&nbsp;

              <a href="https://wa.me/2348105789086" style="color:#d97706;font-weight:700;">
                WhatsApp: +234 810 578 9086
              </a>
            </p>
          </div>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:16px;" />

          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0;">
            This is an automated confirmation sent by FUL SUG Night.<br/>
            Replies will be delivered to our support team.<br/><br/>
            © 2026 Mr & Miss FUL · Federal University Lokoja SUG · Powered by Red Ink Media Nigeria Limited
          </p>

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
