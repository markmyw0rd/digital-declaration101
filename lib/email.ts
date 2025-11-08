// lib/email.ts
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

type Role = "student" | "supervisor" | "assessor";

export async function sendNextLinkEmail(opts: {
  to: string;
  role: Role;           // who we’re inviting next
  unitCode: string;
  envelopeId: string;   // record id
}) {
  const { to, role, unitCode, envelopeId } = opts;

  // Construct the next step link for the invited role
  const nextUrl = `${APP_URL}/e/${encodeURIComponent(envelopeId)}?role=${encodeURIComponent(role)}`;

  if (!RESEND_API_KEY) {
    console.warn("[email] No RESEND_API_KEY set — skipping email send.");
    console.warn("[email] Would have sent:", { to, role, unitCode, nextUrl, EMAIL_FROM });
    return { ok: false, skipped: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  const subject =
    role === "supervisor"
      ? `${unitCode} Declaration — Supervisor Step`
      : role === "assessor"
      ? `${unitCode} Declaration — Assessor Step`
      : `${unitCode} Declaration — Student Step`;

  const html = `
    <h3>${unitCode} • Digital Declaration</h3>
    <p>Please complete the <b>${role}</b> section.</p>
    <p><a href="${nextUrl}">Click here to open</a></p>
    <p>If that doesn't work, copy and paste this link:<br/>
    ${nextUrl}</p>
    <p>Thank you,<br/>Allora College</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,      // until domain is verified, keep onboarding@resend.dev here
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error };
    }

    console.log("[email] Sent:", { to, role, unitCode, id: data?.id });
    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error("[email] Uncaught error:", err);
    return { ok: false, error: String(err) };
  }
}
