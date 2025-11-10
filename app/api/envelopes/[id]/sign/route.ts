// app/api/envelopes/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { signLinkToken } from "@/lib/jwt";
import { sendNextLinkEmail } from "@/lib/email";

const APP_URL = process.env.APP_URL!;

type Params = { params: { id: string } };
type Role = "student" | "supervisor" | "assessor";

export async function POST(_req: Request, { params }: Params) {
  const { id } = params;

  try {
    // envelope must exist
    const env = await db.getEnvelope(id);
    if (!env) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // role comes from cookie set by /api/e/[token]
    const evCookie = cookies().get("ev")?.value;
    const current = evCookie ? (JSON.parse(evCookie) as { id: string; role: Role }) : null;
    const role = current?.role;

    if (!role) {
      return NextResponse.json({ error: "missing_role" }, { status: 400 });
    }

    // persist signature (front-end already sent dataUrl in body if you need it)
    // For this minimal fix we only move status forward.
    let nextRole: Role | null = null;

    if (role === "student") {
      await db.updateEnvelope(id, {
        status: "awaiting_supervisor",
        studentSignature: "", // or keep existing
      });
      nextRole = "supervisor";
    } else if (role === "supervisor") {
      await db.updateEnvelope(id, {
        status: "awaiting_assessor",
        supervisorSignature: "",
      });
      nextRole = "assessor";
    } else if (role === "assessor") {
      await db.updateEnvelope(id, {
        status: "completed",
        assessorSignature: "",
      });
      nextRole = null;
    }

    // if there is a next signer, email them the link
    if (nextRole) {
      const token = await signLinkToken({ id, role: nextRole });
      const nextUrl = `${APP_URL}/e/${token}`;

      // ✅ pick unit code directly from the envelope (camel OR snake)
      const unitCode: string =
        (env as any).unitCode ?? (env as any).unit_code ?? "AURTTE104";

      if (nextRole === "supervisor" && env.supervisorEmail) {
        await sendNextLinkEmail(env.supervisorEmail, "supervisor", nextUrl, unitCode);
      }
      if (nextRole === "assessor" && env.assessorEmail) {
        await sendNextLinkEmail(env.assessorEmail, "assessor", nextUrl, unitCode);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sign-route] error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
