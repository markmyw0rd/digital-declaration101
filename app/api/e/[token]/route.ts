// app/api/e/[token]/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Params = { params: { token: string } };

export async function GET(_req: Request, { params }: Params) {
  const { token } = params;

  const payload = await verifyToken<{ id: string; role: "student"|"supervisor"|"assessor" }>(token);
  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // Redirect old-style links to the new role-specific pages.
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const dest = `${base}/${payload.role}/${token}`;
  return NextResponse.redirect(dest);
}
