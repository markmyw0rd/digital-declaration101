// app/api/envelopes/[id]/sign/route.ts
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

// Decode our simple base64url token used in mock mode (and as fallback)
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

    const { token, signatureDataUrl, formPatch, nextEmail } = body || {};
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const { envId, role } = decodeToken(String(token));
    if (!envId || !role) return NextResponse.json({ error: "Bad token" }, { status: 400 });

    const appUrl =
      process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    // ────────────────────────── MOCK MODE ──────────────────────────
    if (!DB_READY) {
      // just generate the next-role token and link
      let nextRole: "supervisor" | "assessor" | null = null;
      if (role === "student") nextRole = "supervisor";
      else if (role === "supervisor") nextRole = "assessor";
      else nextRole = null; // assessor will finish via /complete

      if (!nextRole) {
        return NextResponse.json({
          ok: true,
          message: "Assessor should use /complete to finalise.",
        });
      }

      const nextToken = Buffer.from(
        JSON.stringify({ envId, role: nextRole })
      ).toString("base64url");

      // In real mode you’d email nextEmail here. We just return the link.
      const nextUrl = `${appUrl}/e/${nextToken}`;
      return NextResponse.json({ ok: true, next: nextUrl, mode: "mock" });
    }

    // ─────────────────────────── DB MODE ───────────────────────────
    // 1) Read current envelope state
    const envRes = await sql`
      SELECT e.id, e.status, u.code AS unit_code
      FROM envelopes e
      JOIN units u ON u.id = e.unit_id
      WHERE e.id = ${envId}
      LIMIT 1
    `;
    if (!envRes?.rows?.length) {
      return NextResponse.json({ error: "Envelope not found" }, { status: 404 });
    }
    const env = envRes.rows[0] as { id: string; status: string; unit_code: string };

    // 2) Mark this party as signed (store signature if you like)
    // NOTE: you can store signatureDataUrl to storage and keep a URL here; we skip for brevity.
    await sql`
      UPDATE envelope_parties
      SET signed_at = NOW()
      WHERE envelope_id = ${env.id} AND role = ${role}
    `;

    // 3) Advance state & compute next role
    let nextRole: "supervisor" | "assessor" | null = null;
    let nextStatus: "awaiting_supervisor" | "awaiting_assessor" | "completed" | null = null;

    if (role === "student" && env.status === "awaiting_student") {
      nextRole = "supervisor";
      nextStatus = "awaiting_supervisor";
    } else if (role === "supervisor" && env.status === "awaiting_supervisor") {
      nextRole = "assessor";
      nextStatus = "awaiting_assessor";
    } else if (role === "assessor" && env.status === "awaiting_assessor") {
      // assessor signs, but finalise is in /complete (checklist/outcome+PDF)
      nextRole = null;
      nextStatus = "awaiting_assessor";
    } else {
      // out-of-order signing => keep status as-is but don’t crash
      nextRole = null;
      nextStatus = null;
    }

    if (nextStatus) {
      await sql`UPDATE envelopes SET status = ${nextStatus} WHERE id = ${env.id}`;
    }

    if (!nextRole) {
      return NextResponse.json({ ok: true, message: "No next role (assessor finishes via /complete)", mode: "db" });
    }

    const nextToken = Buffer.from(
      JSON.stringify({ envId: env.id, role: nextRole })
    ).toString("base64url");
    const nextUrl = `${appUrl}/e/${nextToken}`;

    // (Optional) email `nextEmail` using Resend here; we simply return the link
    return NextResponse.json({ ok: true, next: nextUrl, mode: "db" });
  } catch (e) {
    return jsonErr(e, 500);
  }
}

export async function HEAD() {
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Access-Control-Allow-Methods", "POST,HEAD,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}
