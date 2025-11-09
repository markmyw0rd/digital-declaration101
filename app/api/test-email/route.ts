// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendNextLinkEmail } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");

  if (!to) {
    return NextResponse.json({ ok: false, error: "missing ?to=" }, { status: 400 });
  }

  const base = process.env.APP_URL || "http://localhost:3000";
  const nextUrl = `${base}/demo`;
  const unitCode = "AURTTE104";

  try {
    await sendNextLinkEmail({
      to,
      role: "supervisor",
      nextUrl,
      unitCode,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[test-email] error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "send failed" },
      { status: 500 }
    );
  }
}
