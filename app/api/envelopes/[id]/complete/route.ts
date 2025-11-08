import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/jwt";
import { buildPdf } from "../../../../../lib/pdf";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { token, outcome, assessorEmail, notifyAll = true } = await req.json();

  const claims = verifyToken<{ envId: string; role: string }>(token);
  if (claims.envId !== params.id || claims.role !== "assessor") {
    return new Response("Forbidden", { status: 403 });
  }

  // Mark assessor as signed
  await sql`
    UPDATE envelope_parties
    SET status='signed', signed_at=now()
    WHERE envelope_id=${params.id} AND role='assessor'
  `;

  // ⬇️ Save assessor outcome into jsonb (stringify to satisfy 'Primitive')
  const outcomeJson = JSON.stringify({ assessorOutcome: outcome });
  await sql`
    INSERT INTO form_data (envelope_id, json)
    VALUES (${params.id}, ${outcomeJson}::jsonb)
    ON CONFLICT (envelope_id)
    DO UPDATE SET json = form_data.json || EXCLUDED.json
  `;

  // Mark envelope completed
  await sql`UPDATE envelopes SET status='completed' WHERE id=${params.id}`;

  // Gather data for PDF + emails
  const parties = await sql`
    SELECT role, email, signed_at, signature_blob_url
    FROM envelope_parties
    WHERE envelope_id=${params.id}
    ORDER BY role
  `;
  const fd = await sql`SELECT json FROM form_data WHERE envelope_id=${params.id}`;

  // Build PDF
  const pdfBytes = await buildPdf({ parties: parties.rows, form: fd.rows[0]?.json || {} });
  const sha256 = crypto.createHash("sha256").update(pdfBytes).digest("hex");

  // Store PDF in Blob
  const blob = await put(`pdf/${params.id}-final.pdf`, Buffer.from(pdfBytes), {
    access: "public",
    contentType: "application/pdf",
  });

  await sql`
    INSERT INTO files (envelope_id, type, url, sha256)
    VALUES (${params.id}, 'final', ${blob.url}, ${sha256})
  `;
  await sql`UPDATE envelopes SET final_pdf_url=${blob.url} WHERE id=${params.id}`;

  // Notify all parties
  if (notifyAll) {
    const recipients = parties.rows.map((p: any) => p.email);
    await resend.emails.send({
      from: "noreply@your-domain",
      to: recipients,
      subject: "Final signed PDF",
      html: `<p>Download your document: <a href="${blob.url}">${blob.url}</a></p>`,
    });
  }

  return NextResponse.json({ ok: true, finalUrl: blob.url, sha256 });
}
