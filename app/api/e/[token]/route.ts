import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Params = { params: { token: string } };

export async function GET(req: Request, { params }: Params) {
  const { token } = params;

  const payload = await verifyToken(token);
  if (!payload || !payload.id || !payload.role) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // Build an absolute URL from the current request origin (no APP_URL needed)
  const url = new URL(req.url);
  const dest = new URL(`/${payload.role}/${token}`, `${url.protocol}//${url.host}`);
  return NextResponse.redirect(dest);
}
