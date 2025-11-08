// app/api/envelopes/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Detect if Vercel Postgres is configured.
 * If not, we run in "mock" mode so you can test the full flow without a DB.
 */
const DB_READY = Boolean(
  process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_HOST
);

// Load @vercel/postgres only when envs exist (prevents "missing_connection_string").
let sql: any = null;
if (DB_READY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sql = require("@vercel/postgres").sql;
}

const jsonError = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status });

export async function POST(req: NextRequest) {
  try {
    // Always read raw text first, then try to JSON-parse (prevents crashes on bad JSON)
    const raw = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(raw || "{}");
    } catch {
      body = {};
    }

    const {
      unitCode,
      unitName,
      studentEmail,
      studentName,
      supervisorEmail,
      assessorEmail,
    } = body;

    if (!unitCode || !studentEmail) {
      return NextResponse.json(
        { error: "Missing unitCode or studentEmail" },
        { status: 400 }
      );
    }

    // Prefer explicit APP_URL; otherwise derive from the incoming request origin
    const appUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin;

    // ───────────────────────────────────────────────────────────────────────────
    // MOCK MODE (no Postgres configured)
    // ───────────────────────────────────────────────────────────────────────────
    if (!DB_READY) {
      const fakeId = Math.random().toString(36).slice(2, 10);
      // minimal, stateless token (you can swap for your JWT later)
      const token = Buffer.from(
        JSON.stringify({ envId: fakeId, role: "student" })
      ).toString("base64url");
      const nextUrl = `${appUrl}/e/${token}`;

      return NextResponse.json({ id: fakeId, next: nextUrl, mode: "mock" });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // DB MODE (Vercel Postgres present)
    // Assumes you created tables: units, users, envelopes, envelope_parties
    // ───────────────────────────────────────────────────────────────────────────

    // 1) Ensure unit
    const unit = await sql`
      INSERT INTO units (code, name)
      VALUES (${unitCode}, ${unitName || unitCode})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `;

    // 2) Ensure student user
    const student = await sql`
      INSERT INTO users (email, name, role)
      VALUES (${studentEmail}, ${studentName || ""}, 'student')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `;

    // 3) Create envelope
    const env = await sql`
      INSERT INTO envelopes (unit_id, student_id, status)
      VALUES (${unit.rows[0].id}, ${student.rows[0].id}, 'awaiting_student')
      RETURNING id;
    `;

    // 4) Register parties (emails may be null/empty, that’s okay for now)
    await sql`
      INSERT INTO envelope_parties (envelope_id, role, email) VALUES
      (${env.rows[0].id}, 'student', ${studentEmail}),
      (${env.rows[0].id}, 'supervisor', ${supervisorEmail || null}),
      (${env.rows[0].id}, 'assessor', ${assessorEmail || null});
    `;

    // 5) Build next link (student step)
    const token = Buffer.from(
      JSON.stringify({ envId: env.rows[0].id, role: "student" })
    ).toString("base64url");
    const nextUrl = `${appUrl}/e/${token}`;

    return NextResponse.json({ id: env.rows[0].id, next: nextUrl, mode: "db" });
  } catch (e) {
    return jsonError(e, 500);
  }
}
