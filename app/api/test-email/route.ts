// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const to = (url.searchParams.get("to") || "").trim();

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Missing ?to=email@example.com" },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      console.warn("[test-email] No RESEND_API_KEY set — skipping send.");
      return NextResponse.json(
        { ok: false, error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM, // use onboarding@resend.dev until you verify your domain
      to,
      subject: "Digital Declaration • Test email",
      html: `<p>This is a test email from the Digital Declaration app.</p>
             <p>If you can read this, outbound email works.</p>`,
    });

    if (error) {
      console.error("[test-email] Resend error:", error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    console.log("[test-email] Sent:", data?.id);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err: any) {
    console.error("[test-email] Uncaught:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
