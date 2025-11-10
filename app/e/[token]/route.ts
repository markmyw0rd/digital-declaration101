// app/e/[token]/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Params = { params: { token: string } };

export async function GET(req: Request, { params }: Params) {
  const { token } = params;

  const payload = await verifyToken(token);
  if (!payload || typeof payload !== "object" || !("role" in payload)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const url = new URL(req.url); // same origin
  url.pathname = `/${(payload as any).role}/${token}`;
  return NextResponse.redirect(url);
}
