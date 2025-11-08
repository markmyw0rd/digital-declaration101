// app/api/envelopes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid any static optimization

// Detect Postgres presence (so we can serve mock data when not configured)
const DB_READY = Boolean(
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_HOST
);

// Lazy-load @vercel/postgres only if env exists
let sql: any = null;
if (DB_READY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sql = require("@vercel/postgres").sql;
}

// ---- Helpers ----
function jsonError(e: unknown, status = 500) {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json({ error: msg }, { status });
}

/**
 * GET /api/envelopes/:id
 * Returns a view model for the envelope.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // MOCK MODE: no DB configured → return minimal data so UI works
    if (!DB_READY) {
      return NextResponse.json({
        envelope: { id, unit_code: "AURTTE104", status: "awaiting_student" },
        parties: [],
        mode: "mock",
      });
    }

    // DB MODE
    const env = await sql`
      SELECT e.id, e.status, u.code AS unit_code
      FROM envelopes e
      JOIN units u ON u.id = e.unit_id
      WHERE e.id = ${id}
      LIMIT 1
    `;
    if (!env?.rows?.length) {
      return NextResponse.json({ error: "Envelope not found" }, { status: 404 });
    }

    const parties = await sql`
      SELECT role, email, signed_at, signature_blob_url
      FROM envelope_parties
      WHERE envelope_id = ${id}
      ORDER BY role
    `;

    return NextResponse.json({
      envelope: env.rows[0],
      parties: parties.rows || [],
      mode: "db",
    });
  } catch (e) {
    return jsonError(e, 500);
  }
}

/**
 * Some platforms send HEAD/OPTIONS automatically.
 * Export handlers so we never return 405 for those.
 */
export async function HEAD() {
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  // (optional) CORS headers if you ever call this cross-origin
  res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}
