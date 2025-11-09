// lib/email.ts
import { Resend } from "resend";

type SendNextLinkEmailOpts = {
  to: string;
  role: "student" | "supervisor" | "assessor";
  nextUrl: string;
  unitCode: string;
};

/**
 * Sends the “next step” email using Resend.
 * Falls back to console logging if RESEND_API_KEY is not set.
 */
export async function sendNextLinkEmail(opts: SendNextLinkEmailOpts) {
  const { to, role, nextUrl, unitCode } = opts;

  // Allow local testing without email
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:DRY_RUN] to=%s role=%s unit=%s url=%s", to, role, unitCode, nextUrl);
    return { ok: true, dryRun: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Sender must be a verified domain/sender in Resend.
  // For first test you can set RESEND_FROM=onboarding@resend.dev
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  const subject =
    role === "supervisor"
      ? `[${unitCode}] Declaration ▸ Supervisor Step`
      : `[${unitCode}] Declaration ▸ Assessor Step`;

  const html = `
    <h3>${unitCode} Digital Declaration</h3>
    <p>Please complete the <b>${role}</b> section.</p>
    <p><a href="${nextUrl}">Open here</a></p>
    <p>If the button doesn't work, copy and paste this link:<br/>
    <code>${nextUrl}</code></p>
    <p>Thank you,<br/>Allora College</p>
  `;

  try {
    const res = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    console.log("[email:SENT] id=%s to=%s role=%s", (res as any)?.id ?? "-", to, role);
    return { ok: true, id: (res as any)?.id ?? null };
  } catch (err) {
    console.error("[email:ERROR]", err);
    return { ok: false, error: String(err) };
  }
}
