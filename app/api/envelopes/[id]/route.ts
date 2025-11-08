// app/api/whoami/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Body contains a token string created earlier.
 * In mock/dev we simply base64url-decode it:
 *   eyJ...  -> { envId: string, role: "student"|"supervisor"|"assessor" }
 * Always returns JSON, never throws HTML.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await req.text(); // raw body is the token string
    if (!token || token.length > 4096) {
      return NextResponse.json({ error: "Missing or invalid token" }, { status: 400 });
    }

    // base64url decode (works for our mock tokens)
    let payload: any = null;
    try {
      const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
      const str = Buffer.from(normalized, "base64").toString("utf8");
      payload = JSON.parse(str);
    } catch {
      // If it’s not JSON, still return something readable for debugging
      return NextResponse.json({ error: "Bad token format" }, { status: 400 });
    }

    const { envId, role } = payload || {};
    if (!envId || !role) {
      return NextResponse.json({ error: "Token missing envId/role" }, { status: 400 });
    }

    return NextResponse.json({ envId, role });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
