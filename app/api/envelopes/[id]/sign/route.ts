// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signLinkToken } from "@/lib/jwt";
import { sendNextLinkEmail } from "@/lib/email";

type Params = { params: { id: string } };

type Role = "student" | "supervisor" | "assessor";

type Body = {
  role: Role;
  dataUrl?: string; // signature dataUrl (PNG)
};

const APP_URL = process.env.APP_URL!; // e.g. https://digital-declaration101.vercel.app

export async function POST(req: Request, { params }: Params) {
  const { id } = params;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { role, dataUrl } = body || {};
  if (!role) {
    return NextResponse.json({ error: "role_required" }, { status: 400 });
  }

  const env = await db.getEnvelope(id);
  if (!env) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Persist signature + move status forward
  // Your db layer likely expects these exact field names; adjust if needed.
  let nextRole: Role | null = null;

  if (role === "student") {
    await db.updateEnvelope(id, {
      studentSignature: dataUrl || "",
      status: "awaiting_supervisor",
    });
    nextRole = "supervisor";
  } else if (role === "supervisor") {
    await db.updateEnvelope(id, {
      supervisorSignature: dataUrl || "",
      status: "awaiting_assessor",
    });
    nextRole = "assessor";
  } else if (role === "assessor") {
    await db.updateEnvelope(id, {
      assessorSignature: dataUrl || "",
      status: "completed",
    });
    nextRole = null;
  }

  // Notify next actor (if there is one and we have their email)
  try {
    if (nextRole) {
      const token = await signLinkToken({ id, role: nextRole });
      const nextUrl = `${APP_URL}/e/${token}`;
      const unitCode: string = env.envelope?.unit_code || env.unit_code || "AURTTE104";

      if (nextRole === "supervisor" && env.supervisorEmail) {
        await sendNextLinkEmail(env.supervisorEmail, "supervisor", nextUrl, unitCode);
      } else if (nextRole === "assessor" && env.assessorEmail) {
        await sendNextLinkEmail(env.assessorEmail, "assessor", nextUrl, unitCode);
      }
    }
  } catch (err) {
    // Email failure should not block the signing success; log it and continue.
    console.error("[email]", err);
  }

  return NextResponse.json({ ok: true });
}
