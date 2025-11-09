// app/api/e/[token]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";           // uses db.getEnvelope(id)
import { verifyLinkToken } from "@/lib/jwt"; // returns { id: string, role: "student"|"supervisor"|"assessor" }

type Params = { params: { token: string } };

// GET /api/e/:token
export async function GET(_req: Request, { params }: Params) {
  const { token } = params;

  try {
    // 1) Decode the magic token to discover envelope + role
    const payload = await verifyLinkToken(token);
    if (!payload?.id || !payload?.role) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    // 2) Make sure the envelope exists
    const env = await db.getEnvelope(payload.id);
    if (!env) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 3) Set a short, httpOnly cookie the UI will read on /e/[token]
    //    Keep it simple: just remember envelope id + current role
    cookies().set("ev", JSON.stringify({ id: payload.id, role: payload.role }), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 4) Done — page will continue to load
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/e/:token] failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
