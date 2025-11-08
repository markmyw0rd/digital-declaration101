// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import Resend from "resend";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"; // safe default

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing RESEND_API_KEY env var" },
      { status: 500 }
    );
  }
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Missing ?to=email@example.com" },
      { status: 400 }
    );
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const sent = await resend.emails.send({
      from: FROM, // use onboarding@resend.dev unless your domain is verified
      to,
      subject: "✅ Resend test via digital-declaration101",
      html: `
        <h2>Test email</h2>
        <p>This was sent from <code>/api/test-email</code> on your Vercel app.</p>
      `,
    });

    return NextResponse.json({ ok: true, id: sent?.data?.id || null });
  } catch (err: any) {
    // Return the API error so you can see Rate limit / From not allowed / etc.
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
