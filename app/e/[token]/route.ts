// app/e/[token]/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Params = { params: { token: string } };

// Redirect /e/<token> ➜ /student|/supervisor|/assessor/<token>
export async function GET(req: Request, { params }: Params) {
  const { token } = params;

  // your lib/jwt.ts verifyToken returns the payload or null
  const payload = await verifyToken(token);
  if (!payload || typeof payload !== "object" || !("role" in payload)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // Build a same-origin absolute URL for the redirect
  const url = new URL(req.url);
  url.pathname = `/${(payload as any).role}/${token}`;

  return NextResponse.redirect(url);
}
