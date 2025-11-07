import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyToken, signToken } from "@/lib/jwt";
import { put } from "@vercel/blob";
import { sendMagicLink } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: { id: string } }){
  const { token, signatureDataUrl, formPatch, nextEmail } = await req.json();
  const claims = verifyToken<{envId:string, role:"student"|"supervisor"|"assessor"}>(token);
  if (claims.envId !== params.id) return new Response("Forbidden",{status:403});

  await sql`INSERT INTO form_data (envelope_id, json) VALUES (${params.id}, ${formPatch}::jsonb)
    ON CONFLICT (envelope_id) DO UPDATE SET json=form_data.json || EXCLUDED.json`;

  if (signatureDataUrl){
    const buf = Buffer.from(signatureDataUrl.split(",")[1]||"", "base64");
    if (buf.length){
      const blob = await put(`signatures/${params.id}-${claims.role}.png`, buf, { access: "public", contentType: "image/png" });
      await sql`UPDATE envelope_parties
        SET status='signed', signed_at=now(), signature_blob_url=${blob.url}
        WHERE envelope_id=${params.id} AND role=${claims.role}`;
    }
  }

  let nextRole: "supervisor"|"assessor"|null = null;
  if (claims.role === "student"){
    await sql`UPDATE envelopes SET status='awaiting_supervisor' WHERE id=${params.id}`;
    nextRole = "supervisor";
  } else if (claims.role === "supervisor"){
    await sql`UPDATE envelopes SET status='awaiting_assessor' WHERE id=${params.id}`;
    nextRole = "assessor";
  }

  if (nextRole){
    const nextTok = signToken({ envId: params.id, role: nextRole }, "7d");
    await sql`UPDATE envelopes SET current_token=${nextTok} WHERE id=${params.id}`;
    const url = `${process.env.APP_URL}/e/${nextTok}`;
    if (nextEmail) await sendMagicLink(nextEmail, url, nextRole);
    return NextResponse.json({ ok: true, next: url });
  }

  return NextResponse.json({ ok: true });
}
