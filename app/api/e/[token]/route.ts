// app/api/e/[token]/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// GET /api/e/:token
type Params = { params: { token: string } };

export async function GET(req: Request, { params }: Params) {
  const { token } = params;

  // Do NOT use a generic type argument here; our verifyToken returns unknown | null
  const payload = await verifyToken(token);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const role = (payload as any).role as "student" | "supervisor" | "assessor" | undefined;
  const id = (payload as any).id as string | undefined;
  if (!id || !role) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // Build absolute destination from the incoming request (reliable on Vercel)
  const origin = new URL(req.url).origin;
  const dest = `${origin}/${role}/${token}`;

  return NextResponse.redirect(dest);
}
