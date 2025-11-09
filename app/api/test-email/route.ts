// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendNextLinkEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");
  if (!to) return NextResponse.json({ error: "Provide ?to=" }, { status: 400 });

  const base = (process.env.APP_URL || "").replace(/\/+$/, "");
  const nextUrl = base ? `${base}/e/demo?role=supervisor` : "APP_URL not set";

  const res = await sendNextLinkEmail({
    to,
    role: "supervisor",
    nextUrl,
    unitCode: "AURTTE104",
  });

  return NextResponse.json(res);
}
