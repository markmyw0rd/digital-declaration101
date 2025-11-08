import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendNextLinkEmail(
  to: string,
  role: "supervisor" | "assessor",
  nextUrl: string,
  unitCode = "AURTTE104"
) {
  if (!to) return;
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️ No RESEND_API_KEY — skipping email");
    return;
  }

  const subject =
    role === "supervisor"
      ? `${unitCode} Declaration – Supervisor Step`
      : `${unitCode} Declaration – Assessor Step`;

  const html = `
    <h3>${unitCode} Digital Declaration</h3>
    <p>Please complete the <b>${role}</b> section.</p>
    <p><a href="${nextUrl}">Click here to open</a></p>
    <p>If that doesn't work, copy and paste this link:</p>
    <p>${nextUrl}</p>
    <p>Thank you,<br>Allora College</p>
  `;

  try {
    await resend.emails.send({
      from: "Allora College <no-reply@yourdomain.com>",
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email", err);
  }
}
