// app/api/_health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const env = {
    HAS_RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM ?? null,
    APP_URL: process.env.APP_URL ?? null,
  };
  return NextResponse.json({ ok: true, env });
}
