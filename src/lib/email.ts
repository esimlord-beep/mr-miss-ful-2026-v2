export async function sendVoteConfirmationEmail({
  to,
  payerName,
  votedFor,
  voteQuantity,
  amountPaid,
  reference,
  type
}: {
  to: string;
  payerName: string;
  votedFor: string;
  voteQuantity: number;
  amountPaid: number;
  reference: string;
  type: "main" | "award";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is missing — email not sent.");
    return;
  }

  const eventLabel = type === "award" ? "FUL Awards 2026" : "Mr & Miss FUL 2026";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `${eventLabel} <noreply@fulsugnight.online>`,
      to: [to],
      subject: `Vote Confirmed — ${eventLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
          <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #d97706; margin-bottom: 4px;">${eventLabel}</p>
          <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 16px;">🎉 Your Vote is Confirmed!</h1>
          <p>Hi ${payerName},</p>
          <p>Thank you for voting! Here's a summary of your transaction:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #64748b;">Voted For</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">${votedFor}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Votes</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">${voteQuantity}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Amount Paid</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">₦${amountPaid.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Reference</td><td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 12px;">${reference}</td></tr>
          </table>
          <p style="font-size: 13px; color: #64748b;">If you have any questions about this transaction, please contact our support team.</p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 32px;">© 2026 Mr & Miss FUL · Federal University Lokoja SUG</p>
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
