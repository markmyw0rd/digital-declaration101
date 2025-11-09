// app/api/e/[token]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyLinkToken } from "@/lib/jwt";

type Params = { params: { token: string } };

// GET /api/e/[token]
export async function GET(_req: Request, { params }: Params) {
  const { token } = params;

  // 1) Decode magic link to discover envelope + role
  const payload = await verifyLinkToken(token);
  if (!payload?.id || !payload?.role) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // 2) Ensure the envelope exists
  const env = await db.getEnvelope(payload.id);
  if (!env) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 3) Set a short httpOnly cookie the UI will read on /e/[token]
  cookies().set("ev", JSON.stringify({ id: payload.id, role: payload.role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ ok: true });
}
