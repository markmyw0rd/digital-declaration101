// app/api/envelopes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { signToken } from "../../../lib/jwt";
import { sendMagicLink } from "../../../lib/email";

export async function POST(req: NextRequest) {
  try {
    const { unitCode, unitName, studentEmail, studentName, supervisorEmail, assessorEmail } = await req.json();

    if (!unitCode || !studentEmail) {
      return NextResponse.json({ error: "Missing unitCode or studentEmail" }, { status: 400 });
    }

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

    const token = signToken({ envId: env.rows[0].id, role: "student" }, "7d");
    await sql`UPDATE envelopes SET current_token=${token} WHERE id=${env.rows[0].id}`;

    const url = `${process.env.APP_URL}/e/${token}`;
    await sendMagicLink(studentEmail, url, "Student");

    return NextResponse.json({ id: env.rows[0].id, next: url });
  } catch (e: any) {
    // Always return JSON so the client can parse safely
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
