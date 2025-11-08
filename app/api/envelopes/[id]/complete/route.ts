import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DB_READY = Boolean(
  process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_HOST
);

let sql: any = null;
if (DB_READY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sql = require("@vercel/postgres").sql;
}

function jsonErr(e: unknown, status = 500) {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json({ error: msg }, { status });
}

function decodeToken(token: string) {
  const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");
  return JSON.parse(json) as { envId: string; role: "student" | "supervisor" | "assessor" };
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await req.text();
    let body: any = {};
    try { body = JSON.parse(raw || "{}"); } catch { body = {}; }

    const { token, outcome } = body || {};
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const { envId, role } = decodeToken(String(token));
    if (role !== "assessor") return NextResponse.json({ error: "Only assessor can complete" }, { status: 403 });

    const appUrl =
      process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    if (!DB_READY) {
      // In mock mode, pretend PDF generated and return a dummy URL
      const finalUrl = `${appUrl}/files/mock/Declaration-${envId}.pdf`;
      return NextResponse.json({ ok: true, finalUrl, mode: "mock" });
    }

    // DB mode: mark completed
    await sql`UPDATE envelopes SET status='completed' WHERE id=${envId}`;

    // TODO: generate PDF & store URL; we return a placeholder link for now
    const finalUrl = `${appUrl}/files/db/Declaration-${envId}.pdf`;
    return NextResponse.json({ ok: true, finalUrl, mode: "db" });
  } catch (e) {
    return jsonErr(e, 500);
  }
}

export async function HEAD() { return NextResponse.json({ ok: true }); }
export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Access-Control-Allow-Methods", "POST,HEAD,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}
