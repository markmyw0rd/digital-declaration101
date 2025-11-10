// app/api/e/[token]/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Role = "student" | "supervisor" | "assessor";
type Params = { params: { token: string } };

export async function GET(req: Request, { params }: Params) {
  const { token } = params;

  // verifyToken is non-generic in your project; cast the result safely.
  const payload = (await verifyToken(token)) as
    | { id: string; role: Role }
    | null;

  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  // Redirect old-style /e/<token> links to the role-specific page.
  // Use the current request URL as base to build an absolute URL.
  const url = new URL(`/${payload.role}/${token}`, req.url);
  return NextResponse.redirect(url);
}
