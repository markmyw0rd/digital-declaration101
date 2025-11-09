// app/api/e/[token]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";

type Params = { params: { token: string } };

/**
 * GET /api/e/[token]
 * - verifies the token
 * - confirms the envelope exists
 * - sets a short-lived, httpOnly cookie that /e/[token] page reads
 * Returns 204 on success (no body).
 */
export async function GET(_req: Request, { params }: Params) {
  const { token } = params;

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const env = await db.getEnvelope(payload.id);
  if (!env) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  cookies().set("ev", JSON.stringify(payload), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return new NextResponse(null, { status: 204 });
}
