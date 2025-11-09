// lib/email.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";
const resend = apiKey ? new Resend(apiKey) : null;

type Role = "supervisor" | "assessor";

export interface NextLinkEmailInput {
  to: string;
  role: Role;
  nextUrl: string;
  unitCode: string;
  from?: string;
}

/**
 * Send the "next step" link to Supervisor/Assessor.
 * Safe no-op if RESEND_API_KEY is not set.
 */
export async function sendNextLinkEmail({
  to,
  role,
  nextUrl,
  unitCode,
  from,
}: NextLinkEmailInput) {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping email.");
    return { skipped: true };
  }

  const subject =
    role === "supervisor"
      ? `${unitCode} Declaration • Supervisor step`
      : `${unitCode} Declaration • Assessor step`;

  const html = `
    <h3>${unitCode} Digital Declaration</h3>
    <p>Please complete the <b>${role}</b> section.</p>
    <p><a href="${nextUrl}">Open link</a></p>
    <p>If the link above doesn't work, copy & paste this URL:<br>${nextUrl}</p>
    <p>Thank you,<br/>Allora College</p>
  `;

  const fromAddress = from || process.env.EMAIL_FROM || "onboarding@resend.dev";

  await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject,
    html,
  });

  console.log(`[email] Sent '${subject}' to ${to}`);
  return { ok: true };
}
