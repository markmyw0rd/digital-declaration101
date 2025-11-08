import { Resend } from "resend";

/** Lazily create a Resend client; return null if key is missing. */
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Build-safe: don't throw—just no-op and log.
    console.warn("[email] RESEND_API_KEY missing; emails will be skipped.");
    return null;
  }
  try {
    return new Resend(key);
  } catch {
    console.warn("[email] Failed to init Resend; emails will be skipped.");
    return null;
  }
}

export async function sendMagicLink(to: string, url: string, role: string) {
  const resend = getResend();
  if (!resend) return; // no-op if no key

  await resend.emails.send({
    from: "noreply@your-domain",
    to,
    subject: `Your ${role} link`,
    html: `<p>Click to continue: <a href="${url}">${url}</a></p>`,
  });
}

export async function sendFinalPdf(recipients: string[], url: string) {
  const resend = getResend();
  if (!resend) return; // no-op if no key

  await resend.emails.send({
    from: "noreply@your-domain",
    to: recipients,
    subject: "Final signed PDF",
    html: `<p>Download your document: <a href="${url}">${url}</a></p>`,
  });
}
