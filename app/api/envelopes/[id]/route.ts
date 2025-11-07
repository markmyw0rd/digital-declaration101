import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db"; // ✅ fixed
import { verifyToken } from "@/lib/jwt"; // ✅ fixed

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  const claims = verifyToken<{ envId: string; role: string }>(token);
  if (claims.envId !== params.id) return new Response("Forbidden", { status: 403 });

  const env = await sql`SELECT e.id, e.status, u.code as unit_code, fd.json as form
                        FROM envelopes e
                        JOIN units u ON u.id=e.unit_id
                        LEFT JOIN form_data fd ON fd.envelope_id=e.id
                        WHERE e.id=${params.id}`;

  return NextResponse.json({ envelope: env.rows[0], role: claims.role });
}
