// app/api/envelopes/route.ts
import { NextRequest, NextResponse } from "next/server";

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

// small helpers
const jsonErr = (e: unknown, status = 500) =>
  NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status });

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    let p: any = {};
    try { p = JSON.parse(text || "{}"); } catch {}
    const { unitCode, unitName, studentEmail, studentName, supervisorEmail, assessorEmail } = p;

    if (!unitCode || !studentEmail) {
      return NextResponse.json({ error: "Missing unitCode or studentEmail" }, { status: 400 });
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return jsonErr("APP_URL env var is missing in Vercel settings.");

    // ---------- MOCK MODE (no DB configured) ----------
    if (!DB_READY) {
      const fakeId = Math.random().toString(36).slice(2, 10);
      const token = Buffer.from(JSON.stringify({ envId: fakeId, role: "student" })).toString("base64url");
      const nextUrl = `${appUrl}/e/${token}`;
      return NextResponse.json({ id: fakeId, next: nextUrl, mode: "mock" });
    }

    // ---------- REAL DB MODE ----------
    const unit = await sql`
      INSERT INTO units (code, name) VALUES (${unitCode}, ${unitName || unitCode})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const student = await sql`
      INSERT INTO users (email, name, role) VALUES (${studentEmail}, ${studentName || ""}, 'student')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const env = await sql`
      INSERT INTO envelopes (unit_id, student_id, status)
      VALUES (${unit.rows[0].id}, ${student.rows[0].id}, 'awaiting_student')
      RETURNING id
    `;
    await sql`
      INSERT INTO envelope_parties (envelope_id, role, email) VALUES
      (${env.rows[0].id}, 'student', ${studentEmail}),
      (${env.rows[0].id}, 'supervisor', ${supervisorEmail}),
      (${env.rows[0].id}, 'assessor', ${assessorEmail})
    `;

    const token = Buffer.from(JSON.stringify({ envId: env.rows[0].id, role: "student" })).toString("base64url");
    const nextUrl = `${appUrl}/e/${token}`;
    return NextResponse.json({ id: env.rows[0].id, next: nextUrl, mode: "db" });
  } catch (e) {
    return jsonErr(e, 500);
  }
}
