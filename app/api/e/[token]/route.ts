// app/api/e/[token]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";             // Uses db.getEnvelope(id)
import { verifyToken } from "@/lib/jwt";   // ✅ Correct function name

type Params = { params: { token: string } };

// GET /api/e/[token]
export async function GET(_req: Request, { params }: Params) {
  const { token } = params;

  try {
    // 1️⃣ Decode token to get envelope id + role
    const payload = await verifyToken(token);
    if (!payload?.id || !payload?.role) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    // 2️⃣ Ensure the envelope exists
    const env = await db.getEnvelope(payload.id);
    if (!env) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 3️⃣ Set a short, secure cookie so the /e/[token] page knows user+role
    cookies().set(
      "ev",
      JSON.stringify({ id: payload.id, role: payload.role }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    // ✅ Everything good
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/e/[token]] error", err);
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }
}
