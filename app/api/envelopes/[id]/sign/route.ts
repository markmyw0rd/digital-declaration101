// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sendNextLinkEmail } from "@/lib/email";

/**
 * POST /api/envelopes/[id]/sign
 * Body: { role: "student" | "supervisor" | "assessor", dataUrl?: string, supervisorEmail?: string, assessorEmail?: string }
 *
 * Saves the current role’s signature, advances status, and emails the next role.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json().catch(() => ({} as any));

  const role = body.role as "student" | "supervisor" | "assessor";
  const dataUrl = body.dataUrl as string | undefined;
  const supervisorEmail = body.supervisorEmail as string | undefined;
  const assessorEmail = body.assessorEmail as string | undefined;

  if (!id || !role) {
    return NextResponse.json({ error: "Missing id or role" }, { status: 400 });
  }

  // Load the envelope (replace with your real persistence)
  const env = await db.getEnvelope(id);
  if (!env) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const unitCode = env.unitCode ?? "AURTTE104";

  // Save the signature/data for this role
  await db.saveSignature(id, role, dataUrl);

  // Move state machine forward + build next URL
  let nextUrl: string | null = null;

  const base = (process.env.APP_URL || "").replace(/\/+$/, "");
  if (!base) {
    console.warn("[sign] APP_URL not set – emails will contain no link.");
  }

  if (role === "student") {
    // advance → awaiting_supervisor
    await db.updateStatus(id, "awaiting_supervisor");
    if (base) nextUrl = `${base}/e/${id}?role=supervisor`;
    // Email supervisor if possible
    if (supervisorEmail) {
      await sendNextLinkEmail({
        to: supervisorEmail,
        role: "supervisor",
        nextUrl: nextUrl ?? "",
        unitCode,
      });
    }
  } else if (role === "supervisor") {
    // advance → awaiting_assessor
    await db.updateStatus(id, "awaiting_assessor");
    if (base) nextUrl = `${base}/e/${id}?role=assessor`;
    // Email assessor if provided
    if (assessorEmail) {
      await sendNextLinkEmail({
        to: assessorEmail,
        role: "assessor",
        nextUrl: nextUrl ?? "",
        unitCode,
      });
    }
  } else if (role === "assessor") {
    // finalise → completed
    await db.updateStatus(id, "completed");
    // Optionally: trigger PDF generation here
  }

  return NextResponse.json({ ok: true });
}
