// app/api/_health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    appUrl: process.env.APP_URL ? "present" : "missing",
    resendApiKey: process.env.RESEND_API_KEY ? "present" : "missing",
    resendFrom: process.env.RESEND_FROM || "onboarding@resend.dev",
    now: new Date().toISOString(),
  });
}
